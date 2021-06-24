const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const visitSchema = mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  clientName: {
    type: String,
    required: true,
    minLength: 5
  },
  schoolName: {
    type: String,
    required: true,
    minLength: 5
  },
  schoolLocation: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true,
  },
  clientPhone: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  participants: {
    type: Number,
    required: true
  },
  status: {
    type: Boolean,
    required: true,
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  inPersonVisit: {
    type: Boolean,
    required: true
  },
  remoteVisit: {
    type: Boolean,
    required: true
  },
  dataUseAgreement: {
    type: Boolean,
    required: true
  }
})

visitSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

visitSchema.plugin(uniqueValidator,)

module.exports = mongoose.model('Visit', visitSchema)