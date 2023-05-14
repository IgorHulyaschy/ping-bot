import { TIME } from "../helper";
import { StatisticsType } from "../type";
import { OneVSOne } from "./OneVSOne";
import { OneVsOneRepository } from "./OneVSOneRepository";
import { Player } from "./types";

export class OneVSOneService {
  constructor(private readonly repository: OneVsOneRepository) {}

  private getWinRate(wins: number, loses: number) {
    const games = Number(wins) + Number(loses)
    const winrate = wins/games * 100
    return Number(winrate.toFixed(2))
  }

  private async getStreaks(name: Player, dates: {momentFrom: string }) {
    const games = await this.repository.getWinStreak(name,  dates) as any[]
    let realWinStreak: number = 0
    games.reduce((acc: number, cur: { winner: Player, loser: Player, createdAt: Date }) => {
      if(cur.loser && cur.loser === name) {
        acc = 0
        return acc
      }
      acc += 1
      if(realWinStreak < acc) realWinStreak = acc
      return acc
    }, 0)
    const winGames = []
    let flag = true
    let i = 0
    while(flag) {
      if(!games.length || !games[i] || (games[i].loser && games[i].loser === name)) {
        flag = false
        continue
      }
      i += 1
      winGames.push(games[i])
    }
    return { bestWinStreak: realWinStreak, curWinStreak: winGames.length }
  }

  save(data: Omit<OneVSOne, 'id' | 'createdAt'>) {
    return this.repository.save(new OneVSOne(data))
  }

  async getStatistics(period: StatisticsType) {
    let dates = {} as { momentFrom: string };
    switch(period) {
      case StatisticsType.DAILY: {
        dates.momentFrom = new Date(new Date().setHours(0, 0)).toISOString()
        break;
      }
      case StatisticsType.MONTHLY: {
        dates.momentFrom = new Date(new Date(Date.now() - TIME.MONTH).setHours(0, 0)).toISOString()
        break;
      }
    }

    const [igilWinStreak, bobaWinStreak, rusekWinStreak, rijiyWinStreak] = await Promise.all([
      this.getStreaks(Player.Igil, dates),
      this.getStreaks(Player.Boba, dates),
      this.getStreaks(Player.Rusek, dates),
      this.getStreaks(Player.Rijiy, dates)
    ])

    const [statistics] = await this.repository.getStatistics(dates)
    const ihorWinRate = this.getWinRate(Number(statistics.ihorwins) || 0, Number(statistics.ihorloses) || 0)
    const bobaWinRate = this.getWinRate(Number(statistics.bobawins) || 0, Number(statistics.bobaloses) || 0)
    const rijiyWinRate = this.getWinRate(Number(statistics.rijiywins) || 0, Number(statistics.rijiyloses) || 0)
    const rusekWinRate = this.getWinRate(Number(statistics.rusekwins) || 0, Number(statistics.rusekloses) || 0)
    return `<b>${Player.Igil}:</b>\n  🟢Побед - ${
      statistics.ihorwins || 0
    },\n  🔴Поражений - ${
      statistics.ihorloses || 0
    },\n  ${ihorWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      ihorWinRate + '%'
    },\n  🏆BestWinStreak - ${
      igilWinStreak.bestWinStreak
    },\n  🏆CurrentWinStreak - ${
      igilWinStreak.curWinStreak
    }\n\n<b>${Player.Boba}</b>:\n  🟢Побед - ${
      statistics.bobawins || 0
    },\n  🔴Поражений - ${
      statistics.bobaloses || 0
    },\n  ${bobaWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      bobaWinRate + '%'
    },\n  🏆BestWinStreak - ${
      bobaWinStreak.bestWinStreak
    },\n  🏆CurrentWinStreak - ${
      bobaWinStreak.curWinStreak
    }\n\n<b>${Player.Rijiy}</b>:\n  🟢Побед - ${
      statistics.rijiywins || 0
    },\n  🔴Поражений - ${
      statistics.rijiyloses || 0
    },\n  ${rijiyWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      rijiyWinRate + '%'
    },\n  🏆BestWinStreak - ${
      rijiyWinStreak.bestWinStreak
    },\n  🏆CurrentWinStreak - ${
      rijiyWinStreak.curWinStreak
    }\n\n<b>${Player.Rusek}</b>:\n  🟢Побед - ${
      statistics.rusekwins || 0
    },\n  🔴Поражений - ${
      statistics.rusekloses || 0
    },\n  ${rusekWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      rusekWinRate + '%'
    },\n  🏆BestWinStreak - ${
      rusekWinStreak.bestWinStreak
    },\n  🏆CurrentWinStreak - ${
      rusekWinStreak.curWinStreak
    }
    `
  }
}