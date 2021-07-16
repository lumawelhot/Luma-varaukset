const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const formSubmissionsSchema = mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Form'
  },
  values: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  }
})

formSubmissionsSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

formSubmissionsSchema.plugin(uniqueValidator,)

module.exports = mongoose.model('FormSubmissions', formSubmissionsSchema)