const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5
  },
  allDay: {
    type: Boolean,
  },
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
  resourceId: {
    type: Number,
    required: true,
  },
  gradeIds: {
    type: [Number],
    required: true,
  },
  desc: String,


})

eventSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

eventSchema.plugin(uniqueValidator,)

module.exports = mongoose.model('Event', eventSchema)