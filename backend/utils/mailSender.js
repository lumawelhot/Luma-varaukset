
const { add, set } = require('date-fns')
const Visit = require('../models/visit')
const { readMessage } = require('../services/fileReader')
const mailer = require('../services/mailer')

const sendReminder = async () => {
  const start = add(set(new Date(), { hours: 5, minutes: 0, seconds: 0, milliseconds: 0 }), { days: 1 })
  const end = add(set(new Date(), { hours: 23, minutes: 0, seconds: 0, milliseconds: 0 }), { days: 1 })
  const visits = await Visit.find({
    startTime: {
      $gte: start.toISOString(),
      $lt: end.toISOString()
    }
  })
  const report = {
    success: [],
    failed: []
  }

  for (let visit of visits) {
    try {
      if (visit.status) {
        const text = await readMessage('reminder.txt', [])
        const html = await readMessage('reminder.html', [])
        await mailer.sendMail({
          from: 'Luma-Varaukset <noreply@helsinki.fi>',
          to: visit.clientEmail,
          subject: 'Muistutus varauksesta!',
          text,
          html
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

const sendThanks = async () => {
  const start = set(new Date(), { hours: 5, minutes: 0, seconds: 0, milliseconds: 0 })
  const end = set(new Date(), { hours: 23, minutes: 0, seconds: 0, milliseconds: 0 })
  const visits = await Visit.find({
    endTime: {
      $gte: start.toISOString(),
      $lt: end.toISOString()
    }
  })
  const report = {
    success: [],
    failed: []
  }

  for (let visit of visits) {
    try {
      if (visit.status) {
        const text = await readMessage('thanks.txt', [])
        const html = await readMessage('thanks.html', [])
        await mailer.sendMail({
          from: 'Luma-Varaukset <noreply@helsinki.fi>',
          to: visit.clientEmail,
          subject: 'Kiitokset vierailusta!',
          text,
          html
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

module.exports = { sendReminder, sendThanks }