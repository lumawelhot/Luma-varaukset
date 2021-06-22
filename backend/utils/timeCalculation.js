const { getUnixTime } = require('date-fns')

const findValidTimeSlot = (timeSlots, timeSlot) => {
  let result = null
  timeSlots.forEach(slot => {
    if (
      getUnixTime(timeSlot.start) >= getUnixTime(slot.startTime) &&
      getUnixTime(timeSlot.end) <= getUnixTime(slot.endTime)
    ) {
      result = {
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime)
      }
    }
  })
  return result
}

const findClosestTimeSlot = (timeSlots, timeSlot, timeBorder) => {
  let startPoint
  let endPoint
  timeSlots.forEach(slot => {
    if (getUnixTime(slot.startTime) === getUnixTime(timeSlot.end)) {
      endPoint = slot.endTime
    }
    if (getUnixTime(slot.endTime) === getUnixTime(timeSlot.start)) {
      startPoint = slot.startTime
    }
  })
  if (!startPoint) startPoint = timeBorder.start
  if (!endPoint) endPoint = timeBorder.end
  return {
    startTime: startPoint,
    endTime: endPoint
  }
}

module.exports = { findValidTimeSlot, findClosestTimeSlot }