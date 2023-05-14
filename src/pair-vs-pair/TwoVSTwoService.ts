import { TIME } from "../helper";
import { Player } from "../one-vs-one/types";
import { StatisticsType } from "../type";
import { TwoVSTwo } from "./TwoVSTwo";
import { TwoVSTwoRepository } from "./TwoVSTwoRepository";

export class TwoVSTwoService {
  constructor(private readonly repositroy: TwoVSTwoRepository) {}

  private getWinRate(wins: number, loses: number) {
    const games = Number(wins) + Number(loses)
    const winrate = Number(wins)/games * 100
    return Number(winrate.toFixed(2))
  }

  save(entity: Omit<TwoVSTwo, 'id' | 'createdAt'>) {
    return this.repositroy.save(new TwoVSTwo(entity))
  }

  async getTotalStatisctics(period: StatisticsType) {
    let date: string | undefined
    switch(period) {
      case StatisticsType.DAILY: {
        date = new Date(new Date().setHours(0, 0)).toISOString()
        break;
      }
      case StatisticsType.MONTHLY: {
        date = new Date(new Date(Date.now() - TIME.MONTH).setHours(0, 0)).toISOString()
        break;
      }
    }

    const [statistics] = await this.repositroy.getTotalStatisctics(date)
    const {
      ihorbobaloses,
      ihorbobawins,
      ihorrijiyloses,
      ihorrijiywins,
      ihorrusekloses,
      ihorrusekwins,
      bobarijiywins,
      bobarijiyloses,
      rijiyrusekwins,
      rijiyrusekloses,
      bobarusekwins,
      bobarusekloses
    } = statistics as {
      ihorbobaloses: number | null,
      ihorbobawins: number | null,
      ihorrijiyloses: number | null,
      ihorrijiywins: number | null,
      ihorrusekloses: number | null,
      ihorrusekwins: number | null,
      bobarijiywins: number | null,
      bobarijiyloses: number | null,
      rijiyrusekwins: number | null,
      rijiyrusekloses: number | null,
      bobarusekwins: number | null,
      bobarusekloses: number | null
    }

    const ihorbobawinRate = this.getWinRate(ihorbobawins || 0, ihorbobaloses || 0)
    const ihorrijiywinRate = this.getWinRate(ihorrijiywins || 0, ihorrijiyloses || 0)
    const ihorrusekWinRate = this.getWinRate(ihorrusekwins || 0, ihorrusekloses || 0)
    const bobarijiyWinRate = this.getWinRate(bobarijiywins || 0, bobarijiyloses || 0)
    const rijiyrusekWinRate = this.getWinRate(rijiyrusekwins || 0, rijiyrusekloses || 0)
    const bobaRusekWinRate = this.getWinRate(bobarusekwins || 0, bobarusekloses || 0)
    const ihorWinRate = this.getWinRate(
      ((Number(ihorbobawins) || 0) + (Number(ihorrijiywins) || 0) + (Number(ihorrusekwins) || 0)), 
      ((Number(ihorbobaloses) || 0) + (Number(ihorrijiyloses) || 0) + (Number(ihorrusekloses) || 0))
    )
    const rusekWinRate = this.getWinRate(
      ((Number(ihorrusekwins) || 0) + (Number(rijiyrusekwins) || 0) + (Number(bobarusekwins) || 0)), 
      ((Number(ihorrusekloses) || 0) + (Number(rijiyrusekloses) || 0) + (Number(bobarusekloses) || 0))
    )
    const rijiyWinRate = this.getWinRate(
      ((Number(ihorrijiywins) || 0) + (Number(bobarijiywins) || 0) + (Number(rijiyrusekwins) || 0)), 
      ((Number(ihorrijiyloses) || 0) + (Number(bobarijiyloses) || 0) + (Number(rijiyrusekloses) || 0))
    )
    const bobaWinRate = this.getWinRate(
      ((Number(ihorbobawins) || 0) + (Number(bobarijiywins) || 0) + (Number(bobarusekwins) || 0)), 
      ((Number(ihorbobaloses) || 0) + (Number(bobarijiyloses) || 0) + (Number(bobarusekloses) || 0))
    )

    return `<b>${Player.Igil} & ${Player.Boba}</b>:\n  🟢Перемог - ${
      ihorbobawins || 0
    },\n  🔴Поразок - ${
      ihorbobaloses || 0
    },\n ${ihorbobawinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      ihorbobawinRate + '%'
    }\n\n<b>${Player.Igil} & ${Player.Rijiy}</b>:\n  🟢Перемог - ${
      ihorrijiywins || 0
    },\n  🔴Поразок - ${
      ihorrijiyloses || 0
    },\n  ${ihorrijiywinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      ihorrijiywinRate + '%'
    }\n\n<b>${Player.Igil} & ${Player.Rusek}</b>:\n  🟢Перемог - ${
      ihorrusekwins || 0
    },\n  🔴Поразок - ${
      ihorrusekloses || 0
    },\n  ${ihorrusekWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      ihorrusekWinRate + '%'
    }\n\n<b>${Player.Boba} & ${Player.Rijiy}</b>:\n  🟢Перемог - ${
      bobarijiywins || 0
    },\n  🔴Поразок - ${
      bobarijiyloses || 0
    },\n  ${bobarijiyWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      bobarijiyWinRate + '%'
    }\n\n<b>${Player.Rijiy} & ${Player.Rusek}</b>:\n  🟢Перемог - ${
      rijiyrusekwins || 0
    },\n  🔴Поразок - ${
      rijiyrusekloses || 0
    },\n  ${rijiyrusekWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      rijiyrusekWinRate + '%'
    }\n\n<b>${Player.Boba} & ${Player.Rusek}</b>:\n  🟢Перемог - ${
      bobarusekwins || 0
    },\n  🔴Поразок - ${
      bobarusekloses || 0
    },\n  ${bobaRusekWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      bobaRusekWinRate + '%'
    }\n\n\n <b>TOTAL</b>\n\n<b>${Player.Igil}:</b>\n  🟢Побед - ${
      (Number(ihorbobawins) || 0) + (Number(ihorrijiywins) || 0) + (Number(ihorrusekwins) || 0)
    },\n  🔴Поражений - ${
      (Number(ihorbobaloses) || 0) + (Number(ihorrijiyloses) || 0) + (Number(ihorrusekloses) || 0)
    },\n  ${ihorWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      ihorWinRate + '%'
    }\n\n<b>${Player.Boba}</b>:\n  🟢Побед - ${
      (Number(ihorbobawins) || 0) + (Number(bobarijiywins) || 0) + (Number(bobarusekwins) || 0)
    },\n  🔴Поражений - ${
      (Number(ihorbobaloses) || 0) + (Number(bobarijiyloses) || 0) + (Number(bobarusekloses) || 0)
    },\n  ${bobaWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      bobaWinRate + '%'
    }\n\n<b>${Player.Rijiy}</b>:\n  🟢Побед - ${
      (Number(ihorrijiywins) || 0) + (Number(bobarijiywins) || 0) + (Number(rijiyrusekwins) || 0)
    },\n  🔴Поражений - ${
      (Number(ihorrijiyloses) || 0) + (Number(bobarijiyloses) || 0) + (Number(rijiyrusekloses) || 0)
    },\n  ${rijiyWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      rijiyWinRate + '%'
    }\n\n<b>${Player.Rusek}</b>:\n  🟢Побед - ${
      (Number(ihorrusekwins) || 0) + (Number(rijiyrusekwins) || 0) + (Number(bobarusekwins) || 0)
    },\n  🔴Поражений - ${
      (Number(ihorrusekloses) || 0) + (Number(rijiyrusekloses) || 0) + (Number(bobarusekloses) || 0)
    },\n  ${rusekWinRate >= 50 ? '🟢' : '🔴'}Winrate - ${
      rusekWinRate + '%'
    }`
  }
}
