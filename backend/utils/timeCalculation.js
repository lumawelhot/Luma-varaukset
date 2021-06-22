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

const findClosestTimeSlot = (timeSlots, timeSlot, timeBorder) => {
  let startPoint
  let endPoint
  timeSlots.forEach(slot => {
    if (slot.startTime === timeSlot.end) {
      endPoint = slot.endTime
    }
    if (slot.endTime === timeSlot.start) {
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

const generateAvailableTime = (start, end) => {
  let result = null
  if (end - start >= 3600) {
    result = {
      startTime: start,
      endTime: end
    }
  }
  return result
}

module.exports = { findValidTimeSlot, findClosestTimeSlot, generateAvailableTime }