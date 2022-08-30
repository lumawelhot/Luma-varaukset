const { add, set, format } = require('date-fns')
const mailer = require('../../services/mailer')
const config = require('../../config')
const { getNotifyHtml, u, scienceClasses } = require('./receipt')
const { Email, Visit } = require('../../db')
const { expandVisits } = require('../../db/expand')
const logger = require('../../logger')

const fillStringWithValues = (str, replace) => {
  let newString = str
  try {
    replace.forEach(element => newString = newString.replace(`/${element.name}/r`, element.value))
    return newString
  } catch (err) {
    return str
  }
}

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
  }, expandVisits)
  const promises = visits.reduce((result, visit) => {
    if (visit.status) {
      result.push(mailer.sendMail({
        from: 'Luma-Varaukset <noreply@helsinki.fi>',
        to: visit.clientEmail,
        subject: mail.subject,
        text: fillStringWithValues(mail.text, getDetails(visit, visit.event)),
        html: fillStringWithValues(mail.html, getDetails(visit, visit.event))
      }))
      mail.ad.forEach(recipient => result.push(mailer.sendMail({
        from: 'Luma-Varaukset <noreply@helsinki.fi>',
        to: recipient,
        subject: mail.adSubject,
        text: fillStringWithValues(mail.adText, getDetails(visit, visit.event))
      })))
    }
    return result
  }, [])
  try {
    await Promise.all(promises)
  } catch (err) {
    logger.error(`Transport error: ${err.message}`)
  }
}

const send = async (visit, event, name) => {
  if (process.env.NODE_ENV !== 'test') {
    const mail = await Email.findOne({ name })
    await mailer.sendMail({
      from: 'Luma-Varaukset <noreply@helsinki.fi>',
      to: visit.clientEmail,
      subject: mail.subject,
      text: fillStringWithValues(mail.text, getDetails(visit, event)),
      html: fillStringWithValues(mail.html, getDetails(visit, event))
    })
    const promises = mail.ad.map(recipient => mailer.sendMail({
      from: 'Luma-Varaukset <noreply@helsinki.fi>',
      to: recipient,
      subject: mail.adSubject,
      text: fillStringWithValues(mail.adText, getDetails(visit, event)),
      html: getNotifyHtml(visit, event)
    }))
    try {
      await Promise.all(promises)
    } catch (err) {
      logger.error(`Employee transport error: ${err.message}`)
    }
  }
}

const sendReminder = () => sendAlert('reminder', 1)

const sendThanks = () => sendAlert('thanks', 0)

const sendWelcomes = async (visit, event) => {
  await send(visit, event, 'welcome')
}

const sendCancellation = async (visit, event) => {
  await send(visit, event, 'cancellation')
}

module.exports = { sendReminder, sendThanks, sendWelcomes, sendCancellation }
