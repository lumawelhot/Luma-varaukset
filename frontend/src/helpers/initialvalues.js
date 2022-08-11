import { add, set } from 'date-fns'
import { parseExtras, parseTags } from './parse'

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

export const eventInit = {
  title: '',
  group: '',
  duration: 60,
  tags: [],
  languages: ['fi'],
  grades: [],
  resourceids: [],
  extras: [],
  waitingTime: 15,
  desc: '',
  start: set(new Date(), { seconds: 0, milliseconds: 0, minutes: 0, hours: 8 }),
  end: set(new Date(), { seconds: 0, milliseconds: 0, minutes: 0, hours: 16 }),
  inPersonVisit: true,
  remoteVisit: true,
  remotePlatforms: ['1', '2', '3'],
  publishDate: null,
  customForm: null,
}

export const customformInit = {
  name: '',
  fields: []
}

export const eventInitWithValues = ({
  title,
  duration,
  tags,
  languages,
  grades,
  resourceids,
  desc,
  eventEnd,
  eventStart,
  inPersonVisit,
  remoteVisit,
  remotePlatforms,
  otherRemotePlatformOption,
  extras,
  publishDate,
  customForm,
  group
}) => ({
  ...eventInit,
  title: title ? title : '',
  duration: duration ? duration : 60,
  tags: tags ? parseTags(tags) : [],
  languages: languages ? languages : [],
  grades: grades ? grades.map(g => String(g)) : [],
  resourceids: resourceids ? resourceids.map(r => String(r)) : [],
  desc: desc ? desc : '',
  start: eventStart,
  end: eventEnd,
  inPersonVisit,
  remoteVisit,
  remotePlatforms: remotePlatforms ? remotePlatforms.map(r => String(r)) : [],
  otherRemotePlatformOption: otherRemotePlatformOption ? otherRemotePlatformOption : '',
  extras: extras ? parseExtras(extras) : [],
  publishDate: publishDate ? new Date(publishDate) : null,
  customForm: customForm ? {
    value: customForm.id,
    label: customForm.name,
    fields: customForm.fields
  } : null,
  group: group ? {
    value: group.id,
    label: group.name
  } : ''
})

export const visitInitialValues = (event, form) => ({
  clientName: '',
  schoolName: '',
  schoolLocation: '',
  clientEmail: '',
  verifyEmail: '',
  clientPhone: '',
  grade: '',
  participants: '',
  privacyPolicy: false,
  remoteVisitGuidelines: false,
  dataUseAgreement: false,
  language: event?.languages[0],
  otherRemotePlatformOption: '',
  extras: [],
  startTime: new Date(event.start),
  endTime: add(new Date(event.start), { minutes: event.duration }),
  visitType: event.inPersonVisit ? 'inperson' : 'remote',
  fields: [],
  customFormData: form?.fields?.map(f => {
    if (f.type === 'checkbox') return { name: f.name, value: [] }
    else return { name: f.name, value: '' }
  }),
  eventTimes: {
    start: new Date(event.start),
    end: new Date(event.end)
  }
})