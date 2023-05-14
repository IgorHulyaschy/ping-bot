import { Connection } from "typeorm";
import { OneVSOne } from "./OneVSOne";
import { Player } from "./types";

export class OneVsOneRepository {
  constructor(private readonly connection: Connection) {}
  async save(entity: OneVSOne) {
    const repos = this.connection.getRepository(OneVSOne)
    await repos.save(entity)
  }

  getStatistics(dates: {momentFrom: string }) {
    const repos = this.connection.getRepository(OneVSOne)
    return repos.query(`
      SELECT
        sum(case when winner = 'Igil' then 1 end) as ihorWins,
        sum(case when loser = 'Igil' then 1 end) as ihorLoses,
        sum(case when winner = 'Rusek' then 1 end) as rusekWins,
        sum(case when loser = 'Rusek' then 1 end) as rusekLoses,
        sum(case when winner = 'Boba' then 1 end) as bobaWins,
        sum(case when loser = 'Boba' then 1 end) as bobaLoses,
        sum(case when winner = 'Rijiy' then 1 end) as rijiyWins,
        sum(case when loser = 'Rijiy' then 1 end) as rijiyLoses
      from onevsone
      ${dates.momentFrom 
        ? `WHERE "createdAt" > TO_DATE('${dates.momentFrom}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`
        : ''
      }
    `)    
  }

  getWinStreak(name: Player, dates: {momentFrom: string }) {
    const repos = this.connection.getRepository(OneVSOne)
    return repos.query(`
      SELECT winner, loser, "createdAt"
      from onevsone
      where (player1 = '${name}' OR player2 = '${name}')${
        dates.momentFrom 
        ? ` AND "createdAt" > TO_DATE('${dates.momentFrom}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`
        : ''
      }
      order by "createdAt" DESC
    `)
  }
}