const nodemailer = require('nodemailer')
const config = require('../utils/config')

let transporter = nodemailer.createTransport({
  host: config.EMAILHOST,
  port: config.EMAILPORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.EMAILUSER,
    pass: config.EMAILPASSWORD,
  },
})

const sendMail = (mailDetails) => {
  transporter.sendMail(mailDetails, (error) => {
    if (error) {
      //console.log(error);
    } else {
      //console.log('Email sent: ' + info.response)
    }
  })
}

exports.sendMail = sendMail
