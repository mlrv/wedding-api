import { createTransport } from 'nodemailer'
import { left, right, Either, fold } from 'fp-ts/Either'
import { constVoid, pipe } from 'fp-ts/function'
import { Locale } from './types'
import { Party } from '../db/models'

const EMAIL_PERSONAL = process.env.EMAIL_PERSONAL || ''
const EMAIL_USER = process.env.EMAIL_USER || ''
const EMAIL_PASS = process.env.EMAIL_PASS || ''

const transporter = createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

const RSVP_CONFIRMATION_SUBJECT_GB = 'Olivia & Marco - RSVP Confirmation'
const RSVP_CONFIRMATION_SUBJECT_IT = 'Olivia & Marco - Conferma RSVP'

const RSVP_CONFIRMATION_TEXT_GB = 'Thank you so much for responding to our RSVP'
const RSVP_CONFIRMATION_TEXT_IT = 'nice'

const sendEmail = (options: {
  to: string
  subject: string
  text: string
}): Promise<Either<string, void>> =>
  new Promise(res => {
    try {
      transporter.sendMail({ from: EMAIL_USER, ...options }, err => {
        if (err) res(left(JSON.stringify(err)))
        else res(right(constVoid()))
      })
    } catch (error) {
      res(left(JSON.stringify(error)))
    }
  })

const makeRSVPConfirmationTextSubjectFromLocale = (
  locale: Locale,
): { text: string; subject: string } => {
  switch (locale) {
    case 'gb':
      return {
        text: RSVP_CONFIRMATION_TEXT_GB,
        subject: RSVP_CONFIRMATION_SUBJECT_GB,
      }
    case 'it':
      return {
        text: RSVP_CONFIRMATION_TEXT_IT,
        subject: RSVP_CONFIRMATION_SUBJECT_IT,
      }
  }
}

const makeMgmtTextSubjectFromUpdate = (
  email: string,
  update: Partial<Party>,
): { text: string; subject: string } => ({
  subject: `Party with email ${email} just RSVPd`,
  text: JSON.stringify(update, null, 2),
})

export const sendRSVPConfirmation = (to: string, locale: Locale) =>
  pipe(makeRSVPConfirmationTextSubjectFromLocale(locale), ({ text, subject }) =>
    sendEmail({
      to,
      text,
      subject,
    }).then(
      fold(
        err =>
          console.error(`Error sending RSVP confirmation email. Got ${err}`),
        () => console.log(`Sent RSVP confirmation email`),
      ),
    ),
  )

export const sendMgmtUpdate = (email: string, update: Partial<Party>) =>
  pipe(makeMgmtTextSubjectFromUpdate(email, update), ({ text, subject }) =>
    sendEmail({
      to: EMAIL_PERSONAL,
      text,
      subject,
    }).then(
      fold(
        err => console.error(`Error sending mgmt email. Got ${err}`),
        () => console.log(`Sent mgmt confirmation email`),
      ),
    ),
  )
