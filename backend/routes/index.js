var express = require('express');
var router = express.Router();

const items = require('../events.json')

const Event = require('../models/event')

//const now = new Date()
/* const items = [
  {
    id: 0,
    title: 'Scratch-ohjelmointikieli',
    allDay: true,
    start: new Date(2021, 5, 1),
    end: new Date(2021, 5, 2),
    resourceId: 3,
  },
  {
    id: 1,
    title: 'Maanjäristystysten alueellisuus ja niiden vaikutukset',
    start: new Date(2021, 5, 7),
    end: new Date(2021, 5, 10),
    resourceId: 4,
  },

  {
    id: 2,
    title: 'Lämpösäteily ja ilmastonmuutos',
    start: new Date(2021, 5, 13, 0, 0, 0),
    end: new Date(2021, 5, 20, 0, 0, 0),
    resourceId: 4,
  },

  {
    id: 3,
    title: 'Kemian kokeelliset työt',
    start: new Date(2021, 6, 6, 0, 0, 0),
    end: new Date(2021, 6, 13, 0, 0, 0),
    resourceId: 4,
  },
  {
    id: 4,
    title: 'Python-ohjelmointikieli',
    start: new Date(2021, 5, 9, 0, 0, 0),
    end: new Date(2021, 5, 10, 0, 0, 0),
    resourceId: 5,
  },
  {
    id: 5,
    title: 'Matematiikkan työpajat',
    start: new Date(2021, 5, 11),
    end: new Date(2021, 5, 13),
    desc: 'Big conference for important people',
    resourceId: 1,
  },
  {
    id: 6,
    title: 'Meeting',
    start: new Date(2021, 5, 12, 10, 30, 0, 0),
    end: new Date(2021, 5, 12, 12, 30, 0, 0),
    desc: 'Pre-meeting meeting, to prepare for the meeting',
    resourceId: 2,
  },
  {
    id: 7,
    title: 'Lunch',
    start: new Date(2021, 5, 12, 12, 0, 0, 0),
    end: new Date(2021, 5, 12, 13, 0, 0, 0),
    desc: 'Power lunch',
    resourceId: 3,
  },
  {
    id: 8,
    title: 'Meeting',
    start: new Date(2021, 5, 12, 14, 0, 0, 0),
    end: new Date(2021, 5, 12, 15, 0, 0, 0),
    resourceId: 4,
  },
  {
    id: 9,
    title: 'Happy Hour',
    start: new Date(2021, 5, 12, 17, 0, 0, 0),
    end: new Date(2021, 5, 12, 17, 30, 0, 0),
    desc: 'Most important meal of the day',
    resourceId: 5,
  },
  {
    id: 10,
    title: 'Dinner',
    start: new Date(2021, 5, 12, 20, 0, 0, 0),
    end: new Date(2021, 5, 12, 21, 0, 0, 0),
    resourceId: 1,
  },
  {
    id: 11,
    title: 'Planning Meeting with Paige',
    start: new Date(2021, 5, 13, 8, 0, 0),
    end: new Date(2021, 5, 13, 10, 30, 0),
    resourceId: 1,
  },
  {
    id: 12,
    title: 'Late Night Event',
    start: new Date(2021, 5, 17, 19, 30, 0),
    end: new Date(2021, 5, 18, 2, 0, 0),
    resourceId: 1,
  },
  {
    id: 13,
    title: 'Multi-day Event',
    start: new Date(2021, 5, 20, 19, 30, 0),
    end: new Date(2021, 5, 22, 2, 0, 0),
    resourceId: 1,
  },  
  {
    id: 14,
    title: 'Today',
    start: new Date(new Date().setHours(new Date().getHours() - 3)),
    end: new Date(new Date().setHours(new Date().getHours() + 3)),
    resourceId: 1,
  },
  {
    id: 15,
    title: 'Point in Time Event',
    start: now,
    end: now,
    resourceId: 3,
  },
  {
    id: 16,
    title: 'Video Record',
    start: new Date(2021, 5, 14, 15, 30, 0),
    end: new Date(2021, 5, 14, 19, 0, 0),
    resourceId: 3,
  },
  {
    id: 17,
    title: 'Dutch Song Producing',
    start: new Date(2021, 5, 15, 16, 30, 0),
    end: new Date(2021, 5, 15, 20, 0, 0),
  },
  {
    id: 18,
    title: 'Itaewon Halloween Meeting',
    start: new Date(2021, 5, 14, 16, 30, 0),
    end: new Date(2021, 5, 14, 17, 30, 0),
  },
  {
    id: 19,
    title: 'Online Coding Test',
    start: new Date(2021, 5, 14, 17, 30, 0),
    end: new Date(2021, 5, 14, 20, 30, 0),
  },
  {
    id: 20,
    title: 'An overlapped Event',
    start: new Date(2021, 5, 14, 17, 0, 0),
    end: new Date(2021, 5, 14, 18, 30, 0),
  },
  {
    id: 21,
    title: 'Phone Interview',
    start: new Date(2021, 5, 14, 17, 0, 0),
    end: new Date(2021, 5, 14, 18, 30, 0),
  },
  {
    id: 22,
    title: 'Cooking Class',
    start: new Date(2021, 5, 14, 17, 30, 0),
    end: new Date(2021, 5, 14, 19, 0, 0),
  },
  {
    id: 23,
    title: 'Go to the gym',
    start: new Date(2021, 5, 14, 18, 30, 0),
    end: new Date(2021, 5, 14, 20, 0, 0),
  },
] */

items.forEach(item => {
  const event = new Event(item)
  event.save()
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
})

router.get('/events', async (req, res, next) => {
  const events = await Event.find({})
  res.json(events.map(event => event.toJSON()))
})

module.exports = router;
