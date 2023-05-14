import { Column, Entity, PrimaryColumn } from "typeorm"
import { randomUUID } from 'crypto'
import { Player } from "../one-vs-one/types"

@Entity('twovstwo')
export class TwoVSTwo {
  @PrimaryColumn()
  id!: string

  @Column({ type: 'jsonb' })
  pair1!: { player1: Player, player2: Player }

  @Column({ type: 'jsonb' })
  pair2!: { player1: Player, player2: Player }

  @Column({ type: 'jsonb' })
  winner!: { player1: Player, player2: Player }

  @Column({ type: 'jsonb' })
  loser!: { player1: Player, player2: Player }

  @Column({ default: new Date() })
  createdAt!: Date

  constructor(data?: Omit<TwoVSTwo, 'id' | 'createdAt'>) {
    if(data) {
      this.id = randomUUID()
      this.pair1 = data!.pair1
      this.pair2 = data!.pair2
      this.winner = data!.winner
      this.loser = data!.loser
      this.createdAt = new Date()
    }
  }
}