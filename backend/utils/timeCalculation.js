const findValidTimeSlot = (availableTimes, visitTime) => {
  let result = false
  availableTimes.forEach(slot => {
    if (
      visitTime.startTime >= slot.startTime &&
      visitTime.endTime <= slot.endTime
    ) {
      result = {
        startTime: slot.startTime,
        endTime: slot.endTime
      }
    }
  })
  return result
}

const calculateNewTimeSlot = (visitTimes, startTime, endTime) => {
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
  if (eventTime.end.getTime() - previous.getTime() >= duration * 60000) {
    availableTimes.push({
      startTime: previous,
      endTime: eventTime.end
    })
  }
  return availableTimes
}

const formatAvailableTimes = (availableTimes) => {
  return availableTimes.map(time => {
    return {
      startTime: new Date(time.startTime).toISOString(),
      endTime: new Date(time.endTime).toISOString()
    }
  })
}

module.exports = { findValidTimeSlot, calculateAvailabelTimes, calculateNewTimeSlot, formatAvailableTimes }