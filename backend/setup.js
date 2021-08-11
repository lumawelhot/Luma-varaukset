jest.setTimeout(20000)
const { initEmailMessages } = require('./utils/helpers')
const Email = require('./models/email')
const Event = require('./models/event')
const Visit = require('./models/visit')
const User = require('./models/user')
const Extra = require('./models/extra')
const Tag = require('./models/tag')
const Form = require('./models/forms')
const mongoose = require('mongoose')

beforeAll(async () => {
  await mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log('connected to test-mongodb')
    })
    .catch((error) => {
      console.log('connection error: ', error.message)
    })
  initEmailMessages()
})

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await Email.deleteMany({})
    await Event.deleteMany({})
    await Visit.deleteMany({})
    await User.deleteMany({})
    await Extra.deleteMany({})
    await Tag.deleteMany({})
    await Form.deleteMany({})
    await mongoose.connection.close()
    console.log('test-mongodb connection closed')
  }
})