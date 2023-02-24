import { plugins } from './helpers/utils'

export const BOOKING_TIME = 600 // seconds
export const MAX_TAG_FILTER_TAGS = 10
export const BOOKING_FAILS_DAYS_REMAINING = 14 // visitor
export const BOOKING_FAILS_HOURS_REMAINING = 1 // teacher
export const TIME_VALUE_LARGE = 8640000000000000
export const FIRST_EVENT_AFTER_DAYS = 14
export const DEFAULT_PAGE_SIZE = 10
export const TABLE_PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100]
export const LANG_MAP = {
  fi: 'finnish',
  en: 'english',
  sv: 'swedish'
}
export const LANGUAGE_SHORT = {
  fi: 'FI',
  en: 'EN',
  sv: 'SW'
}
export const CLASSES = [
  { value: 1, label: 'SUMMAMUTIKKA', color: '#F2634C', i18n: 'mathematics', short: 'SUM' },
  { value: 2, label: 'FOTONI', color: '#8E5993', i18n: 'physics', short: 'FOT' },
  { value: 3, label: 'LINKKI', color: '#32A272', i18n: 'computer-science', short: 'LIN' },
  { value: 4, label: 'GEOPISTE', color: '#00A2C0', i18n: 'geography', short: 'GEO' },
  { value: 5, label: 'GADOLIN', color: '#F7CF00', i18n: 'chemistry', short: 'GAD' }
]
export const GRADES = [
  { value: 1, label: 'grade1' },
  { value: 3, label: 'grade3' },
  { value: 4, label: 'grade4' },
  { value: 5, label: 'grade5' }
]
export const TEACHING_TYPES = [
  'remote',
  'inperson',
  'school'
]
export const PLATFORMS = [
  'Zoom',
  'Google Meet',
  'Microsoft Teams'
]
export const CALENDAR_SETTINGS = {
  plugins,
  height: 548,
  weekends: false,
  weekNumbers: true,
  nowIndicator: true,
  dayMaxEvents: true,
  businessHours: {
    daysOfWeek : [1, 2, 3, 4, 5],
    startTime: '8:00',
    endTime: '17:00'
  },
  slotMinTime: '08:00:00',
  slotMaxTime: '17:01:00',
  snapDuration: '00:30:00',
  eventColor: '#8a8a8a',
  selectConstraint: 'businessHours',
  selectMirror: true,
  allDaySlot: false,
  timeZone: 'Europe/Helsinki',
  views: {
    week: {
      titleFormat: 'd. MMMM',
    }
  }
}
export const VISIT_TYPE_PAYLOAD = {
  school: ['schoolAddress']
}
// This list should contain atleas one element
export const DEFAULT_FIELD_VALUES = ['option-1', 'option-2']
