import Papr from 'papr'
import { MongoClient } from 'mongodb'
import { party, Party } from './models'
import { fromNullable } from 'fp-ts/Option'
import { tryCatch, map } from 'fp-ts/lib/TaskEither'
import { Lazy, pipe } from 'fp-ts/lib/function'

const papr = new Papr()
const dbName = process.env.MONGODB_DB_NAME
const dbCollection = process.env.MONGODB_DB_COLLECTION
const dbURI = process.env.MONGODB_URI
const model = papr.model(dbCollection!, party)

export const connect = (): Promise<void> =>
  MongoClient.connect(dbURI!).then(connection => {
    papr.initialize(connection.db(dbName))
  })

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