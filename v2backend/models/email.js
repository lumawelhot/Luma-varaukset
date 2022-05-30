const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const emailSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    minlength: 1
  },
  html: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  ad: {
    type: [String],
    required: true
  },
  adSubject: {
    type: String,
    required: true
  },
  adText: {
    type: String,
    required: true
  }
})

emailSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

emailSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Email', emailSchema)