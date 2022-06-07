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

const calcAvailableTimes = (availableTimes, visit, waitingTime, duration) => {
  const ranges = availableTimes.map(a => [new Date(a.startTime).getTime(), new Date(a.endTime).getTime()])
  const range = [new Date(visit.startTime).getTime(), new Date(visit.endTime).getTime()]
  const newAvailableTimes = split(ranges, range, waitingTime * 60000)
  return newAvailableTimes.filter(f => f[1] - f[0] >= duration * 60000).map(a => {
    return {
      startTime: new Date(a[0]),
      endTime: new Date(a[1])
    }
  })
}

const calcFromVisitTimes = (visitTimes, event, waitingTime, duration) => {
  const ranges = visitTimes.map(a => [new Date(a.startTime).getTime(), new Date(a.endTime).getTime()])
  const range = [new Date(event.startTime).getTime(), new Date(event.endTime).getTime()]
  const newAvailableTimes = diff(ranges, range, waitingTime * 60000)
  return newAvailableTimes.filter(f => f[1] - f[0] >= duration * 60000).map(a => {
    return {
      startTime: new Date(a[0]),
      endTime: new Date(a[1])
    }
  })
}

const calceNewSlot = (visitTimes, startTime, endTime) => {
  const sortedVisitTimes = visitTimes.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  const start = new Date(sortedVisitTimes[0].startTime)
  const end = new Date(sortedVisitTimes[sortedVisitTimes.length - 1].endTime)
  if (startTime <= start && end <= endTime) {
    return {
      start: startTime,
      end: endTime
    }
  } else return null
}

const validTimeSlot = (availableTimes, visitTime) => {
  let result = false
  availableTimes.forEach(slot => {
    if (
      new Date(visitTime.startTime) >= new Date(slot.startTime) &&
      new Date(visitTime.endTime) <= new Date(slot.endTime)
    ) result = true
  })
  return result
}

const formatAvailableTimes = (availableTimes) => {
  return availableTimes.map(time => {
    return {
      startTime: new Date(time.startTime).toISOString(),
      endTime: new Date(time.endTime).toISOString()
    }
  })
}

module.exports = { findRange, calcAvailableTimes, calcFromVisitTimes, calceNewSlot, validTimeSlot, formatAvailableTimes, split, diff, sort }