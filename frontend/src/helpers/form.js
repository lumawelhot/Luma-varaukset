import { addDays, set } from 'date-fns'

const defaultDateTime = set(addDays(new Date(), 14), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 })

export const eventInitialValues = newEventTimeRange => ({
  grades: [false, false, false, false, false],
  remoteVisit: true,
  inPersonVisit: true,
  title: '',
  scienceClass: [false, false, false, false, false],
  desc: '',
  remotePlatforms: [true, true, true, false],
  otherRemotePlatformOption: '',
  date: newEventTimeRange ? newEventTimeRange[0] : defaultDateTime,
  startTime: newEventTimeRange ? newEventTimeRange[0] : set(defaultDateTime, { hours: 8 }),
  endTime: newEventTimeRange ? newEventTimeRange[1] : set(defaultDateTime, { hours: 16 }),
  tags: [],
  waitingTime: 15,
  extras: [],
  duration: 60
})

export const createPlatformList = event => {
  const platforms = [false, false, false, false]
  event.remotePlatforms.forEach(platform => platforms[platform - 1] = true)
  return platforms
}

export const createGradeList = event => {
  const grades = [false, false, false, false, false]
  event.grades.forEach(grade => grades[grade - 1] = true)
  return grades
}

export const createResourceList = event => {
  const resources = [false, false, false, false , false]
  event.resourceids.forEach(resource => resources[resource - 1] = true)
  return resources
}