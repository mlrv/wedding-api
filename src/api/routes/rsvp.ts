import express, { Request, Response } from 'express'
import { findByCode, findByCodeAndUpsert, insert } from '../../db/papr'
import { pipe } from 'fp-ts/function'
import { fold as foldO } from 'fp-ts/Option'
import { fold as foldE } from 'fp-ts/Either'
import { PartyPOST, PartyPUT } from '../decoders'

export const router = express.Router()

router.get('/:code', (req: Request, res: Response) => {
  findByCode(req.params.code).then(
    foldO(
      () => onErr404(res),
      party => Promise.resolve(res.send(party)),
    ),
  )
})

router.post('/:code', (req: Request, res: Response) => {
  pipe(
    PartyPOST.decode(req.body),
    foldE(
      _ => onErr400(res),
      party =>
        insert({ code: req.params.code, ...party }).then(_ => res.send(party)),
    ),
  )
})

router.put('/:code', (req: Request, res: Response) => {
  pipe(
    PartyPUT.decode(req.body),
    foldE(
      _ => onErr400(res),
      partialParty =>
        findByCodeAndUpsert(req.params.code, partialParty).then(_ =>
          res.send(partialParty),
        ),
    ),
  )
})

const onErr = (statusCode: number) => (res: Response) =>
  Promise.resolve(res.status(statusCode).send(':('))

const onErr404 = onErr(404)
const onErr400 = onErr(400)
