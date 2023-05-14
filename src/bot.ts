import TelegramBot from "node-telegram-bot-api";
import { CacheManager } from "./cache/CacheManager";
import { Helper } from "./helper";
import { ONEVSONECALLBACK, PAIRCALLBACKWINNER, STATISCTICS_TYPE, StatisticsType, TWOVSTWOCALLBACK, TypeOfGame, WINNERCALLBACK } from "./type";
import { Player } from "./one-vs-one/types";
import { OneVSOneService } from "./one-vs-one/OneVSOneService";
import { OneVsOneRepository } from "./one-vs-one/OneVSOneRepository";
import { createConnection } from "typeorm";
import { OneVSOne } from "./one-vs-one/OneVSOne";
import { TwoVSTwo } from "./pair-vs-pair/TwoVSTwo";
import { TwoVSTwoService } from "./pair-vs-pair/TwoVSTwoService";
import { TwoVSTwoRepository } from "./pair-vs-pair/TwoVSTwoRepository";

class Bot {
  private readonly botApi: TelegramBot
  gameIdentifier = 0
  constructor(
    token: string, 
    private readonly helper: Helper, 
    private readonly state: CacheManager,
    private readonly soloService: OneVSOneService,
    private readonly pairService: TwoVSTwoService
  ) {
    this.botApi = new TelegramBot(token, { polling: true })
  }
  start() {
    this.botApi.setMyCommands([
      {
        command: '/ping',
        description: 'Пинг всех'
      },
      {
        command: '/newgame',
        description: 'Новая партия'
      },
      {
        command: '/statistics1vs1',
        'description': 'Получить индивидуальную статистику'
      },
      { 
        command: '/statistics2vs2',
        'description': 'Статистика 2 на 2'
      }
    ])
    this.botApi.onText(/\bping\b/, (msg) => {
      this.botApi.sendMessage(msg.chat.id, process.env.USERS!)
    })
    this.botApi.onText(/\bstatistics1vs1\b/, async (msg) => {
      return this.botApi.sendMessage(msg.chat.id, 'Какую?', STATISCTICS_TYPE(TypeOfGame.ONEVSONE))
    })
    this.botApi.onText(/\bstatistics2vs2\b/, async (msg) => {
      return this.botApi.sendMessage(msg.chat.id, 'Какую?', STATISCTICS_TYPE(TypeOfGame.TWOVSTWO))
    })
    this.botApi.onText(/\bnewgame\b/, (msg) => {
      if(!this.helper.isAdmin(msg.from!.id)) return this.botApi.sendMessage(msg.chat.id, 'Ты не мой повелитель')
      return this.botApi.sendMessage(msg.chat.id, 'Тип партии', {
        'reply_markup': {
          'inline_keyboard': [
            [
              {
              text: '2vs2',
              callback_data: TypeOfGame.TWOVSTWO
              },
              {
                text: '1vs1',
                callback_data: TypeOfGame.ONEVSONE
              }
            ],
          ]
        }
      } as any)
    })
    this.botApi.onText(/\bendgame/, (msg) => {
      if(!this.helper.isAdmin(msg.from!.id)) return this.botApi.sendMessage(msg.chat.id, 'Ты не мой повелитель')
      const id = msg.text!.split('endgame')[1]
      const { player1, player2 } = this.state.get(id)
      return this.botApi.sendMessage(msg.chat.id, 'Победитель', WINNERCALLBACK(id, player1!, player2!))
    })
    this.botApi.onText(/\bendpair/, (msg) => {
      if(!this.helper.isAdmin(msg.from!.id)) return this.botApi.sendMessage(msg.chat.id, 'Ты не мой повелитель')
      const id = msg.text!.split('endpair')[1]
      const { pair1, pair2 } = this.state.get(id)
      return this.botApi.sendMessage(msg.chat.id, 'Победитель', PAIRCALLBACKWINNER(id, pair1!, pair2!))
    })
    this.botApi.onText(/\bdelete/, (msg) => {
      if(!this.helper.isAdmin(msg.from!.id)) return this.botApi.sendMessage(msg.chat.id, 'Ты не мой повелитель')
      const id = msg.text?.split('delete')[1]!
      const state = this.state.get(id)
      if(!state) return this.botApi.sendMessage(msg.chat.id, 'Нет такой игры')

      this.state.delete(id)
      return this.botApi.sendMessage(msg.chat.id, 'Удалено')
    })
    this.botApi.on('callback_query', async (cbData) => {

      if(cbData.data?.charAt(0) === '{' && !cbData.data?.includes('@')) {
        console.log(cbData.data!)
        const callbackData = JSON.parse(cbData.data!) as { gameType: TypeOfGame, statisticsType: StatisticsType }
        switch(callbackData.gameType) {
          case TypeOfGame.ONEVSONE: {
              const statistics = await this.soloService.getStatistics(callbackData.statisticsType)
              return this.botApi.sendMessage(cbData.message!.chat.id, statistics, { parse_mode: 'HTML' })
          }
          case TypeOfGame.TWOVSTWO: {
            const statistics = await this.pairService.getTotalStatisctics(callbackData.statisticsType)
            return this.botApi.sendMessage(cbData.message!.chat.id, statistics, { parse_mode: 'HTML'})
          }
          default: break;
        }
      }

      // AdminZone
      if(!this.helper.isAdmin(cbData.from.id)) return this.botApi.sendMessage(cbData.message?.chat.id!, 'Ещё раз', { 'reply_markup': cbData.message?.reply_markup! })
      switch(cbData.data) {
        case TypeOfGame.TWOVSTWO: {
          const id = String('game' + (this.gameIdentifier + 1))
          this.gameIdentifier = this.gameIdentifier + 1
          this.state.set(id, { typeOfGame: TypeOfGame.TWOVSTWO })
          return this.botApi.sendMessage(
            cbData.message?.chat.id!, 
            `Идентификатор игры, выбери бакапора`,
            TWOVSTWOCALLBACK(id)
          )
        }
        case TypeOfGame.ONEVSONE: {
          const id = String('game' + (this.gameIdentifier + 1))
          this.gameIdentifier = this.gameIdentifier + 1
          this.state.set(id, { typeOfGame: TypeOfGame.ONEVSONE })
          return this.botApi.sendMessage(
            cbData.message?.chat.id!,
            'Кто',
            ONEVSONECALLBACK(id)
          )
        }
        default: break;
      }

      const [playerName, id, winner] = cbData.data!.split('@')
      if(winner === 'winner') {
        const { player1, player2 } = this.state.get(id)
        if(playerName === player1) {
          this.state.delete(id)
          await this.soloService.save({
          player1,
          player2: player2!,
          winner: player1,
          loser: player2!
          })
          return this.botApi.sendMessage(cbData.message?.chat.id!, `Победил ${player1}, нажмите для след партии /newgame`)
        }
        this.state.delete(id)
        await this.soloService.save({
          player1: player1!,
          player2: player2!,
          winner: player2!,
          loser: player1!
        })
        return this.botApi.sendMessage(cbData.message?.chat.id!, `Победил ${player2}, нажмите для след партии /newgame`)
      }
      if(winner === 'pairwinner') {
        const { pair1, pair2 } = this.state.get(id)
        const winnerPair = JSON.parse(playerName)
        if(winnerPair.player1 === pair1?.player1 && pair1?.player2 === winnerPair.player2) {
          await this.pairService.save({
            pair1: pair1!,
            pair2: pair2!,
            winner: pair1!,
            loser: pair2!
          })
          this.state.delete(id)
          return this.botApi.sendMessage(cbData.message?.chat.id!, `Победили ${pair1?.player1 + '&' + pair1?.player2}, нажмите для след партии /newgame`)
        }
        await this.pairService.save({
          pair1: pair1!,
          pair2: pair2!,
          winner: pair2!,
          loser: pair1!
        })
        this.state.delete(id)
        return this.botApi.sendMessage(cbData.message?.chat.id!, `Победили ${pair2?.player1 + '&' + pair2?.player2}, нажмите для след партии /newgame`)
      }
      switch(playerName) {
        case Player.Boba: {
          const state = this.state.get(id)
          if(state.typeOfGame! === TypeOfGame.ONEVSONE) {
            if(state.player1) {
              this.state.set(id, { player2: Player.Boba })
              return this.botApi.sendMessage(
                cbData.message?.chat.id!,
                `${state.player1} против ${Player.Boba}, нажмите после игры чтобы поставить победителя /endgame${id}`
              )
            }
            this.state.set(id, { player1: Player.Boba })
            return this.botApi.sendMessage(
              cbData.message?.chat.id!,
              'Его рейд босс',
              ONEVSONECALLBACK(id)
            )
          }
          if(state.typeOfGame! === TypeOfGame.TWOVSTWO) {
            this.state.set(id, { 
              pair1: {
                player1: Player.Igil,
                player2: Player.Boba
              },
              pair2: {
                player1: Player.Rijiy,
                player2: Player.Rusek
              }
            })
            return this.botApi.sendMessage(
              cbData.message?.chat.id!,
              `Гуд лак? нажмите после игры чтобы поставить победителя /endpair${id} или /delete${id}`
            )
          }
        }
        case Player.Rijiy: {
          const state = this.state.get(id)
          if(state.typeOfGame! === TypeOfGame.ONEVSONE) {
            if(state.player1) {
              this.state.set(id, { player2: Player.Rijiy })
              return this.botApi.sendMessage(
                cbData.message?.chat.id!,
                `${state.player1} против ${Player.Rijiy}, нажмите после игры чтобы поставить победителя /endgame${id} или /delete${id}`
              )
            }
            this.state.set(id, { player1: Player.Rijiy })
            return this.botApi.sendMessage(
              cbData.message?.chat.id!,
              'Его рейд босс',
              ONEVSONECALLBACK(id)
            )
          }
          if(state.typeOfGame! === TypeOfGame.TWOVSTWO) {
            this.state.set(id, { 
              pair1: {
                player1: Player.Igil,
                player2: Player.Rijiy
              },
              pair2: {
                player1: Player.Boba,
                player2: Player.Rusek
              }
            })
            return this.botApi.sendMessage(
              cbData.message?.chat.id!,
              `Гуд лак? нажмите после игры чтобы поставить победителя /endpair${id} или /delete${id}`
            )
          }
        }
        case Player.Rusek: {
          const state = this.state.get(id)
          if(state.typeOfGame! === TypeOfGame.ONEVSONE) {
            if(state.player1) {
              this.state.set(id, { player2: Player.Rusek })
              return this.botApi.sendMessage(
                cbData.message?.chat.id!,
                `${state.player1} против ${Player.Rusek}, нажмите после игры чтобы поставить победителя /endgame${id} или /delete${id}`
              )
            }
            this.state.set(id, { player1: Player.Rusek })
            return this.botApi.sendMessage(
              cbData.message?.chat.id!,
              'Его рейд босс',
              ONEVSONECALLBACK(id)
            )
          }
          if(state.typeOfGame! === TypeOfGame.TWOVSTWO) {
            this.state.set(id, { 
              pair1: {
                player1: Player.Igil,
                player2: Player.Rusek,
              },
              pair2: {
                player1: Player.Boba,
                player2: Player.Rijiy
              }
            })
            return this.botApi.sendMessage(
              cbData.message?.chat.id!,
              `Гуд лак, нажмите после игры чтобы поставить победителя /endpair${id} или /delete${id}`
            )
          }
        }
        case Player.Igil: {
          const state = this.state.get(id)
          if(state.typeOfGame! === TypeOfGame.ONEVSONE) {
            if(state.player1) {
              this.state.set(id, { player2: Player.Igil })
              return this.botApi.sendMessage(
                cbData.message?.chat.id!,
                `${state.player1} против ${Player.Igil}, нажмите после игры чтобы поставить победителя /endgame${id} или /delete${id}`
              )
            }
            this.state.set(id, { player1: Player.Igil })
            return this.botApi.sendMessage(
              cbData.message?.chat.id!,
              'Его рейд босс',
              ONEVSONECALLBACK(id)
            )
          }
        }
      }
    })
    this.botApi.on("polling_error", console.log);
  }
}



createConnection({
  url: process.env.POSTGRES_URL,
  type: 'postgres',
  entities: [OneVSOne, TwoVSTwo] as any[],
  synchronize: true,
  logging: true,
}).then((connection) => {
  const bot = new Bot(
    process.env.TOKEN!, 
    new Helper(), 
    new CacheManager(), 
    new OneVSOneService(new OneVsOneRepository(connection)),
    new TwoVSTwoService(new TwoVSTwoRepository(connection))
  )
  bot.start()
})
