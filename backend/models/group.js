const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const groupSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  maxCount: {
    type: Number,
    required: true
  },
  visitCount: {
    type: Number,
    required: true
  },
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  ],
  publishDate: {
    type: Date,
    required: false
  }
})

groupSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

groupSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Group', groupSchema)