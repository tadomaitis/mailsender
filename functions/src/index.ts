import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { createTransport } from 'nodemailer'
import * as cors from 'cors'
import { google } from 'googleapis'

admin.initializeApp()
const corsHandler = cors({ origin: true })

interface EmailOptions {
  subject: string
  text: string
  to: string
  html: string
  from: string | undefined
}

const OAuth2 = google.auth.OAuth2
const OAUTH_URI = 'https://developers.google.com/oauthplayground'
const CLIENT_ID = functions.config().email.client_id
const CLIENT_SECRET = functions.config().email.client_secret
const REFRESH_TOKEN = functions.config().email.refresh_token
const EMAIL_ACCOUNT = functions.config().email.account

export const sendMail = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const createTransporter = async () => {
      const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, OAUTH_URI)

      oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN
      })

      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            reject(new Error(`Failed to create access token: ${err}`))
          }
          resolve(token)
        })
      })

      const transporter = createTransport({
        // @ts-ignore
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: EMAIL_ACCOUNT,
          accessToken,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN
        }
      })
      return transporter
    }

    const emailOptions: EmailOptions = {
      from: `${req.body.email}`,
      to: 't.d.adomaitis@gmail.com',
      subject: `Mensagem recebida no site de ${req.body.name}`,
      text: req.body.message,
      html: `
          <p>Mensagem de: ${req.body.name}</p>
          <p>Responder para: ${req.body.email}</p>
          <div>${req.body.message}</div>
        `
    }

    const sendEmail = async (emailOptions: EmailOptions) => {
      const emailTransporter = await createTransporter()
      await emailTransporter.sendMail(emailOptions)
    }

    sendEmail(emailOptions)
    return res.status(200).end()
  })
})
