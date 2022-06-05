
const { add, set } = require('date-fns')
const Visit = require('../models/visit')
const mailer = require('../services/mailer')
const Email = require('../models/email')
const { fillStringWithValues } = require('./helpers')
const config = require('./config')

const getDetails = (visit) => {
  return ([
    {
      name: 'link',
      value: `${config.HOST_URI}/${visit.id}`
    },
    {
      name: 'visit',
      value: `${visit.event.title} ${visit.startTime}-${visit.endTime}`
    }
  ])
}

const send = async (name, days) => {
  const mail = await Email.findOne({ name })
  if (!mail) return null
  const start = add(set(new Date(), { hours: 5, minutes: 0, seconds: 0, milliseconds: 0 }), { days })
  const end = add(set(new Date(), { hours: 23, minutes: 0, seconds: 0, milliseconds: 0 }), { days })
  const visits = await Visit.find({
    startTime: {
      $gte: start.toISOString(),
      $lt: end.toISOString()
    }
  }).populate('event')
  const report = {
    success: [],
    failed: []
  }

  for (let visit of visits) {
    try {
      if (visit.status) {
        await mailer.sendMail({
          from: 'Luma-Varaukset <noreply@helsinki.fi>',
          to: visit.clientEmail,
          subject: mail.subject,
          text: fillStringWithValues(mail.text, getDetails(visit)),
          html: fillStringWithValues(mail.html, getDetails(visit))
        })
        mail.ad.forEach(recipient => {
          mailer.sendMail({
            from: 'Luma-Varaukset <noreply@helsinki.fi>',
            to: recipient,
            subject: mail.adSubject,
            text: fillStringWithValues(mail.adText, getDetails(visit))
          })
        })
        report.success.push(visit)
      } else {
        report.failed.push(visit)
      }
    } catch (error) {
      console.log(error)
      report.failed.push(visit)
    }
  }
  return report
}

const sendReminder = async () => {
  return await send('reminder', 1)
}

const sendThanks = async () => {
  return await send('thanks', 0)
}

module.exports = { sendReminder, sendThanks }