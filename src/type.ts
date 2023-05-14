import { Player } from "./one-vs-one/types";

export enum TypeOfGame {
  TWOVSTWO = 'TWOVSTWO',
  ONEVSONE = 'ONEVSONE'
}

export enum StatisticsType {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  TOTAL = 'TOTAL'
}

export const STATISCTICS_TYPE = (gameType: TypeOfGame) => {
  return {
    'reply_markup': {
      'inline_keyboard': [
        [
          {
            text: 'Daily',
            callback_data: `${JSON.stringify({ gameType, statisticsType: StatisticsType.DAILY })}`
          },
          {
            text: 'Monthly',
            callback_data: `${JSON.stringify({ gameType, statisticsType: StatisticsType.MONTHLY })}`
          },
          {
            text: 'Total',
            callback_data: `${JSON.stringify({ gameType, statisticsType: StatisticsType.TOTAL })}`
          }
        ],
      ]
    }
  } as any
}

export const TWOVSTWOCALLBACK = (id: string) => {
  return {
    'reply_markup': {
      'inline_keyboard': [
        [
          {
            text: 'Боба',
            callback_data: `${Player.Boba}@${id}`
          },
          {
            text: 'Русек',
            callback_data: `${Player.Rusek}@${id}`
          }
        ],
        [
          {
            text: 'Рыжий',
            callback_data: `${Player.Rijiy}@${id}`
          }
        ]
      ]
    }
  } as any
}

export const ONEVSONECALLBACK = (id: string) => {
  return {
    'reply_markup': {
      'inline_keyboard': [
        [
          {
            text: 'Боба',
            callback_data: `${Player.Boba}@${id}`
          },
          {
            text: 'Русек',
            callback_data: `${Player.Rusek}@${id}`
          }
        ],
        [
          {
            text: 'Рыжий',
            callback_data: `${Player.Rijiy}@${id}`
          },
          {
            text: 'Игорь',
            callback_data: `${Player.Igil}@${id}`
          }
        ]
      ]
    }
  } as any
} 

export const WINNERCALLBACK = (id: string, player1: Player, player2: Player) => {
  return {
    'reply_markup': {
      'inline_keyboard': [
        [
          {
            text: player1,
            callback_data: `${player1}@${id}@winner`,
          },
          {
            text: player2,
            callback_data: `${player2}@${id}@winner`
          }
        ]
      ]
    }
  }
}

export const PAIRCALLBACKWINNER = (id: string, pair1: { player1: Player, player2: Player }, pair2: { player1: Player, player2: Player }) => {
  return {
    'reply_markup': {
      'inline_keyboard': [
        [
          {
            text: pair1.player1 + '&' + pair1.player2,
            callback_data: `${JSON.stringify(pair1)}@${id}@pairwinner`,
          },
          {
            text: pair2.player1 + '&' + pair2.player2,
            callback_data: `${JSON.stringify(pair2)}@${id}@pairwinner`
          }
        ]
      ]
    }
  } as any
}