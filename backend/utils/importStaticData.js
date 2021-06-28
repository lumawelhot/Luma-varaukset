// This script should be run in production inside the docker container!
// So, on your server run:
// docker exec luma-varaukset-app /bin/sh -c "cd /app/backend/utils && node importStaticData.js"

const mongoose = require('mongoose')
const Event = require('../models/event')
const Extra = require('../models/extra')
const { set, addBusinessDays } = require('date-fns')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

const extras = [
  {
    name: 'Virtuaalikierros Kumpulan yliopistokampuksella',
    inPersonLength: 5,
    remoteLength: 5
  },
  {
    name: 'Opiskelijan elämää',
    inPersonLength: 10,
    remoteLength: 10
  },
  {
    name: 'Tieteenalan esittely',
    inPersonLength: 10,
    remoteLength: 10
  },
  {
    name: 'Aihekohtainen syvempi esittely ja osaston uusin tutkimus',
    inPersonLength: 10,
    remoteLength: 5
  },
  {
    name: 'Vinkit jatkotyöskentelyyn',
    inPersonLength: 5,
    remoteLength: 5
  }
]

const importStaticEvents = async () => {
  const staticEvents = require('../events.json')
  await Event.deleteMany({})
  await Extra.deleteMany({})
  const savedExtras = await Extra.insertMany([...extras])
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
    newEvent.extras = savedExtras
    await newEvent.save()
  })
}

console.log('Importing static events')

mongoose.connect('mongodb://luma-varaukset-db:27017/luma-varaukset', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected!')
    await importStaticEvents()
    console.log('Done. Press Ctrl+C to disconnect.')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB: ', error.message)
  })