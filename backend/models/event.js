const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const arrayLimit = (val) => {
  return val.length > 0
}
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
  resourceids: {
    type: [Number],
    required: true,
  },
  grades: {
    type: [Number],
    required: true,
    validate: [arrayLimit, 'vähintään yksi luokka-aste valittava'],
  },
  remoteVisit: {
    type: Boolean,
    required: true
  },
  inPersonVisit: {
    type: Boolean,
    required: true
  },
  availableTimes: {
    type: [],
    required: true
  },
  desc: String,
  remotePlatforms:{
    type: [Number],
    required: false
  },
  otherRemotePlatformOption: String,
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  visits: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit'
    }
  ],
  waitingTime: {
    type: Number,
    required: true
  },
  extras: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Extra'
    }
  ],
  duration: {
    type: Number,
    required: true
  }
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