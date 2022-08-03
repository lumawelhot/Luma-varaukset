const { addDays, set } = require('date-fns')
const times = { minutes: 0, seconds: 0, milliseconds: 0 }

const commonDetails = {
  desc: 'This is a description',
  duration: 45,
  grades: [1, 3, 4],
  inPersonVisit: true,
  languages: ['fi'],
  otherRemotePlatformOption: '',
  publishDate: null,
  remotePlatforms: [],
  remoteVisit: false,
  resourceids: [4],
  title: 'This is a new event',
  waitingTime: 15,
}

const eventsInTheFuture = {
  ...commonDetails,
  dates: [
    addDays(new Date(), 14).toISOString(),
    addDays(new Date(), 21).toISOString()
  ],
  start: set(new Date(), { hours: 10, ...times }).toISOString(),
  end: set(new Date(), { hours: 13, ...times }).toISOString()
}
const eventsInTheFutureDates = [
  (set(addDays(new Date(), 14), { hours: 10, ...times })).toISOString(),
  (set(addDays(new Date(), 21), { hours: 10, ...times })).toISOString(),
]

const getTimeByHours = (startHours, endHours) => ({
  dates: [ addDays(new Date(), 21).toISOString() ],
  start: set(new Date(), { hours: startHours, ...times }).toISOString(),
  end: set(new Date(), { hours: endHours, ...times }).toISOString()
})

const eventTooEarly = { ...commonDetails, ...getTimeByHours(7, 10) }
const eventTooLate = { ...commonDetails, ...getTimeByHours(13, 18) }
const eventStartAfterEnd = { ...commonDetails, ...getTimeByHours(11, 10) }

module.exports = {
  eventsInTheFuture,
  eventsInTheFutureDates,
  eventTooEarly,
  eventTooLate,
  eventStartAfterEnd
}