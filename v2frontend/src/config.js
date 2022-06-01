import { locale, plugins } from './helpers/utils'
import i18n from './i18n'

export const BOOKING_TIME = 600 // seconds

export const MAX_TAG_FILTER_TAGS = 10

export const BOOKING_FAILS_DAYS_REMAINING = 14 // visitor

export const BOOKING_FAILS_HOURS_REMAINING = 1 // teacher

export const TIME_VALUE_LARGE = 8640000000000000

export const FIRST_EVENT_AFTER_DAYS = 14

export const EVENT_MIN_LENGTH = 15 // minutes

export const LANG_MAP = {
  fi: i18n.t('finnish'),
  en: i18n.t('english'),
  sv: i18n.t('swedish')
}

export const LANGUAGE_SHORT = {
  fi: 'FI',
  en: 'EN',
  sv: 'SW'
}

export const CLASSES = [
  { value: 1, label: 'SUMMAMUTIKKA', color: '#F2634C', i18n: i18n.t('mathematics'), short: 'SUM' },
  { value: 2, label: 'FOTONI', color: '#8E5993', i18n: i18n.t('physics'), short: 'FOT' },
  { value: 3, label: 'LINKKI', color: '#32A272', i18n: i18n.t('computer-science'), short: 'LIN' },
  { value: 4, label: 'GEOPISTE', color: '#00A2C0', i18n: i18n.t('geography'), short: 'GEO' },
  { value: 5, label: 'GADOLIN', color: '#F7CF00', i18n: i18n.t('chemistry'), short: 'GAD' }
]

export const GRADES = [
  { value: 1, label: i18n.t('grade1') },
  { value: 2, label: i18n.t('grade2') },
  { value: 3, label: i18n.t('grade3') },
  { value: 4, label: i18n.t('grade4') },
  { value: 5, label: i18n.t('grade5') }
]

export const PLATFORMS = [
  'Zoom',
  'Google Meet',
  'Microsoft Teams'
]

export const CALENDAR_SETTINGS = {
  locale,
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

// This list should contain atleas one element
export const DEFAULT_FIELD_VALUES = ['option-1', 'option-2']