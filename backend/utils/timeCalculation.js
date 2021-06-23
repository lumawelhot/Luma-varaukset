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

const findClosestTimeSlot = (availableTimes, visitTime, eventTime) => {
  let startPoint
  let endPoint
  availableTimes.forEach(availableTime => {
    if (availableTime.startTime.getTime() === visitTime.end.getTime()) {
      endPoint = availableTime.endTime
    }
    if (availableTime.endTime.getTime() === visitTime.start.getTime()) {
      startPoint = availableTime.startTime
    }
  })
  if (!startPoint) startPoint = eventTime.start
  if (!endPoint) endPoint = eventTime.end
  return {
    startTime: startPoint,
    endTime: endPoint
  }
}

const generateAvailableTime = (start, end) => {
  let result = null
  if (end - start >= 3600000) {
    result = {
      startTime: start,
      endTime: end
    }
  }
  return result
}

module.exports = { findValidTimeSlot, findClosestTimeSlot, generateAvailableTime }