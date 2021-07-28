const Tag = require('../models/tag')

const addNewTags = async tags => {
  const mongoTags = await Tag.find({ name: { $in: tags } })
  let result = []
  const foundTagNames = mongoTags.map(t => t.name)
  mongoTags.forEach(tag => result.push(tag))
  tags.forEach(tag => {
    if (!foundTagNames.includes(tag)) {
      const newTag = new Tag({ name: tag })
      result.push(newTag)
      newTag.save()
    }
  })
  console.log(result)
  return result
}

module.exports = { addNewTags }