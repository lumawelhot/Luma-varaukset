const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    minlength: 1
  }
})

tagSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

tagSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Tag', tagSchema)