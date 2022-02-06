import express, { Request, Response } from 'express'
import {
  findByCode,
  findByCodeAndUpsert,
  insertOne,
  insertMany,
} from '../../db/papr'
import { constVoid, pipe } from 'fp-ts/function'
import { fold } from 'fp-ts/Either'
import { match } from 'fp-ts/Option'
import { PartyPOSTMany, PartyPOSTOne, PartyPUTOne } from '../decoders'
import { Party } from '../../db/models'
import {
  sendMgmtUpdate,
  sendRSVPConfirmation,
} from '../../nodemailer/nodemailer'
import { Locale } from '../../nodemailer/types'

export const router = express.Router()

router.post('/', (req: Request, res: Response) => {
  pipe(
    PartyPOSTMany.decode(req.body),
    fold(
      err => onErr400(res, `Decode error, got ${JSON.stringify(err)}`),
      parties =>
        insertMany(parties)().then(handle(res)(() => res.send(parties))),
    ),
  )
})

router.get('/:code', (req: Request, res: Response) => {
  findByCode(req.params.code)().then(
    handle(res)(
      match(
        () => onErr404(res, 'Code not found'),
        party => Promise.resolve(res.send(party)),
      ),
    ),
  )
})

router.post('/:code', (req: Request, res: Response) => {
  pipe(
    PartyPOSTOne.decode(req.body),
    fold(
      err => onErr400(res, `Decode error, got ${JSON.stringify(err)}`),
      party =>
        findByCode(req.params.code)().then(
          handle(res)(
            match(
              () =>
                insertOne({ code: req.params.code, ...party })().then(_ =>
                  res.send(party),
                ),
              _ => onErr400(res, 'Code already exists'),
            ),
          ),
        ),
    ),
  )
})

router.put('/:code', (req: Request, res: Response) => {
  pipe(
    PartyPUTOne.decode(req.body),
    fold(
      err => onErr400(res, `Decode error, got ${JSON.stringify(err)}`),
      ({ locale, update }) =>
        findByCodeAndUpsert(req.params.code, update)()
          .then(handle(res)(() => res.send(update)))
          .then(_ =>
            req.query.email
              ? sendEmailIfAddressPresent(
                  locale,
                  update,
                  !!req.query.email ?? false,
                )
              : constVoid(),
          ),
    ),
  )
})

const sendEmailIfAddressPresent = (
  locale: Locale,
  update: Partial<Party>,
  sendConfirmation: boolean,
) => {
  const sendConfirmationOrVoid = () =>
    'email' in update && sendConfirmation
      ? sendRSVPConfirmation(update.email!, locale)
      : Promise.resolve()

  return sendConfirmationOrVoid().then(_ =>
    sendMgmtUpdate(update.email!, update),
  )
}

const handle =
  (res: Response) =>
  <A, B>(onRight: (a: A) => Response<B> | Promise<Response<B>>) =>
    fold(
      err => onErr500(res, `Internal error, got ${JSON.stringify(err)}`),
      onRight,
    )

const onErr = (statusCode: number) => (res: Response, msg?: string) =>
  pipe(msg ? console.error(msg) : constVoid(), _ =>
    Promise.resolve(
      res.status(statusCode).json({
        code: statusCode,
        error: msg ?? 'Unexpected error',
      }),
    ),
  )

const onErr500 = onErr(500)
const onErr404 = onErr(404)
const onErr400 = onErr(400)
