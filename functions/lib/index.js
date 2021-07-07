"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer_1 = require("nodemailer");
const cors = require("cors");
admin.initializeApp();
const corsHandler = cors({ origin: true });
const EMAIL_HOST = functions.config().email.host;
const EMAIL_ACCOUNT = functions.config().email.account;
const EMAIL_PORT = functions.config().email.port;
const PASSWORD = functions.config().email.password;
const transporter = nodemailer_1.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth: {
        user: EMAIL_ACCOUNT,
        pass: PASSWORD
    }
});
exports.sendMail = functions.https.onRequest((req, res) => {
    corsHandler(req, res, () => {
        const mailData = {
            from: `${req.body.email}`,
            to: 't.d.adomaitis@gmail.com',
            subject: `Mensagem recebida no site de ${req.body.name}`,
            text: req.body.message,
            html: `
          <p>Mensagem de: ${req.body.name}</p>
          <p>Responder para: ${req.body.email}</p>
          <div>${req.body.message}</div>
        `
        };
        transporter.sendMail(mailData, err => {
            if (err) {
                console.log(err);
                return res
                    .status(500)
                    .send(err.toString())
                    .end();
            }
            return res.status(200).end();
        });
    });
});
//# sourceMappingURL=index.js.map