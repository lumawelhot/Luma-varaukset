// This script should be run in production inside the docker container!
// So, on your server run:
// docker exec luma-varaukset-app /bin/sh -c "cd /app/backend/utils && node importStaticData.js"

const mongoose = require('mongoose')
const Event = require('../models/event')
const Extra = require('../models/extra')
const Tag = require('../models/tag')
const { set, addBusinessDays, subBusinessDays } = require('date-fns')
const { initEmailMessages } = require('./helpers')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

const extras = [
  {
    name: 'Virtuaalikierros Kumpulan yliopistokampuksella',
    inPersonLength: 5,
    remoteLength: 5,
    classes: [1,2,3,4,5]
  },
  {
    name: 'Opiskelijan elämää',
    inPersonLength: 10,
    remoteLength: 10,
    classes: [1,2,3,4,5]
  },
  {
    name: 'Tieteenalan esittely',
    inPersonLength: 10,
    remoteLength: 10,
    classes: [1,2,3,4,5]
  },
  {
    name: 'Aihekohtainen syvempi esittely ja osaston uusin tutkimus',
    inPersonLength: 10,
    remoteLength: 5,
    classes: [1,2,3,4,5]
  },
  {
    name: 'Vinkit jatkotyöskentelyyn',
    inPersonLength: 5,
    remoteLength: 5,
    classes: [1,2,3,4,5]
  }
]

const tags = [
  {
    name: 'Ohjelmointi'
  },
  {
    name: 'Ilmastonmuutos'
  },
  {
    name: 'Lämpö'
  },
  {
    name: 'Geometria'
  },
  {
    name: 'Todennäköisyys'
  },
  {
    name: 'Reaktiot'
  }
]

function getRandom(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len)
  if (n > len)
    throw new RangeError('getRandom: more elements taken than available')
  while (n--) {
    var x = Math.floor(Math.random() * len)
    result[n] = arr[x in taken ? taken[x] : x]
    taken[x] = --len in taken ? taken[len] : len
  }
  return result
}

const importStaticEvents = async () => {
  process.stdout.write('Importing random static events...')
  const staticEvents = require('../events.json')
  await Event.deleteMany({})
  await Extra.deleteMany({})
  await Tag.deleteMany({})
  const savedExtras = await Extra.insertMany([...extras])
  const savedTags = await Tag.insertMany([...tags])
  await staticEvents.forEach(async (e) => {
    const addRandomHours = Math.floor(Math.random()*5)
    const addRandomDays = Math.floor(Math.random()*30)
    const eventStart = subBusinessDays(set(new Date(), { hours: 8 + addRandomHours, minutes: 0, seconds: 0, milliseconds: 0 }), addRandomDays)
    const eventEnd = subBusinessDays(set(new Date(), { hours: 10 + addRandomHours, minutes: 0, seconds: 0, milliseconds: 0 }), addRandomDays)
    const newEvent = await new Event({
      ...e,
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      availableTimes: [
        {
          startTime: eventStart.toISOString(),
          endTime: eventEnd.toISOString()
        }
      ],
      tags: [],
      extras: []
    })
    newEvent.tags = getRandom(savedTags,2)
    newEvent.extras = savedExtras
    await newEvent.save()
  })
  await staticEvents.forEach(async (e) => {
    const addRandomHours = Math.floor(Math.random()*5)
    const addRandomDays = Math.floor(Math.random()*10)
    const eventStart = addBusinessDays(set(new Date(), { hours: 8 + addRandomHours, minutes: 0, seconds: 0, milliseconds: 0 }), 10+addRandomDays)
    const eventEnd = addBusinessDays(set(new Date(), { hours: 10 + addRandomHours, minutes: 0, seconds: 0, milliseconds: 0 }), 10+addRandomDays)
    const newEvent = await new Event({
      ...e,
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      availableTimes: [
        {
          startTime: eventStart.toISOString(),
          endTime: eventEnd.toISOString()
        }
      ],
      tags: [],
      extras: []
    })
    newEvent.tags = getRandom(savedTags,2)
    newEvent.extras = savedExtras
    await newEvent.save()
  })
  console.log('Done.')
}

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  initEmailMessages()
}

if (!(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
  mongoose.connect('mongodb://luma-varaukset-db:27017/luma-varaukset', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      console.log('Connected!')
      await importStaticEvents()
      console.log('Done. Press Ctrl+C to disconnect.')
    })
    .catch((error) => {
      console.log('Error connecting to MongoDB: ', error.message)
    })
}

module.exports = { importStaticEvents }