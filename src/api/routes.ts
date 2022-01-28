import express, { Request, Response } from 'express'

const router = express.Router()

router.get('/hello', (req: Request, res: Response) => res.send('hi get'))
router.post('/hello', (req: Request, res: Response) => res.send('hi post'))


export { router }