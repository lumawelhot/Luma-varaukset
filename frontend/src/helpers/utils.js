import '@fullcalendar/react' // This line is needed or app throws an error
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import luxonPlugin from '@fullcalendar/luxon'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import * as XLSX from 'xlsx'
import { parseCSV } from './parse'
import { set } from 'date-fns'

export const plugins = [
  timeGridPlugin,
  dayGridPlugin,
  interactionPlugin,
  listPlugin,
  luxonPlugin
]

export const getCSV = (visits, events, findEvent) => {
  try {
    const filteredVisits = visits
      ?.map(visit => {
        const event = findEvent(visit?.event?.id)
        return parseCSV(visit, event)
      })
    const nonBooked = events
      ?.map(event => event.availableTimes?.map(a => ({
        ...event,
        startTime: new Date(a.startTime).toISOString(),
        endTime: new Date(a.endTime).toISOString()
      })))?.flat()
      ?.map(event => parseCSV({
        startTime: event.startTime,
        endTime: event.endTime
      }, event))
    const sheet = XLSX.utils.json_to_sheet(filteredVisits.concat(nonBooked))
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, sheet, 'visits')
    XLSX.writeFile(book, 'visits.csv')
  } catch (err) { console.error(err) }
}

export const multipleExist = (arr, values) => values?.every(v => arr?.includes(v))
export const someExist = (arr, values) => values?.some(v => arr?.includes(v))

export const exec = fn => () => {
  const _exec = async () => {
    const result = await fn()
    return result
  }
  _exec()
}

export const addOrUpdateById = (current, values) => {
  const modified = { ...current }
  if (Array.isArray(values)) {
    values.forEach(v => {
      modified[v.id] = v
    })
  } else modified[values.id] = values
  return modified
}

export const deleteByIds = (current, ids) => {
  const modified = { ...current }
  if (Array.isArray(ids)) {
    ids.forEach(id => {
      delete modified[id]
    })
  } else delete modified[ids]
  return modified
}

export const todayByHours = value => {
  const today = new Date()
  const helsinkiHours = Number(new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(today).split('.')[0])
  const hours = value + today.getHours() - helsinkiHours
  return set(new Date(), { seconds: 0, milliseconds: 0, minutes: 0, hours })
}
