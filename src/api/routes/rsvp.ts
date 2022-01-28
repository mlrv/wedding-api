import express, { Request, Response } from 'express'
import { findByCode, findByCodeAndUpsert, insert } from '../../db/papr'
import { pipe } from 'fp-ts/function'
import { fold } from 'fp-ts/Either'
import { match } from 'fp-ts/Option'
import { PartyPOST, PartyPUT } from '../decoders'

export const router = express.Router()

router.get('/:code', (req: Request, res: Response) => {
  findByCode(req.params.code)().then(
    handle(res)(
      match(
        () => onErr404(res),
        party => Promise.resolve(res.send(party)),
      ),
    ),
  )
})

router.post('/:code', (req: Request, res: Response) => {
  pipe(
    PartyPOST.decode(req.body),
    fold(
      _ => onErr400(res),
      party =>
        findByCode(req.params.code)().then(
          handle(res)(
            match(
              () =>
                insert({ code: req.params.code, ...party })().then(_ =>
                  res.send(party),
                ),
              _ => onErr400(res),
            ),
          ),
        ),
    ),
  )
})

router.put('/:code', (req: Request, res: Response) => {
  pipe(
    PartyPUT.decode(req.body),
    fold(
      _ => onErr400(res),
      partialParty =>
        findByCodeAndUpsert(req.params.code, partialParty)().then(
          handle(res)(() => res.send(partialParty)),
        ),
    ),
  )
})

const handle =
  (res: Response) =>
  <A, B>(onRight: (a: A) => Response<B> | Promise<Response<B>>) =>
    fold(() => onErr500(res), onRight)

const onErr = (statusCode: number) => (res: Response) =>
  Promise.resolve(res.status(statusCode).send(':('))

const onErr500 = onErr(500)
const onErr404 = onErr(404)
const onErr400 = onErr(400)
