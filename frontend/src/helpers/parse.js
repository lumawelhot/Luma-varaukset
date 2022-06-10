import { differenceInDays, differenceInHours, format } from 'date-fns'
import { BOOKING_FAILS_DAYS_REMAINING, BOOKING_FAILS_HOURS_REMAINING, CLASSES, PLATFORMS } from '../config'
import { calcAvailableTimes } from './calculator'

export const parseEvent = (event) => event
  ?.availableTimes.map(timeSlot => ({
    id: event.id,
    start: new Date(timeSlot?.startTime),
    end: new Date(timeSlot?.endTime),
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

export const parseCSV = (visit, event) => {
  const parsed = {}

  parsed['Event id'] = visit?.event?.id
  parsed['Event title'] = event?.title
  parsed['Event duration'] = event?.duration
  parsed['Event date'] = visit?.startTime ? format(new Date(visit?.startTime), 'd.M.yyyy') : ''
  parsed['Event start'] = visit?.startTime ? format(new Date(visit?.startTime), 'HH:mm') : ''
  parsed['Event end'] = visit?.endTime ? format(new Date(visit?.endTime), 'HH:mm') : ''
  parsed['Event type'] = visit?.remoteVisit ? 'etäopetus' : 'lähiopetus'
  parsed['Event language'] = visit?.language === 'en' ? 'englanti' : (visit?.language === 'sv' ? 'ruotsi' : 'suomi')
  parsed['Event grade'] = visit?.grade
  parsed['Event cancelled'] = visit?.status ? 'false' : 'true'
  parsed['Event group'] = event?.group
  parsed['Event science class'] = event?.resourceids?.map(r => CLASSES.find(c => c.value === r)?.label).join(', ')

  const platform = Number(visit?.remotePlatform) - 1
  parsed['Remote platform'] = Number.isNaN(platform) ? '' : (PLATFORMS
    .map((_, i) => i).includes(platform) ? PLATFORMS[platform] : event.otherRemotePlatformOption)
  parsed['Client name'] = visit?.clientName
  parsed['Client email'] = visit?.clientEmail
  parsed['Client phone'] = visit?.clientPhone
  parsed['School name'] = visit?.schoolName
  parsed['School location'] = visit?.schoolLocation
  parsed['Data use agreement'] = visit?.dataUseAgreement ? 'true' : 'false'

  parsed['Participants'] = visit?.participants
  parsed['Custom form data'] = visit?.customFormData?.map(d => {
    if (typeof d.value === 'string') return `${d.name}: "${d.value}"`
    else if (Array.isArray(d.value)) return `${d.name}: "${d.value.join(', ')}"`
  }).join(' // ')
  parsed['Visit extras'] = visit?.extras?.map(e => `"${e.name}"`).join(', ')

  return parsed
}