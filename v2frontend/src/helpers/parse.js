import { differenceInDays, differenceInHours } from 'date-fns'
import { BOOKING_FAILS_DAYS_REMAINING, BOOKING_FAILS_HOURS_REMAINING, CLASSES } from '../config'
import { calcAvailableTimes } from './calculator'

export const parseEvent = (event) => event
  ?.availableTimes.map(timeSlot => ({
    id: event.id,
    start: new Date(timeSlot.startTime),
    end: new Date(timeSlot.endTime),
    booked: false,
    disabled: event.disabled,
    resourceids: event.resourceids,
    title: event.title,
    locked: event.locked,
  })).concat(event?.visits.map(visit => ({
    id: event.id,
    start: new Date(visit.startTime),
    end: new Date(visit.endTime),
    booked: true,
    disabled: false,
    resourceids: event.resourceids,
    title: event.title,
    locked: false
  })))

const resourceColors = CLASSES.map(c => c.color)

export const calendarEvents = (events, user) => events
  ?.filter(event => !(!user && event.disabled))
  ?.map(event => {
    const { id, color, start, end, title, locked, selected } = event
    const afterDays = differenceInDays(event.start, new Date()) >= BOOKING_FAILS_DAYS_REMAINING
    const afterHours = differenceInHours(event.start, new Date()) >= BOOKING_FAILS_HOURS_REMAINING
    const booked = (!user && !afterDays) || (user && !afterHours) || event.booked
    const unAvailable = booked || event.disabled
    event.color = unAvailable
      ? '#8a8a8a' : (event.resourceids.length > 1 ? '#fca311'
        : resourceColors[event.resourceids[0] - 1])
    return {
      editable: !booked && !event.disabled && user,
      booked: event.booked,
      id,
      color: selected ? 'black' : color,
      start,
      end,
      eventStart: start,
      eventEnd: end,
      title,
      locked,
      constraint: 'businessHours',
      durationEditable: false,
      unAvailable,
      selected
    }
  })

export const parseTags = tags => tags.map(t => ({
  label: t.name,
  value: t.name,
  id: t.id
}))

export const parseExtras = extras => extras.map(e => e.id)

export const combineEvent = (visit, event) => {
  return {
    ...{
      ...event,
      visits: [...event.visits, visit]
    },
    availableTimes: calcAvailableTimes(event.availableTimes, visit, event.waitingTime, event.duration)
  }
}