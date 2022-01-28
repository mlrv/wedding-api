import express, { Request, Response } from 'express'
import { findByCode, insert } from '../../db/papr'
import { pipe } from 'fp-ts/function'
import { fold as foldO } from 'fp-ts/Option'
import { fold as foldE } from 'fp-ts/Either'
import { Party } from '../decoders'

const router = express.Router()

router.get('/:code', (req: Request, res: Response) => {
  findByCode(req.params.code).then(
    foldO(
      () => res.sendStatus(404),
      party => res.send(party),
    ),
  )
})

router.post('/:code', (req: Request, res: Response) => {
  pipe(
    Party.decode(req.body),
    foldE(
      _ => Promise.resolve(res.status(400).send(':(')),
      party => insert(party).then(_ => res.send(party)),
    ),
  )
})

export { router }
