import { add } from 'date-fns'
import { parseExtras, parseTags } from './parse'
import { todayByHours } from './utils'

export const extraInit = {
  name: '',
  inPersonLength: '',
  remoteLength: '',
  classes: []
}

export const userInit = {
  username: '',
  password: '',
  isAdmin: 'false',
  confirm: ''
}

export const groupInit = {
  name: '',
  maxCount: ''
}

export const customformInit = isCancellation => ({
  name: isCancellation ? 'cancellation' : '',
  fields: []
})

// refactoring ???
export const eventInitialValues = (event = {}) => {
  const {
    duration,
    tags,
    languages,
    grades,
    resourceids,
    start,
    end,
    inPersonVisit,
    remoteVisit,
    remotePlatforms,
    extras,
    publishDate,
    customForm,
    group,
    waitingTime,
    limits,
    closedDays
  } = event

  return {
    ...event,
    waitingTime: waitingTime || 15,
    duration: duration || 60,
    tags: tags ? parseTags(tags) : [],
    languages: languages || ['fi'],
    grades: grades?.map(g => String(g)) || [],
    resourceids: resourceids?.map(r => String(r)) || [],
    start: start ? new Date(start) : todayByHours(8),
    end: end ? new Date(end) : todayByHours(16),
    inPersonVisit: inPersonVisit !== undefined ? inPersonVisit : true,
    remoteVisit: remoteVisit !== undefined ? remoteVisit : true,
    remotePlatforms: remotePlatforms?.map(r => String(r)) || ['1', '2', '3'],
    extras: extras ? parseExtras(extras) : [],
    publishDate: publishDate ? new Date(publishDate) : null,
    closedDays: closedDays || 14,
    customForm: customForm ? {
      value: customForm.id,
      label: customForm.name,
      fields: customForm.fields
    } : null,
    group: group ? { value: group.id, label: group.name } : '',
    dates: [],
    remoteMaxParticipants: limits?.remote?.maxParticipants,
    inPersonMaxParticipants: limits?.inPerson?.maxParticipants
  }
}

export const visitInitialValues = (event, visit = {}) => {
  const { inPersonVisit, language, remoteVisit } = visit
  const data = visit?.customFormData?.map(f => [f.name, f.value])
  const values = data ? Object.fromEntries(data) : {}
  const customFormData = event?.customForm?.fields?.map(({ type, name }) =>
    ({ name, value: values[name] || (type === 'checkbox' ? [] : '') }))
  return {
    ...visit,
    language: language || event.languages[0],
    extras: visit.extras?.map(e => e.id) || [],
    startTime: new Date(event.start),
    endTime: add(new Date(event.start), { minutes: event.duration }),
    visitType: inPersonVisit ? 'inperson' : remoteVisit ? 'remote' : undefined,
    customFormData,
    limits: event.limits,
  }
}

export const cancelInitialValues = form => {
  const { name, type } = form
  return { name, value: type === 'checkbox' ? [] : '' }
}
