const nodemailer = require('nodemailer')
const config = require('../utils/config')

/* let transporter = nodemailer.createTransport({
  host: config.EMAILHOST,
  port: config.EMAILPORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.EMAILUSER,
    pass: config.EMAILPASSWORD,
  },
}) */

/* const sendMail = async (mailDetails) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailDetails, (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
} */

function sendMail(mailDetails) {
  const senderSettings = {
    host: config.EMAILHOST,
    port: config.EMAILPORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.EMAILUSER,
      pass: config.EMAILPASSWORD,
    },
  }
  const transporter = nodemailer.createTransport(senderSettings)

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailDetails, (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}

module.exports = { sendMail }
