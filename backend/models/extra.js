const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const extraSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    minlength: 3
  },
  classes: {
    type: [Number],
    required: true
  },
  remoteLength: {
    type: Number,
    required: true
  },
  inPersonLength: {
    type: Number,
    required: true
  }
})

extraSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

extraSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Extra', extraSchema)