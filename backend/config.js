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

module.exports = {
  SECRET,
  PORT,
  MONGODB_URI,
  EMAILHOST,
  EMAILUSER,
  EMAILPASSWORD,
  EMAILPORT,
  HOST_URI,
  CLASSES,
  EVENT_LOCK_DURATION
}
