export class Helper {
  isAdmin(id: number) {
    return id === Number(process.env.ADMIN_ID)
  }
}

const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const MONTH = HOUR * 24 * 28
export const TIME = {
  SECOND,
  MINUTE,
  HOUR,
  MONTH
}