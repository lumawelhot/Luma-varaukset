const nodemailer = require('nodemailer')
const config = require('../utils/config')

const sendMail = (mailDetails) => {
  const senderSettings = process.env.NODE_ENV === 'production' ?
    {
      host: config.EMAILHOST,
      port: config.EMAILPORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.EMAILUSER,
        pass: config.EMAILPASSWORD
      } // remove this when moving to real production environment !!
    }
    :
    {
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
        console.log(err)
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}

module.exports = { sendMail }
