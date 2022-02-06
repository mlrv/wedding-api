const table = (header: string, content: string) =>
  `<table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
          <td style="text-align: center;">
              ${header}
							<br />
							<br />
              ${content}
              <br />
              <br />
              ${RSVP_CONFIRMATION_IMG}
          </td>
      </tr>
  </table>`

const RSVP_CONFIRMATION_IMG =
  '<img width="80%" height="auto" src="cid:logo"/>'

export const RSVP_CONFIRMATION_SUBJECT_GB = 'Olivia & Marco - RSVP Confirmation'
export const RSVP_CONFIRMATION_SUBJECT_IT = 'Olivia & Marco - Conferma RSVP'

export const RSV_CONFIRMATION_HEADER_GB =
  'Thank you so much for responding to our RSVP'

export const RSV_CONFIRMATION_HEADER_IT =
  'Grazie per aver risposto al nostro RSVP!'

export const RSVP_CONFIRMATION_HTML_GENERIC_GB = table(
  RSV_CONFIRMATION_HEADER_GB,
  '',
)

export const RSVP_CONFIRMATION_HTML_GENERIC_IT = table(
  RSV_CONFIRMATION_HEADER_IT,
  '',
)

export const RSVP_CONFIRMATION_HTML_COMING_GB = table(
  RSV_CONFIRMATION_HEADER_GB,
  'We have registered your response and can\'t wait to celebrate with you!',
)

export const RSVP_CONFIRMATION_HTML_COMING_IT = table(
  RSV_CONFIRMATION_HEADER_IT,
  'Abbiamo registrato la vostra risposta e non vediamo l\'ora di festeggiare insieme a voi!',
)

export const RSVP_CONFIRMATION_HTML_NOT_COMING_GB = table(
  RSV_CONFIRMATION_HEADER_GB,
  'We are really sorry to hear that you won\'t be able to make it, and we hope that we\'ll ',
)

export const RSVP_CONFIRMATION_HTML_NOT_COMING_IT = table(
  RSV_CONFIRMATION_HEADER_IT,
  'Ci dispiace molto che non riuscite a venire, speriamo di...',
)
