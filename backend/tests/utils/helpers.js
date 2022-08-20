const { set, addDays } = require('date-fns')
const { calcFromVisitTimes } = require('../../utils/calculator')
const User = require('../../models/user')
const Event = require('../../models/event')
const Group = require('../../models/group')
const Visit = require('../../models/visit')

const dateByHours = (hours) => set(new Date(), { hours, minutes: 0, seconds: 0, milliseconds: 0 })

const timeConfig = { minutes: 0, seconds: 0, milliseconds: 0 }

const timeSlotByDay = (days, hours) => {
  const today = set(new Date(), timeConfig)
  const startTime = addDays(set(today, { hours: hours.start }), days).toISOString()
  const endTime = addDays(set(today, { hours: hours.end }), days).toISOString()
  return [startTime, endTime]
}

const timeByDaysAndHours = (days, hours) => addDays(set(new Date(), { hours, ...timeConfig }), days).toISOString()

const assignDates = (events, visits) => {
  events = events.map(event => {
    const start = timeByDaysAndHours(event.fromNow, 9)
    const end = timeByDaysAndHours(event.fromNow, 14)
    if (event.visits && event.visits.length > 0) {
      visits = visits.map(v => {
        if (event.visits.includes(v.id)) {
          return {
            ...v,
            startTime: set(new Date(start), { hours: v.startHours }).toISOString(),
            endTime: set(new Date(start), { hours: v.startHours, minutes: event.duration }).toISOString()
          }
        } else return v
      })
      const visitTimes = visits.filter(v => event.visits.includes(v.id))
        .map(v => ({ startTime: v.startTime, endTime: v.endTime }))
      return {
        ...event,
        start,
        end,
        availableTimes: calcFromVisitTimes(visitTimes, {
          startTime: start, endTime: end
        }, event.waitingTime, event.duration)
      }
    } else return {
      ...event,
      start,
      end,
      availableTimes: [{ startTime: start, endTime: end }],
    }
  })
  return [events, visits]
}

module.exports = {
  dateByHours,
  timeSlotByDay,
  assignDates,
  timeByDaysAndHours,
  models: {
    User,
    Event,
    Group,
    Visit
  }
}
