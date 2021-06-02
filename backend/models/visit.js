const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const visitSchema = mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  pin: {
    type: Number,
    required: true,
  },
  gradeId: {
    type: Number,
    required: true,
  },
  online: {
    type: Boolean,
    required: true,
  },
  clientName: {
      type: String,
      required: true,
      minLength: 5
  },
  clientEmail: {
      type: String,
      required: true,
  },
  clientPhone: {
      type: String,
      required: true,
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