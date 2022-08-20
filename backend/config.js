/* eslint-disable no-magic-numbers */
require('dotenv').config()

const {
  PORT,
  SECRET,
  EMAILHOST,
  EMAILUSER,
  EMAILPASSWORD,
  EMAILPORT
} = process.env

const HOST_URI = process.env.NODE_ENV === 'production'
  ? process.env.HOST_URI : 'http://localhost:3000'

let MONGODB_URI
if (process.env.NODE_ENV === 'production') {
  MONGODB_URI = process.env.MONGODB_URI
}

const SALT = 10
const MINUTE = 60000

const EVENT_LOCK_DURATION = process.env.NODE_ENV !== 'test'
  ? 610000 : 0
//dev and prod / tests

const CLASSES = [
  'SUMMAMUTIKKA',
  'FOTONI',
  'LINKKI',
  'GEOPISTE',
  'GADOLIN',
]

const EARLIEST_START_HOURS = 8
const LATEST_END_HOURS = 17

module.exports = {
  SECRET,
  PORT: PORT ? PORT : 3001,
  MONGODB_URI,
  EMAILHOST,
  EMAILUSER,
  EMAILPASSWORD,
  EMAILPORT,
  HOST_URI,
  CLASSES,
  EVENT_LOCK_DURATION,
  SALT,
  MINUTE,
  EARLIEST_START_HOURS,
  LATEST_END_HOURS
}
