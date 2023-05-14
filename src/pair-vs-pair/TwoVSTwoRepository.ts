import { Connection } from "typeorm";
import { TwoVSTwo } from "./TwoVSTwo";

export class TwoVSTwoRepository {
  constructor(private readonly connection: Connection) {}

  async save(entity: Omit<TwoVSTwo, 'id' | 'createdAt'>) {
    const repo = this.connection.getRepository(TwoVSTwo)
    await repo.save(entity)
  }

  async getTotalStatisctics(momentFrom?: string) {
    const repo = this.connection.getRepository(TwoVSTwo)
    return repo.query(`
      SELECT
      sum(case when loser::jsonb @> '{"player1": "Igil", "player2": "Boba" }'::jsonb  then 1 end) as ihorbobaloses,
      sum(case when winner::jsonb @> '{"player1": "Igil", "player2": "Boba" }'::jsonb  then 1 end) as ihorbobawins,
      sum(case when loser::jsonb @> '{"player1": "Igil", "player2": "Rijiy" }'::jsonb  then 1 end) as ihorrijiyloses,
      sum(case when winner::jsonb @> '{"player1": "Igil", "player2": "Rijiy" }'::jsonb  then 1 end) as ihorrijiywins,
      sum(case when loser::jsonb @> '{"player1": "Igil", "player2": "Rusek" }'::jsonb  then 1 end) as ihorrusekloses,
      sum(case when winner::jsonb @> '{"player1": "Igil", "player2": "Rusek" }'::jsonb  then 1 end) as ihorrusekwins,
      sum(case when winner::jsonb @> '{"player1": "Boba", "player2": "Rijiy" }'::jsonb  then 1 end) as bobarijiywins,
      sum(case when loser::jsonb @> '{"player1": "Boba", "player2": "Rijiy" }'::jsonb  then 1 end) as bobarijiyloses,
      sum(case when winner::jsonb @> '{"player1": "Rijiy", "player2": "Rusek" }'::jsonb  then 1 end) as rijiyrusekwins,
      sum(case when loser::jsonb @> '{"player1": "Rijiy", "player2": "Rusek" }'::jsonb  then 1 end) as rijiyrusekloses,
      sum(case when winner::jsonb @> '{"player1": "Boba", "player2": "Rusek" }'::jsonb  then 1 end) as bobarusekwins,
      sum(case when loser::jsonb @> '{"player1": "Boba", "player2": "Rusek" }'::jsonb  then 1 end) as bobarusekloses
      from twovstwo
      ${ momentFrom ? `WHERE "createdAt" > TO_DATE('${momentFrom}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')` : '' }
    `)
  }
}