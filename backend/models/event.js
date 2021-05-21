const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const eventSchema = mongoose.Schema({
  title: String,
  allDay: Boolean,
  start: String,
  end: String,
  resourceId: Number,
  desc: String,
})

eventSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

eventSchema.plugin(uniqueValidator)
const Event = mongoose.model('Event', eventSchema)

module.exports = Event