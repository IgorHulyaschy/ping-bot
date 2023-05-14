import { ConnectionOptions } from 'typeorm'
import { OneVSOne } from './src/one-vs-one/OneVSOne'
import { TwoVSTwo } from './src/pair-vs-pair/TwoVSTwo'

const config: ConnectionOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL ?? 'postgres://localhost/postgres',
  entities: [OneVSOne, TwoVSTwo],
  synchronize: true,
  migrations: ['./migrations/**/*.ts'],
  cli: {
    migrationsDir: './migrations',
  },
}

export = config