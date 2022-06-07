
const { add, set, format } = require('date-fns')
const Visit = require('../models/visit')
const mailer = require('../services/mailer')
const Email = require('../models/email')
const { fillStringWithValues, u, scienceClasses } = require('./helpers')
const config = require('./config')
const { getNotifyHtml } = require('./receipt')

const getDetails = (visit, event) => [
  { name: 'link', value: visit?.id ? `${config.HOST_URI}/${visit.id}` : '' },
  { name: 'event-title', value: u(event?.title) },
  { name: 'event-desc', value: u(event?.description) },
  { name: 'event-resources', value: scienceClasses(event?.resourceids) },
  { name: 'event-date', value: u(event?.start && format(new Date(event?.start), 'dd.MM.yy')) },
  { name: 'event-start', value: u(visit?.startTime && format(new Date(visit?.startTime), 'HH:mm')) },
  { name: 'event-end', value: u(visit?.endTime && format(new Date(visit?.endTime), 'HH:mm')) },
  { name: 'event-type', value: u(visit?.removeVisit ? 'Etävierailu' : 'Lähivierailu') },
  { name: 'client-name', value: u(visit?.clientName) },
  { name: 'client-phone', value: u(visit?.clientPhone) },
  { name: 'client-email', value: u(visit?.clientEmail) },
  { name: 'school-name', value: u(visit?.schoolName) },
  { name: 'school-location', value: u(visit?.schoolLocation) },
  { name: 'grade', value: u(visit?.grade) },
  { name: 'participants', value: u(visit?.participants) },
  { name: 'data-use-agreement', value: u(visit?.dataUseAgreement ? 'Kyllä' : 'Ei') },
  { name: 'language', value: u(visit?.language === 'fi' ? 'Suomi' : (visit?.language === 'en' ? 'Englanti' : 'Ruotsi')) },
]

const sendAlert = async (name, days) => {
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
          text: fillStringWithValues(mail.text, getDetails(visit, visit.event)),
          html: fillStringWithValues(mail.html, getDetails(visit, visit.event))
        })
        mail.ad.forEach(recipient => {
          mailer.sendMail({
            from: 'Luma-Varaukset <noreply@helsinki.fi>',
            to: recipient,
            subject: mail.adSubject,
            text: fillStringWithValues(mail.adText, getDetails(visit, visit.event))
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
  return await sendAlert('reminder', 1)
}

const sendThanks = async () => {
  return await sendAlert('thanks', 0)
}

const send = async (visit, event, name) => {
  const mail = await Email.findOne({ name })
  if (process.env.NODE_ENV !== 'test') {
    await mailer.sendMail({
      from: 'Luma-Varaukset <noreply@helsinki.fi>',
      to: visit.clientEmail,
      subject: mail.subject,
      text: fillStringWithValues(mail.text, getDetails(visit, event)),
      html: fillStringWithValues(mail.html, getDetails(visit, event))
    })
    mail.ad.forEach(recipient => {
      mailer.sendMail({
        from: 'Luma-Varaukset <noreply@helsinki.fi>',
        to: recipient,
        subject: mail.adSubject,
        text: fillStringWithValues(mail.adText, getDetails(visit, event)),
        html: getNotifyHtml(visit, event)
      })
    })
  }
}

const sendWelcomes = async (visit, event) => {
  await send(visit, event, 'welcome')
}

const sendCancellation = async (visit, event) => {
  await send(visit, event, 'cancellation')
}

module.exports = { sendReminder, sendThanks, sendWelcomes, sendCancellation }

/*
<div>/link/r</div>
<div>/event-title/r</div>
<div>/event-desc/r</div>
<div>/event-resources/r</div>
<div>/event-date/r</div>
<div>/event-start/r</div>
<div>/event-end/r</div>
<div>/event-type/r</div>
<div>/client-name/r</div>
<div>/client-phone/r</div>
<div>/client-email/r</div>
<div>/school-name/r</div>
<div>/school-location/r</div>
<div>/grade/r</div>
<div>/participants/r</div>
<div>/data-use-agreement/r</div>
<div>/language/r</div>
*/