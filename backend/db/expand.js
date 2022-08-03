// For optimazing purposes

const expandEvents = {
  visits: { startTime: 1, endTime: 1 },
  group: { name: 1, disabled: 1 },
  tags: { name: 1 },
  extras: { name: 1, classes: 1, remoteLength: 1, inPersonLength: 1 },
  customForm: { name: 1, fields: 1 }
}

const expandGroups = {
  events: { title: 1 }
}

const expandVisits = {
  event: { title: 1, start: 1, end: 1, resourceids: 1 },
  extras: { name: 1, classes: 1, remoteLength: 1, inPersonLength: 1 }
}

const expandVisitTimes = {
  visits: { startTime: 1, endTime: 1 }
}

module.exports = {
  expandEvents,
  expandGroups,
  expandVisits,
  expandVisitTimes
}