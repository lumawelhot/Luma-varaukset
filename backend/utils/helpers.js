const Tag = require('../models/tag')

const addNewTags = async (tags) => {
  const eventTags = JSON.parse(JSON.stringify(tags))
  const eventTagsNames = eventTags.map(e => e.name)
  let mongoTags = await Tag.find({ name: { $in: eventTagsNames } })
  const foundTagNames = mongoTags.map(t => t.name)
  eventTags.forEach(tag => {
    if (!foundTagNames.includes(tag.name)) {
      const newTag = new Tag({ name: tag.name })
      mongoTags = mongoTags.concat(newTag)
      tag = newTag.save()
    }
  })
  return mongoTags
}

module.exports = { addNewTags }