const nodemailer = require('nodemailer')
const config = require('../utils/config')
console.log(config)

let transporter = nodemailer.createTransport({
  host: config.EMAILHOST,
  port: config.EMAILPORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.EMAILUSER,
    pass: config.EMAILPASSWORD
  }
})

const sendMail = (mailDetails) => {
  transporter.sendMail(mailDetails, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

/*
var message = {
  from: "sender@server.com",
  to: "receiver@sender.com",
  subject: "Message title",
  text: "Plaintext version of the message",
  html: "<p>HTML version of the message</p>"
};*/

exports.sendMail = sendMail