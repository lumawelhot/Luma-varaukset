const { format } = require('date-fns')
const { CLASSES } = require('../../config')
const { helsinkiTime } = require('../calculator')

const u = (field) => field === undefined ? '' : field

const scienceClasses = data => {
  if (!data) return ''
  let html = ''
  for (const d of data) {
    html += `<div>${u(CLASSES[d - 1])}</div>`
  }
  return html
}

const gridContainer = (name, value) => `
<div class="grid-container">
  <div class="grid-item">${u(name)}</div>
  <div class="grid-item">${u(value)}</div>
</div>
`

const containerContent = (names, values) => {
  let containerHtml = ''
  for (const i in names) {
    containerHtml += gridContainer(names[i], values[i])
  }
  return containerHtml
}

const customFormHtml = data => {
  if (!data) return ''
  const fields = typeof data === 'string' ? JSON.parse(data) : data
  let html = ''
  for (const d of fields) {
    if (typeof d.value === 'string') {
      html += gridContainer(d.name, d.value)
    } else if (Array.isArray(d.value)) {
      let selectedHtml = ''
      for (const v of d.value) {
        selectedHtml += `<div>${v}</div>`
      }
      html += gridContainer(d.name, selectedHtml)
    }
  }
  return html
}

const bookingInfo = (event, visit, cancellation) => `
<!DOCTYPE html>
<body>
  <style>
    body {
      font-family: sans-serif;;
    }
    #header {
      text-decoration: underline;
      padding-bottom: 10px;
    }
    .container {
      margin-left: 1em;
    }
    .grid-container {
      display: grid;
      gap: 50px;
      grid-template-columns: 200px auto;
    }
    .grid-item {
      padding-bottom: 5px;
    }
  </style>
  <h1 id="header">
    Varauksen tiedot
  </h1>
  ${cancellation}
  <h3 id="subheader">
    Vierailun tiedot:
  </h3>
  <div class="container">
    ${event}
  </div>
  <h3 id="subheader">
    Varaajan tiedot:
  </h3>
  <div class="container">
    ${visit}
  </div>
</body>
`

const getNotifyHtml = (visit, event) => {
  try {
    const type = visit?.teaching?.type
    return bookingInfo(
      containerContent(
        [
          'Vierailun nimi',
          'Vierailun kuvaus',
          'Tiedeluokka(t)',
          'Päivämäärä',
          'Aloitusajankohta',
          'Lopetusajankohta',
          'Vierailun tyyppi'
        ],
        [
          u(event.title),
          u(event.description),
          scienceClasses(event.resourceids),
          u(format(helsinkiTime(event.start), 'dd.MM.yy')),
          u(format(helsinkiTime(event.start), 'HH:mm')),
          u(format(helsinkiTime(visit.endTime), 'HH:mm')),
          u(type === 'remote' ? 'Etävierailu'
            : type === 'school' ? 'Lähivierailu koululla'
              : 'Lähivierailu Kumpulassa'),
        ]
      ),
      containerContent(
        [
          'Varaajan nimi',
          'Varaajan puhelinnumero',
          'Varaajan sähköpostiosoite',
          'Opetusyhteisön nimi',
          'Opetusyhteisön sijainti',
          'Luokka-aste',
          'Osallistujamäärä',
          'Lupa tutkimuskäyttöön',
          'Kieli'
        ],
        [
          u(visit.clientName),
          u(visit.clientPhone),
          u(visit.clientEmail),
          u(visit.schoolName),
          u(visit.schoolLocation),
          u(visit.grade),
          u(visit.participants),
          u(visit.dataUseAgreement ? 'Kyllä' : 'Ei'),
          u(visit.language === 'fi' ? 'Suomi' : (visit.language === 'en' ? 'Englanti' : 'Ruotsi'))
        ]
      ) + u(customFormHtml(visit.customFormData)),
      visit.cancellation ? `
        <h3 id="subheader">
          Peruutuksen tiedot:
        </h3>
        <div class="container">
          ${u(customFormHtml(visit.cancellation))}
        </div>
      ` : ''
    )
  } catch (err) {
    return `
      <h1>500 - Internal Server Error</h1>
      <div>Debug: ${err.message}</div>
    `
  }
}

module.exports = { getNotifyHtml, u, scienceClasses }
