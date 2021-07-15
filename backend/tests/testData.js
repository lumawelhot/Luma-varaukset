const { set, subDays, setMilliseconds, setSeconds, setMinutes, setHours, add, sub, addDays } = require('date-fns')

const details = {
  clientName: 'Teacher',
  clientEmail: 'teacher@school.com',
  clientPhone: '040-1234567',
  grade: '1',
  schoolName: 'school',
  schoolLocation: 'Helsinki',
  participants: 13,
  inPersonVisit: true,
  remoteVisit: true,
  dataUseAgreement: true
}

const eventDetails1 = {
  title: 'All About Algebra',
  resourceids: [1],
  grades: [1, 2],
  desc: 'Algebra is one of the broad areas of mathematics, together with number theory, geometry and analysis.',
  start: addDays(set(new Date(), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }), 16).toISOString(),
  end: addDays(set(new Date(), { hours: 15, minutes: 0, seconds: 0, milliseconds: 0 }), 16).toISOString(),
  booked: false,
  inPersonVisit: true,
  remoteVisit: false,
  waitingTime: 10,
  duration: 20,
}

const eventDetails2 = {
  title: 'Up-And-Atom!',
  resourceids: [2],
  grades: [4],
  desc: 'Atom is a programming text editor developed by GitHub.',
  start: set(new Date(), { hours: 9, minutes: 30, seconds: 0, milliseconds: 0 }).toISOString(),
  end: set(new Date(), { hours: 11, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString(),
  booked: false,
  inPersonVisit: false,
  remoteVisit: true,
  waitingTime: 15,
  duration: 75,
}

const eventDetails3 = {
  title: 'Old event!',
  resourceids: [1],
  grades: [2],
  desc: '3',
  start: subDays(new Date(), 100).toISOString(),
  end: subDays(new Date(), 100).toISOString(),
  booked: false,
  inPersonVisit: false,
  remoteVisit: true,
  waitingTime: 15,
  duration: 75,
}

const eventDetails4 = {
  title: 'New-event',
  resourceids: [2],
  grades: [3, 4],
  start: '2021-06-01T10:00:00+0300',
  end: '2021-06-01T12:00:00+0300',
  inPersonVisit: true,
  remoteVisit: false,
  desc: 'Test event desc.',
  waitingTime: 15,
  duration: 75,
}

const eventDetails5 = {
  title: 'Learn JavaScript!',
  scienceClass: [1,4],
  start: '2021-06-01T10:00:00+0300',
  end: '2021-06-01T12:00:00+0300',
  desc: 'JavaScript is the programming language of the Web.',
  remoteVisit: true,
  inPersonVisit: false,
  grades: [1, 3, 4],
  tags: [{ name: 'Matematiikka' }, { name: 'Fysiikka' }, { name: 'Ohjelmointi' }, { name: 'Maantiede' }, { name: 'Kemia' } ],
  waitingTime: 15,
  duration: 60,
  extras: []
}

const invalidEventFieldDetails = {
  title: 'New-event',
  resourceids: [2],
  grades: [1],
  start: '2021-06-01T09:00:00+0300',
  end: '2021-06-02T15:00:00+0300',
  inPersonVisit: true,
  remoteVisit: false,
  fieldNotInSchema: 'Tiedeluokka Linkki',
  desc: 'Test event desc.',
  waitingTime: 15,
  duration: 10,
  extras: []
}

const availableDate = setMilliseconds(setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 9), 0), 0), 0)
const fiveHoursAdded = setMilliseconds(setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 14), 0), 0), 0)

const availableForLoggedInDate = setMilliseconds(setSeconds(setMinutes(setHours(add(new Date(), { days: 1 }), 9), 0), 0), 0)
const twoHoursAddedForLoggedIn = setMilliseconds(setSeconds(setMinutes(setHours(add(new Date(), { days: 1 }), 11), 0), 0), 0)

const unavailableForLoggedInDate = new Date()
unavailableForLoggedInDate.setDate(new Date().getDate() - 2)

const availableEventData = {
  title: 'Up-And-Atom!',
  resourceids: [2],
  grades: [1],
  start: availableDate,
  end: fiveHoursAdded,
  inPersonVisit: false,
  remoteVisit: true,
  availableTimes: [{ startTime: availableDate, endTime: fiveHoursAdded }],
  waitingTime: 15,
  duration: 60,
  extras: []
}

const availableForLoggedInEventData = {
  title: 'Last minute event!',
  resourceId: 1,
  grades: [1],
  start: availableForLoggedInDate,
  end: twoHoursAddedForLoggedIn,
  inPersonVisit: true,
  remoteVisit: false,
  availableTimes: [{ startTime: availableForLoggedInDate, endTime: twoHoursAddedForLoggedIn }],
  waitingTime: 15,
  duration: 60,
  extras: []
}

const unvailableForLoggedInUserEventData = {
  title: 'Past event',
  resourceId: 1,
  grades: [1],
  start: unavailableForLoggedInDate,
  end: unavailableForLoggedInDate,
  inPersonVisit: true,
  remoteVisit: false,
  availableTimes: [],
  waitingTime: 15,
  duration: 60,
  extras: []
}

const mailSenderTestDetails = {
  title: 'MailSender!',
  resourceids: [1],
  grades: [2],
  desc: '3',
  booked: false,
  inPersonVisit: false,
  remoteVisit: true,
  waitingTime: 15,
  duration: 75,
}

const eventDayAfter = {
  start: setHours(add(new Date(), { days: 1 }), 9).toISOString(),
  end: setHours(add(new Date(), { days: 1 }), 15).toISOString(),
  ...mailSenderTestDetails
}

const eventDayBefore = {
  start: setHours(sub(new Date(), { days: 1 }), 9).toISOString(),
  end: setHours(sub(new Date(), { days: 1 }), 15).toISOString(),
  ...mailSenderTestDetails
}

const eventNow = {
  start: setHours(new Date(), 9).toISOString(),
  end: setHours(new Date(), 15).toISOString(),
  ...mailSenderTestDetails
}

module.exports = {
  details,
  eventDetails1,
  eventDetails2,
  eventDetails3,
  eventDetails4,
  eventDetails5,
  invalidEventFieldDetails,
  availableEventData,
  availableForLoggedInEventData,
  unvailableForLoggedInUserEventData,
  eventDayAfter,
  eventDayBefore,
  eventNow
}