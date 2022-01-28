import Papr from 'papr'
import { MongoClient } from 'mongodb'
import { party, Party } from './models'
import { fromNullable } from 'fp-ts/Option'
import { tryCatch, map } from 'fp-ts/TaskEither'
import { Lazy, pipe } from 'fp-ts/function'

const papr = new Papr()
const dbName = process.env.MONGODB_DB_NAME
const dbCollection = process.env.MONGODB_DB_COLLECTION
const dbURI = process.env.MONGODB_URI
const model = papr.model(dbCollection!, party)

export const connect = (): Promise<void> => {
  const client = MongoClient.connect(dbURI!)

  return client.then(c => {
    registerOnExit(c)
    papr.initialize(c.db(dbName))
  })
}

export const findByCode = (c: string) =>
  pipe(
    op(() => model.findOne({ code: c })),
    map(fromNullable),
  )

export const insert = (p: Party) => op(() => model.insertOne(p))

export const findByCodeAndUpsert = (c: string, p: Partial<Party>) =>
  op(() => model.upsert({ code: c }, { $set: p }))

const op = <A>(f: Lazy<Promise<A>>) => tryCatch(f, err)

const err = (e: unknown) =>
  `Error when talking to the database. Got ${JSON.stringify(e)}`

const registerOnExit = (c: MongoClient) => {
  process.on('exit', () => c.close())
  process.on('SIGINT', () => c.close())
  process.on('SIGUSR1', () => c.close())
  process.on('SIGUSR2', () => c.close())
  process.on('uncaughtException', () => c.close())
}
