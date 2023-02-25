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
  gradeInfo: {
    type: String
  },
  participants: {
    type: Number,
    required: true
  },
  status: { // deprecated, moved to cancellation
    type: Boolean,
    required: true,
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  inPersonVisit: { // deprecated, moved to teaching
    type: Boolean,
    //required: true, no longer required
  },
  remoteVisit: { // deprecated, moved to teaching
    type: Boolean,
    //required: true, no longer required
  },
  teaching: {
    type: { type: String },
    location: String, // this will be remotePlatform
    payload: mongoose.Schema.Types.Mixed,
    // no required field for backwards compatibility
  },
  dataUseAgreement: {
    type: Boolean,
    required: true
  },
  extras: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Extra'
    }
  ],
  remotePlatform: { // deprecated, moved to teaching
    type: String,
    required: false
  },
  customFormData: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  language: {
    type: String,
    required: false
  },
  created: {
    type: Date,
    required: false
  },
  cancellation: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
})

visitSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    returnedObject.customFormData = returnedObject.customFormData ? JSON.stringify(document.customFormData) : null
    returnedObject.startTime = returnedObject.startTime.toISOString()
    returnedObject.endTime = returnedObject.endTime.toISOString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

visitSchema.plugin(uniqueValidator,)

module.exports = mongoose.model('Visit', visitSchema)
