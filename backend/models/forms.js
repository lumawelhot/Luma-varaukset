const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const formSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  fields: {
    type: [mongoose.Schema.Types.Mixed],
    required: false,
    maxLength: 10
  },
  /* submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FormSubmissions'
    }
  ] */
})

formSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

formSchema.plugin(uniqueValidator,)

module.exports = mongoose.model('Form', formSchema)