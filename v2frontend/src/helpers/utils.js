import i18n from '../i18n'
import '@fullcalendar/react' // This line is needed or app throws an error
import fiLocale from '@fullcalendar/core/locales/fi'
import svLocale from '@fullcalendar/core/locales/sv'
import enLocale from '@fullcalendar/core/locales/en-gb'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import luxonPlugin from '@fullcalendar/luxon'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import * as XLSX from 'xlsx'
const lang = i18n.language

export const locale = lang.startsWith('fi')
  ? fiLocale : lang.startsWith('sv')
    ? svLocale : enLocale

export const plugins =  [
  timeGridPlugin,
  dayGridPlugin,
  interactionPlugin,
  listPlugin,
  luxonPlugin
]

export const getCSV = (visits) => {
  console.log(visits)
  try {
    const filteredVisits = visits
      //.filter(visit => visit.dataUseAgreement)
      .map(visit => {
        const mappedVisit = {
          ...visit,
          event: visit.event.title,
          eventId: visit.event.id,
          dataUseAgreement: visit.dataUseAgreement ? 'true' : 'false'
        }
        //delete mappedVisit.clientName
        //delete mappedVisit.clientEmail
        //delete mappedVisit.clientPhone
        return mappedVisit
      })
    const sheet = XLSX.utils.json_to_sheet(filteredVisits)
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, sheet, 'visits')
    XLSX.writeFile(book, 'visits.csv')
  } catch (err) { console.error(err) }
}

export const multipleExist = (arr, values) => values.every(v => arr.includes(v))
export const someExist = (arr, values) => values?.some(v => arr.includes(v))

export const formError = ({ errors }, message) => {
  if (Object.keys(errors).length) {
    console.log(errors, message) // toast here
    return true
  }
  return false
}