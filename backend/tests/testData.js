const { subDays, add, sub } = require('date-fns')
const { createDate16DaysInFuture, setToHelsinkiTime } = require('./testHelpers')

const details = {
  clientName: 'Teacher',
  clientEmail: 'teacher@school.com',
  clientPhone: '040-1234567',
  grade: '1. grade',
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
  start: createDate16DaysInFuture('09:00').toISOString(),
  end: createDate16DaysInFuture('15:00').toISOString(),
  booked: false,
  inPersonVisit: true,
  remoteVisit: false,
  waitingTime: 10,
  duration: 20,
  disabled: false
}

const eventDetails2 = {
  title: 'Up-And-Atom!',
  resourceids: [2],
  grades: [4],
  desc: 'Atom is a programming text editor developed by GitHub.',
  start: setToHelsinkiTime(new Date().toISOString(), '09:00').toISOString(),
  end: setToHelsinkiTime(new Date().toISOString(), '11:00').toISOString(),
  booked: false,
  inPersonVisit: false,
  remoteVisit: true,
  waitingTime: 15,
  duration: 75,
  disabled: false
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
  disabled: false
}

const eventDetails4 = {
  title: 'New-event',
  resourceids: [2],
  grades: [3, 4],
  start: '2021-06-01T10:00:00.000Z',
  end: '2021-06-01T12:00:00.000Z',
  inPersonVisit: true,
  remoteVisit: false,
  desc: 'Test event desc.',
  waitingTime: 15,
  duration: 75,
  disabled: false
}

const eventDetails5 = {
  title: 'Learn JavaScript!',
  scienceClass: [1,4],
  start: '2021-06-01T10:00:00.000Z',
  end: '2021-06-01T12:00:00.000Z',
  desc: 'JavaScript is the programming language of the Web.',
  remoteVisit: true,
  inPersonVisit: false,
  grades: [1, 3, 4],
  tags: ['Matematiikka', 'Fysiikka', 'Ohjelmointi', 'Maantiede', 'Kemia'],
  waitingTime: 15,
  duration: 60,
  extras: [],
  disabled: false
}

const invalidEventFieldDetails = {
  title: 'New-event',
  resourceids: [2],
  grades: [1],
  start: '2021-06-01T09:00:00.000Z',
  end: '2021-06-02T15:00:00.000Z',
  inPersonVisit: true,
  remoteVisit: false,
  fieldNotInSchema: 'Tiedeluokka Linkki',
  desc: 'Test event desc.',
  waitingTime: 15,
  duration: 10,
  extras: [],
  disabled: false
}

const availableDate = createDate16DaysInFuture('09:00')
const fiveHoursAdded = createDate16DaysInFuture('14:00')

const availableForLoggedInDate = setToHelsinkiTime(add(new Date(), { days: 1 }).toISOString(), '09:00')
const twoHoursAddedForLoggedIn = setToHelsinkiTime(add(new Date(), { days: 1 }).toISOString(), '11:00')

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
  extras: [],
  disabled: false
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
  extras: [],
  disabled: false
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
  extras: [],
  disabled: false
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
  disabled: false
}

const eventDayAfter = {
  start: setToHelsinkiTime(add(new Date(), { days: 1 }).toISOString(), '09:00').toISOString(),
  end: setToHelsinkiTime(add(new Date(), { days: 1 }).toISOString(), '15:00').toISOString(),
  ...mailSenderTestDetails
}

const eventDayBefore = {
  start: setToHelsinkiTime(sub(new Date(), { days: 1 }).toISOString(), '09:00').toISOString(),
  end: setToHelsinkiTime(sub(new Date(), { days: 1 }).toISOString(), '15:00').toISOString(),
  ...mailSenderTestDetails
}

const eventNow = {
  start: setToHelsinkiTime(new Date().toISOString(), '09:00').toISOString(),
  end: setToHelsinkiTime(new Date().toISOString(), '15:00').toISOString(),
  ...mailSenderTestDetails
}

const eventDataDetails = {
  title: 'Up-And-Atom!',
  resourceids: [2],
  grades: [1],
  inPersonVisit: false,
  remoteVisit: true,
  disabled: false,
  reserved: 'token',
  extras: [],
}

const eventData1 = {
  start: createDate16DaysInFuture('09:00'),
  end: createDate16DaysInFuture('15:00'),
  availableTimes: [{ startTime: createDate16DaysInFuture('09:00'), endTime: createDate16DaysInFuture('15:00') }],
  waitingTime: 20,
  duration: 60,
  ...eventDataDetails
}

const eventData2 = {
  start: createDate16DaysInFuture('09:00'),
  end: createDate16DaysInFuture('15:00'),
  availableTimes: [{
    startTime: createDate16DaysInFuture('09:00'),
    endTime: createDate16DaysInFuture('11:00')
  },
  {
    startTime: createDate16DaysInFuture('13:00'),
    endTime: createDate16DaysInFuture('15:00')
  }],
  waitingTime: 15,
  duration: 60,
  ...eventDataDetails
}

const eventData3 = {
  start: createDate16DaysInFuture('09:00'),
  end: createDate16DaysInFuture('15:00'),
  availableTimes: [{ startTime: createDate16DaysInFuture('09:00'), endTime: createDate16DaysInFuture('15:00') }],
  waitingTime: 10,
  duration: 30,
  ...eventDataDetails
}

const eventData4 = {
  start: createDate16DaysInFuture('09:00'),
  end: createDate16DaysInFuture('15:00'),
  availableTimes: [{ startTime: createDate16DaysInFuture('09:00'), endTime: createDate16DaysInFuture('15:00') }],
  waitingTime: 15,
  duration: 60,
  ...eventDataDetails
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
  eventNow,
  eventData1,
  eventData2,
  eventData3,
  eventData4
}