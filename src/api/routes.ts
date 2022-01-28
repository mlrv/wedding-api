import express from 'express'
import { router as rsvpRouter } from './routes/rsvp'

const router = express.Router()

router.use('/rsvp', rsvpRouter)

export { router }
