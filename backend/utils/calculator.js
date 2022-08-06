// NOTE: Do not return any Date objects, return ISOStrings instead.
const { set } = require('date-fns')

// --------------------- HELPERS
const parseDate = date => set(new Date(date), { seconds: 0, milliseconds: 0 }).toISOString()

const sort = ranges => ranges.sort((a, b) => a[0] - b[0])

const findRange = (ranges, target) => {
  const start = target[0]
  const end = target[1]
  let range = undefined
  ranges.forEach(r => {
    if (r[0] <= start && end <= r[1]) range = r
  })
  return range
}

const split = (ranges, range, divider) => {
  const sorted = sort(ranges)
  const result = []
  sorted.forEach(r => {
    if (r[0] <= range[0] && range[1] <= r[1]) {
      if (r[0] < range[0] - divider) result.push([r[0], range[0] - divider])
      if (range[1] + divider < r[1]) result.push([range[1] + divider, r[1]])
    }
    else result.push(r)
  })
  return result
}

const diff = (ranges, range, divider) => {
  const sorted = sort(ranges.map(r => [r[0] - divider, r[1] + divider]))
  const result = []
  let start = range[0]
  sorted.forEach(r => {
    if (r[0] - start > 0) result.push([start, r[0]])
    start = r[1]
  })
  if (range[1] - start > 0) result.push([start, range[1]])
  return result
}
// -----------------------------

// Calculate new available times from current available times and visit time
const calcAvailableTimes = (availableTimes, visit, waitingTime, duration) => {
  const ranges = availableTimes.map(a => [new Date(a.startTime).getTime(), new Date(a.endTime).getTime()])
  const range = [new Date(visit.startTime).getTime(), new Date(visit.endTime).getTime()]
  const newAvailableTimes = split(ranges, range, waitingTime * 60000)
  return newAvailableTimes.filter(f => f[1] - f[0] >= duration * 60000).map(a => {
    return {
      startTime: parseDate(a[0]),
      endTime: parseDate(a[1])
    }
  })
}

// Calculate new available times from current visit times and event time
const calcFromVisitTimes = (visitTimes, event, waitingTime, duration) => {
  const ranges = visitTimes.map(a => [new Date(a.startTime).getTime(), new Date(a.endTime).getTime()])
  const range = [new Date(event.startTime).getTime(), new Date(event.endTime).getTime()]
  const newAvailableTimes = diff(ranges, range, waitingTime * 60000)
  return newAvailableTimes.filter(f => f[1] - f[0] >= duration * 60000).map(a => {
    return {
      startTime: parseDate(a[0]),
      endTime: parseDate(a[1])
    }
  })
}

// Check that new timeslot that fits with visit times
const calcTimeSlot = (visitTimes, startTime, endTime) => {
  if (!visitTimes || !visitTimes.length) return {
    start: parseDate(startTime),
    end: parseDate(endTime)
  }
  const startTimes = visitTimes.map(v => new Date(v.startTime).getTime()).sort((a, b) => a - b)
  const endTimes = visitTimes.map(v => new Date(v.endTime).getTime()).sort((a, b) => b - a)
  const start = new Date(startTimes[0])
  const end = new Date(endTimes[0])
  if (new Date(startTime) <= start && end <= new Date(endTime)) {
    return {
      start: parseDate(startTime),
      end: parseDate(endTime)
    }
  } else return null
}

// Check that the timeslot fits to available times
const validTimeSlot = (availableTimes, startTime, endTime) => {
  let result = false
  availableTimes.forEach(slot => {
    if (
      new Date(startTime) >= new Date(slot.startTime) &&
      new Date(endTime) <= new Date(slot.endTime)
    ) result = true
  })
  return result
}

// Check validity of timeslot
const checkTimeslot = (argsStart, argsEnd) => {
  const start = new Date(argsStart)
  const end = new Date(argsEnd)
  const [startHours, ] = new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(start).split('.')
  const [endHours, endMinutes]  =  new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(end).split('.')
  if (Number(startHours) < 8) return true
  if (Number(endHours) > 17 || (Number(endHours) === 17 && Number(endMinutes) !== 0)) return true
  if (start.getTime() >= end.getTime()) return true
  return false
}

// Fit timeslot to given date
const slotFromDate = (date, start, end) => {
  const dateObj = new Date(date)
  const startObj = new Date(start)
  const endObj = new Date(end)
  return [
    set(dateObj, { hours: startObj.getHours(), minutes: startObj.getMinutes(), seconds: 0, milliseconds: 0 }).toISOString(),
    set(dateObj, { hours: endObj.getHours(), minutes: endObj.getMinutes(), seconds: 0, milliseconds: 0 }).toISOString()
  ]
}

module.exports = {
  findRange,
  calcAvailableTimes,
  calcFromVisitTimes,
  calcTimeSlot,
  validTimeSlot,
  split,
  diff,
  sort,
  checkTimeslot,
  slotFromDate,
  parseDate
}