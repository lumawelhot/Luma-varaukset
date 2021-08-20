const Event = require('../models/event')
const Visit = require('../models/visit')
const { eventDayAfter, eventDayBefore, eventNow, details } = require('./testData')
const { sendReminder, sendThanks } = require('../utils/mailSender')
const { sub } = require('date-fns')

let dayBeforeVisit
let cancelledDayAfterVisit
let dayAfterVisit
let eventTodayVisit
let cancelledEventTodayVisit

beforeEach(async () => {
  await Event.deleteMany({})
  await Visit.deleteMany({})

  const dayBefore = new Event(eventDayBefore)
  const dayAfter = new Event(eventDayAfter)
  const eventToday = new Event(eventNow)
  await dayBefore.save()
  await dayAfter.save()
  await eventToday.save()

  dayBeforeVisit = new Visit({
    ...details,
    event: dayBefore,
    status: true,
    startTime: dayBefore.start,
    endTime: dayBefore.end
  })

  dayAfterVisit = new Visit({
    ...details,
    event: dayAfter,
    status: true,
    startTime: dayAfter.start,
    endTime: sub(new Date(dayAfter.end), { hours: 3 }).toISOString()
  })

  eventTodayVisit = new Visit({
    ...details,
    event: eventToday,
    status: true,
    startTime: sub(new Date(eventToday.start), { hours: 3 }).toISOString(),
    endTime: eventToday.end
  })

  cancelledEventTodayVisit = new Visit({
    ...details,
    event: eventToday,
    status: false,
    startTime: eventToday.start,
    endTime: sub(new Date(eventToday.end), { hours: 3 }).toISOString()
  })

  cancelledDayAfterVisit = new Visit({
    ...details,
    event: dayAfter,
    status: false,
    startTime: sub(new Date(dayAfter.end), { hours: 3 }).toISOString(),
    endTime: dayAfter.end
  })

  await cancelledEventTodayVisit.save()
  await cancelledDayAfterVisit.save()
  await dayBeforeVisit.save()
  await dayAfterVisit.save()
  await eventTodayVisit.save()
})

describe('Visit reminders', () => {
  it('without cancellation are sent properly', async () => {
    const { success } = await sendReminder()
    expect(success.length).toBe(1)
    expect(success[0]._id).toEqual(dayAfterVisit._id)
  })

  it('with cancellation are not sent', async () => {
    const { failed } = await sendReminder()
    expect(failed.length).toBe(1)
    expect(failed[0]._id).toEqual(cancelledDayAfterVisit._id)
  })
})

describe('Visit thank you message', () => {
  it('without cancellation are sent properly', async () => {
    const { success } = await sendThanks()
    expect(success.length).toBe(1)
    expect(success[0]._id).toEqual(eventTodayVisit._id)
  })

  it('with cancellation are not sent', async () => {
    const { failed } = await sendThanks()
    expect(failed.length).toBe(1)
    expect(failed[0]._id).toEqual(cancelledEventTodayVisit._id)
  })
})