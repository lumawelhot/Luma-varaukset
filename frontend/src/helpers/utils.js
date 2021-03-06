/* eslint-disable no-unused-vars */
import '@fullcalendar/react' // This line is needed or app throws an error
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import luxonPlugin from '@fullcalendar/luxon'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventContext } from '../services/contexts'
import * as XLSX from 'xlsx'
import { parseCSV } from './parse'

export const plugins =  [
  timeGridPlugin,
  dayGridPlugin,
  interactionPlugin,
  listPlugin,
  luxonPlugin
]

export const getCSV = (visits, findEvent) => {
  try {
    const filteredVisits = visits
      ?.map(visit => {
        const event = findEvent(visit?.event?.id)
        return parseCSV(visit, event)
      })
    const sheet = XLSX.utils.json_to_sheet(filteredVisits)
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, sheet, 'visits')
    XLSX.writeFile(book, 'visits.csv')
  } catch (err) { console.error(err) }
}

export const multipleExist = (arr, values) => values?.every(v => arr?.includes(v))
export const someExist = (arr, values) => values?.some(v => arr?.includes(v))

export const formError = async current => {
  const errors = await current.validateForm()
  current.handleSubmit()
  if (Object.keys(errors).length) {
    return true
  }
  return false
}

export const customFormError = async (real, fields) => {
  for (let i in real) {
    const field = real[i]
    if (field?.validation?.required && fields[i]?.value?.length <= 0) {
      return true
    }
  }
  return false
}