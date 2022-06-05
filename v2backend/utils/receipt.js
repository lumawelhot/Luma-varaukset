const { format } = require('date-fns')
const puppeteer = require('puppeteer')
const { CLASSES } = require('./config')
const { getBookingInfo } = require('./html')

const getPdfContent = async (html) => {
  const browser = await puppeteer.launch({
    headless: true
  })
  const page = await browser.newPage()
  await page.setContent(html, {
    waitUntil: 'domcontentloaded'
  })
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: {
      top: '2cm',
      bottom: '2cm',
      left: '2cm',
      right: '2cm'
    }
  })
  await browser.close()

  return pdfBuffer
}

const u = (field) => {
  if (field === undefined) return ''
  else return field
}

const getCustomFormHtml = data => {
  if (!data) return ''
  let html = ''
  for (let d of data) {
    if (typeof d.value === 'string') {
      html += `
      <div class="grid-container">
        <div class="grid-item">${d.name}</div>
        <div class="grid-item">${d.value}</div>
      </div>
      `
    } else if (Array.isArray(d.value)) {
      let selectedHtml = ''
      for (let v of d.value) {
        selectedHtml += `<div>${v}</div>`
      }
      html += `
      <div class="grid-container">
        <div class="grid-item">${d.name}</div>
        <div class="grid-item">
          ${selectedHtml}
        </div>
      </div>
    `}
  }
  return html
}

const getScienceClasses = data => {
  if (!data) return ''
  let html = ''
  for (let d of data) {
    html += `<div>${u(CLASSES[d - 1])}</div>`
  }
  return html
}

const getAttachment = async (visit, event) => {
  return await getPdfContent(getBookingInfo({
    eventName: u(event.title),
    eventDescription: u(event.description),
    eventScienceClasses: getScienceClasses(event.resourceids),
    eventDate: u(format(new Date(event.start), 'dd.MM.yy')),
    eventStart: u(format(new Date(visit.startTime), 'HH:mm')),
    eventEnd: u(format(new Date(visit.endTime), 'HH:mm')),
    eventType: u(visit.removeVisit ? 'Etävierailu' : 'Lähivierailu'),
    name: u(visit.clientName),
    phone: u(visit.clientPhone),
    email: u(visit.clientEmail),
    schoolName: u(visit.schoolName),
    schoolLocation: u(visit.schoolLocation),
    grade: u(visit.grade),
    participants: u(visit.participants),
    dataUseAgreement: u(visit.dataUseAgreement ? 'Kyllä' : 'Ei'),
    language: u(visit.language === 'fi' ? 'Suomi' : (visit.language === 'en' ? 'Englanti' : 'Ruotsi')),
    customFormHtml: u(getCustomFormHtml(visit.customFormData))
  }))
}

module.exports = { getAttachment }