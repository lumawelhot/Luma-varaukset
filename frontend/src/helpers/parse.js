import { differenceInDays, differenceInHours, format } from 'date-fns'
import { BOOKING_FAILS_DAYS_REMAINING, BOOKING_FAILS_HOURS_REMAINING, CLASSES, PLATFORMS } from '../config'

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
    closedDays: event.closedDays
  })).concat(event?.visits.map(visit => ({
    id: event.id,
    start: new Date(visit.startTime),
    end: new Date(visit.endTime),
    booked: true,
    disabled: false,
    resourceids: event.resourceids,
    title: event.title,
    locked: false,
    closedDays: event.closedDays
  })))

const resourceColors = CLASSES.map(c => c.color)

export const calendarEvents = (events, user) => events
  ?.filter(event => !(!user && event.disabled))
  ?.map(event => {
    const { id, color, start, end, title, locked, selected, closedDays } = event
    const afterDays = differenceInDays(event.start, new Date()) >= (closedDays || BOOKING_FAILS_DAYS_REMAINING)
    const afterHours = differenceInHours(event.start, new Date()) >= BOOKING_FAILS_HOURS_REMAINING
    const booked = (!user && !afterDays) || (user && !afterHours) || event.booked
    const unAvailable = booked || event.disabled
    event.color = unAvailable
      ? '#8a8a8a' : (event.resourceids.length > 1 ? '#fca311'
        : resourceColors[event.resourceids[0] - 1])
    return {
      editable: (!booked && !event.disabled && user) || user,
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

export const parseCSV = (visit, event) => {
  try {
    const platform = Number(visit?.remotePlatform) - 1
    const status = visit?.status === false
      ? 'Peruttu' : visit?.status === true
        ? 'Varattu' : event?.group?.disabled
          ? 'Kuului ryhmään, mutta ryhmä täynnä' : 'Varausaika päättyi'
    const type = visit?.teaching?.type

    return {
      'Event id': visit?.event?.id || event?.id,
      'Event title': event?.title,
      'Event duration': event?.duration,
      'Event date': visit?.startTime ? format(new Date(visit?.startTime), 'd.M.yyyy') : '',
      'Event start': visit?.startTime ? format(new Date(visit?.startTime), 'HH:mm') : '',
      'Event end': visit?.endTime ? format(new Date(visit?.endTime), 'HH:mm') : '',
      'Event type': type === 'remote' ? 'etäopetus'
        : type === 'inperson' ? 'lähiopetus Kumpulassa'
          : 'lähiopetus koululla',
      'Event language': visit?.language === 'en' ? 'englanti' : (visit?.language === 'sv' ? 'ruotsi' : 'suomi'),
      'Event grade': visit?.grade,
      'Event group': event?.group?.name,
      'Event science class': event?.resourceids?.map(r => CLASSES?.find(c => c?.value === r)?.label).join(', '),
      'Event status': status,
      'Remote platform': Number.isNaN(platform) ? '' : (PLATFORMS
        ?.map((_, i) => i)?.includes(platform) ? PLATFORMS[platform] : event?.otherRemotePlatformOption),
      'Client name': visit?.clientName,
      'Client email': visit?.clientEmail,
      'Client phone': visit?.clientPhone,
      'School name': visit?.schoolName,
      'School location': visit?.schoolLocation,
      'Data use agreement': visit?.dataUseAgreement ? 'true' : 'false',
      'Participants': visit?.participants,
      'Reason for cancel': Array.isArray(visit?.cancellation) ? visit?.cancellation?.map(d => {
        if (typeof d.value === 'string') return `${d.name}: "${d.value}"`
        else if (Array.isArray(d.value)) return `${d.name}: "${d.value?.join(', ')}"`
      })?.join(' // ') : '',
      'Custom form data': Array.isArray(visit?.customFormData) ? visit?.customFormData?.map(d => {
        if (typeof d.value === 'string') return `${d.name}: "${d.value}"`
        else if (Array.isArray(d.value)) return `${d.name}: "${d.value?.join(', ')}"`
      })?.join(' // ') : '',
      'Visit extras': visit?.extras?.map(e => `"${e.name}"`).join(', ')
    }
  } catch (err) {
    console.log(err.message)
    return {}
  }
}

export const parseCancellation = values => {
  // some technical debt here, this same thing defined below
  const fieldValues = Object.fromEntries(Object.entries(values)
    .filter(e => e[0].includes('custom-'))
    .map(e => [Number(e[0].split('-')[1]), e[1]]))
  return JSON.stringify(values.form.fields?.map((c, i) => ({ name: c.name, value: fieldValues[i] })))
}

export const parseVisitSubmission = values => {
  const fieldValues = Object.fromEntries(Object.entries(values)
    .filter(e => e[0].includes('custom-'))
    .map(e => [Number(e[0].split('-')[1]), e[1]]))
  const otherRemote = values.otherRemotePlatformOption
  const type = values.visitType
  const location = otherRemote?.length ? otherRemote : values?.remotePlatform
  const customFormData = JSON.stringify(values.customFormData?.map((c, i) => ({ ...c, value: fieldValues[i] })))
  return {
    ...values,
    teaching: {
      type,
      location
    },
    customFormData,
    participants: Number(values.participants)
  }
}

export const parseEventSubmission = values => {
  const {
    tags,
    resourceids,
    grades,
    remotePlatforms,
    group,
    extras,
    customForm,
    dates,
    remoteMaxParticipants,
    inPersonMaxParticipants,
    schoolMaxParticipants,
    closedDays,
    teaching
  } = values
  return {
    ...values,
    dates: dates?.map(d => new Date(d.date).toISOString()),
    tags: tags?.map(t => t.label),
    resourceids: resourceids?.map(r => Number(r)),
    grades: grades?.map(g => Number(g)),
    closedDays: Number(closedDays),
    remotePlatforms: remotePlatforms?.map(r => Number(r)),
    group: group?.value || null,
    extras,
    customForm: customForm?.value || null,
    limits: JSON.stringify({
      remote: {
        maxParticipants: remoteMaxParticipants
      },
      inPerson: {
        maxParticipants: inPersonMaxParticipants
      },
      school: {
        maxParticipants: schoolMaxParticipants
      }
    }),
    inPersonVisit: teaching.includes('inperson'),
    remoteVisit: teaching.includes('remote'),
    schoolVisit: teaching.includes('school')
  }
}

// not only for form fields, handles also parsing limits
export const parseFormFields = data => {
  const form = data?.customForm
  const limits = data?.limits
  return {
    ...data,
    customForm: {
      ...form, fields: typeof form?.fields === 'string' ? JSON.parse(form.fields) : form?.fields
    },
    limits: typeof limits === 'string' ? JSON.parse(limits) : limits
  }
}
