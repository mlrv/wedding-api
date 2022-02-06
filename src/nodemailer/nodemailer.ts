import { createTransport } from 'nodemailer'
import { left, right, Either, fold } from 'fp-ts/Either'
import { constVoid, pipe } from 'fp-ts/function'
import { EmailResponseType, Locale } from './types'
import { Guest, Party } from '../db/models'
import { Option, some, match, none } from 'fp-ts/Option'

import * as content from './content'

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

const sendEmail = (options: {
  to: string
  subject: string
  html: string
  attachments?: Array<{ filename: string; path: string; cid: string }>
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

const makeRSVPConfirmationHTMLSubject = (
  locale: Locale,
  guests: Option<Guest[]>,
): { html: string; subject: string } => {
  const emailResponseType: EmailResponseType = match(
    () => ({ kind: 'generic' } as EmailResponseType),
    (gs: Guest[]) =>
      gs.length > 0 && gs.every(g => 'coming' in g && g.coming === false)
        ? { kind: 'notComing' as const }
        : { kind: 'coming' as const },
  )(guests)

  const makeGb = (type: EmailResponseType) => {
    switch (type.kind) {
      case 'generic':
        return content.RSVP_CONFIRMATION_HTML_GENERIC_GB
      case 'coming':
        return content.RSVP_CONFIRMATION_HTML_COMING_GB
      case 'notComing':
        return content.RSVP_CONFIRMATION_HTML_NOT_COMING_GB
    }
  }

  const makeIt = (type: EmailResponseType) => {
    switch (type.kind) {
      case 'generic':
        return content.RSVP_CONFIRMATION_HTML_GENERIC_IT
      case 'coming':
        return content.RSVP_CONFIRMATION_HTML_COMING_IT
      case 'notComing':
        return content.RSVP_CONFIRMATION_HTML_NOT_COMING_IT
    }
  }

  switch (locale) {
    case 'gb':
      return {
        html: makeGb(emailResponseType),
        subject: content.RSVP_CONFIRMATION_SUBJECT_GB,
      }
    case 'it':
      return {
        html: makeIt(emailResponseType),
        subject: content.RSVP_CONFIRMATION_SUBJECT_IT,
      }
  }
}

const makeMgmtHTMLSubjectFromUpdate = (
  email: string,
  update: Partial<Party>,
): { html: string; subject: string } => ({
  subject: `Party with email ${email} just RSVPd`,
  html: JSON.stringify(update, null, 2),
})

export const sendRSVPConfirmation = (
  to: string,
  locale: Locale,
  guests: Option<Guest[]>,
) =>
  pipe(makeRSVPConfirmationHTMLSubject(locale, guests), ({ html, subject }) =>
    sendEmail({
      to,
      html,
      subject,
      attachments: [
        {
          filename: 'logo.png',
          path: __dirname + '/../../resources/logo.png',
          cid: 'logo',
        },
      ],
    }).then(
      fold(
        err =>
          console.error(`Error sending RSVP confirmation email. Got ${err}`),
        () => console.log(`Sent RSVP confirmation email`),
      ),
    ),
  )

export const sendMgmtUpdate = (email: string, update: Partial<Party>) =>
  pipe(makeMgmtHTMLSubjectFromUpdate(email, update), ({ html, subject }) =>
    sendEmail({
      to: EMAIL_PERSONAL,
      html,
      subject,
    }).then(
      fold(
        err => console.error(`Error sending mgmt email. Got ${err}`),
        () => console.log(`Sent mgmt confirmation email`),
      ),
    ),
  )
