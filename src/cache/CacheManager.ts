import { Player } from "../one-vs-one/types"
import { TypeOfGame } from "../type"
type Value = {
  typeOfGame?: TypeOfGame,
  player1?: Player
  player2?: Player
  pair1?: {
    player1: Player,
    player2: Player
  },
  pair2?: {
    player1: Player,
    player2: Player
  }
}
type State = Record<string, Value>

export class CacheManager {
  private state: State = {}
  set(key: string, value: Value) {
    if(!this.state[key]) this.state[key] = value

    Object.entries(value).map(([keyOf, valueMappped]) => {
      this.state[key][keyOf as keyof Value] = valueMappped as any
    })
  }

  get(key: string) {
    return this.state[key]
  }

  delete(key: string) {
    delete this.state[key]
  }
}