require('dotenv').config()

const PORT = process.env.PORT
const SECRET = process.env.SECRET
const EMAILHOST = process.env.EMAILHOST
const EMAILUSER = process.env.EMAILUSER
const EMAILPASSWORD = process.env.EMAILPASSWORD
const EMAILPORT = process.env.EMAILPORT
let MONGODB_URI
if (process.env.NODE_ENV === 'production') {
  MONGODB_URI = process.env.MONGODB_URI
}

module.exports = {
  SECRET,
  PORT,
  MONGODB_URI,
  EMAILHOST,
  EMAILUSER,
  EMAILPASSWORD,
  EMAILPORT
}