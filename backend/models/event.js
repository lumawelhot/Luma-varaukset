const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

//const arrayLimit = (val) => !!val.length
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
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  resourceids: {
    type: [Number],
    required: true,
  },
  grades: {
    type: [Number],
    required: true,
    //    validate: [arrayLimit, 'vähintään yksi luokka-aste valittava'],
  }, // deprecated
  grades2: [
    {
      name: {
        type: String,
        required: true
      }
    }
  ],
  remoteVisit: {
    type: Boolean,
    required: true
  },
  inPersonVisit: {
    type: Boolean,
    required: true
  },
  schoolVisit: {
    type: Boolean
    // not required for backwards compatibility
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
  },
  customForm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: false
  },
  disabled: {
    type: Boolean,
    required: true
  },
  reserved: {
    type: String
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false
  },
  publishDate: {
    type: Date,
    required: false
  },
  languages: {
    type: [String],
    required: false,
    default: ['fi']
  },
  limits: {
    type: mongoose.Schema.Types.Mixed,
  },
  cancellationForm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: false
  },
  closedDays: {
    type: Number
  }
})

eventSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    // are these creating errors ???
    returnedObject.start = document.start.toISOString()
    returnedObject.end = document.end.toISOString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

eventSchema.plugin(uniqueValidator,)

module.exports = mongoose.model('Event', eventSchema)
