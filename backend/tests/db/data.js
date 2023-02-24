const { addDays, set } = require('date-fns')
const { helsinkiZoneOffset } = require('../../utils/calculator')
const times = { minutes: 0, seconds: 0, milliseconds: 0 }

const commonDetails = {
  desc: 'This is a description',
  duration: 45,
  grades: [{
    'name': 'grade1'
  }, {
    'name': 'grade3'
  }, {
    'name': 'grade4'
  }],
  inPersonVisit: true,
  languages: ['fi'],
  otherRemotePlatformOption: '',
  publishDate: null,
  remotePlatforms: [],
  remoteVisit: false,
  schoolVisit: false,
  resourceids: [4],
  title: 'This is a new event',
  waitingTime: 15,
  extras: ['3', '5'],
  tags: ['Ohjelmointi', 'Algoritmit'],
  group: '2'
}

const modifyDetails = {
  desc: 'Modified description',
  duration: 15,
  grades: [{
    'name': 'grade2'
  }, {
    'name': 'grade3'
  }],
  languages: ['en'],
  resourceids: [1, 2],
  waitingTime: 5,
  extras: ['2', '5'],
  tags: ['Ohjelmointi', 'Matematiikka'],
  group: '1'
}

const eventsInTheFuture = {
  ...commonDetails,
  dates: [
    addDays(new Date(), 14).toISOString(),
    addDays(new Date(), 21).toISOString()
  ],
  start: set(new Date(), { hours: 10 + helsinkiZoneOffset(), ...times }).toISOString(),
  end: set(new Date(), { hours: 13 + helsinkiZoneOffset(), ...times }).toISOString()
}
const eventsInTheFutureDates = [
  (set(addDays(new Date(), 14), { hours: 10 + helsinkiZoneOffset(), ...times })).toISOString(),
  (set(addDays(new Date(), 21), { hours: 10 + helsinkiZoneOffset(), ...times })).toISOString(),
]

const getTimeByHours = (startHours, endHours) => ({
  dates: [ addDays(new Date(), 21).toISOString() ],
  start: set(new Date(), { hours: startHours + helsinkiZoneOffset(), ...times }).toISOString(),
  end: set(new Date(), { hours: endHours + helsinkiZoneOffset(), ...times }).toISOString()
})

const eventTooEarly = { ...commonDetails, ...getTimeByHours(7, 10) }
const eventTooLate = { ...commonDetails, ...getTimeByHours(13, 18) }
const eventStartAfterEnd = { ...commonDetails, ...getTimeByHours(11, 10) }


const visitClientDetails = {
  clientEmail: 'olli.opettaja@alppilankoulu.fi',
  clientName: 'Olli Opettaja',
  clientPhone: '050 313131313',
  customFormData: null,
  dataUseAgreement: false,
  extras: [],
  grade: '1st grade',
  language: 'fi',
  participants: 13,
  teaching: {
    type: 'inperson',
    location: undefined
  },
  schoolLocation: 'Alppila',
  schoolName: 'Alppilan koulu',
  token: '43bbd438-7362-4981-a05b-708c1107e4c1',
}

const visitTwoWeeksAhead = { ...visitClientDetails, event: '1' }

const visitLessThanTwoWeeksAhead = { ...visitClientDetails, event: '2' }

const visitOneHourAhead = { ...visitClientDetails, event: '4' }

const reservedEventVisit = { ...visitClientDetails, event: '3' }

const disabledEventVisit = { ...visitClientDetails, event: '8' }

const visitEventInFullGroup = { ...visitClientDetails, event: '9' }

const visitEventInDisabledGroup = { ...visitClientDetails, event: '10' }

const validExtra = {
  name: 'A new extra',
  inPersonLength: 31,
  remoteLength: 13,
  classes: [1, 3, 4, 5]
}

const validForm = {
  fields: '[{"name":"This is a question?","type":"text","validation":{"required":true}}]',
  name: 'Test form',
}

module.exports = {
  validExtra,
  validForm,
  visitTwoWeeksAhead,
  visitLessThanTwoWeeksAhead,
  visitOneHourAhead,
  eventsInTheFuture,
  eventsInTheFutureDates,
  eventTooEarly,
  eventTooLate,
  eventStartAfterEnd,
  reservedEventVisit,
  disabledEventVisit,
  visitEventInFullGroup,
  visitEventInDisabledGroup,
  modifyDetails
}
