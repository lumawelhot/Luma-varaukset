const findValidTimeSlot = (availableTimes, visitTime) => {
  let result = false
  availableTimes.forEach(slot => {
    if (
      visitTime.start >= slot.startTime &&
      visitTime.end <= slot.endTime
    ) {
      result = {
        startTime: slot.startTime,
        endTime: slot.endTime
      }
    }
  })
  return result
}

/*
---|________S-----E______S-------E|---
---|________S-----S______E-------E|---
---|________S--------------------E|---
9:30-10:00 jäävä varaus
9:00-15:00 eventTime
12:00-13:00 visitTime
[[10, 10],[11, 50]]       ,     [[13, 10],[15, 0]] availableTimes
[[10, 10],[15, 0]]
*/

const calculateAvailabelTimes = (visitTimes, eventTime, waitingTime, duration) => {
  let previous = eventTime.start
  const availableTimes = []
  visitTimes.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).forEach(time => {
    const start = new Date(time.startTime)
    const end = new Date(time.endTime)
    if (start.getTime() - previous.getTime() - waitingTime * 60000 >= duration * 60000) {
      availableTimes.push({
        startTime: previous,
        endTime: new Date(start.getTime() - waitingTime * 60000)
      })
    }
    previous = new Date(end.getTime() + waitingTime * 60000)
  })
  if (eventTime.end.getTime() - previous.getTime() - waitingTime * 60000 >= duration * 60000) {
    availableTimes.push({
      startTime: previous,
      endTime: eventTime.end
    })
  }
  return availableTimes
}

const generateAvailableTime = (start, end, duration) => {
  let result = null
  if (end - start >= duration * 60000) {
    result = {
      startTime: start,
      endTime: end
    }
  }
  return result
}

module.exports = { findValidTimeSlot, generateAvailableTime, calculateAvailabelTimes }