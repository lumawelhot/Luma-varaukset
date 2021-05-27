var express = require('express')
var router = express.Router()

const items = require('../events.json')

const Event = require('../models/event')

items.forEach(item => {
  const event = new Event(item)
  event.save()
})

router.get('/', async (req, res, next) => {
  const events = await Event.find({})
  res.json(events.map(event => event.toJSON()))
})

module.exports = router
