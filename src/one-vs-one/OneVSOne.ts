import { Column, Entity, PrimaryColumn } from "typeorm";
import { randomUUID } from 'crypto'
import { Player } from "./types";

@Entity('onevsone')
export class OneVSOne {
  @PrimaryColumn()
  id!: string

  @Column()
  player1!: Player

  @Column()
  player2!: Player

  @Column()
  winner!: Player

  @Column()
  loser!: Player

  @Column({ default: new Date() })
  createdAt!: Date

  constructor(data?: Omit<OneVSOne, 'id' | 'createdAt'>) {
    if(data) {
      this.id = randomUUID()
      this.player1 = data!.player1
      this.player2 = data!.player2
      this.winner = data!.winner
      this.loser = data!.loser
      this.createdAt = new Date()
    }
  }
}
