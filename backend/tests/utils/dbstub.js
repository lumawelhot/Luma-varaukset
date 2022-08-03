const dbusers = require('../db/users.json')
const dbevents = require('../db/events.json')
const dbvisits = require('../db/visits.json')
const dbtags = require('../db/tags.json')
const dbextras = require('../db/extras.json')
const dbemails = require('../db/emails.json')
const dbforms = require('../db/forms.json')
const dbgroups = require('../db/groups.json')
const { Transaction, User, Event, Visit, Tag, Extra, Email, Form, Group } = require('../../db')
const encoders = require('../../db/encoders')
const { addBusinessDays, set, sub, subBusinessDays } = require('date-fns')
const models = require('./models')
const format = (args, encoder) => encoders[encoder].decode(encoders[encoder].encode(args))
const someExist = (a, b) => b?.some(v => a?.some(u => u[0] === v[0] && u[1] === v[1]))

class TransactionMock {
  constructor() {
    this.instances = {}
    this.committed = {}
  }
  instanceById(id) {
    return this.instances[id]
  }
  insert(inst, model) {
    this.instances[inst._id] = {
      ...inst,
      model
    }
  }
  commit() {
    for (const inst of Object.values(this.instances)) {
      delete inst._id
      delete inst.id
      const modelInst = new models[inst.model](inst)
      const error = modelInst.validateSync()
      if (error && !error.message.includes('Cast to ObjectId failed for value')) {
        throw new Error(error)
      }
    }
    this.committed = this.instances
    this.instances = {}
  }
}

const dbStub = (sandbox, db, model, encoder) => {
  sandbox.stub(model, 'find').callsFake(() => db.map(u => format(u, encoder)))
  sandbox.stub(model, 'insert').callsFake(args => {
    const object = format({ ...args, id: db.length + 1 }, encoder)
    db = db.concat(object)
    return object
  })
  sandbox.stub(model, 'update').callsFake((id, args) => {
    const object = format({ ...db.find(u => u.id === id), ...args }, encoder)
    db = db.map(u => u.id === object.id ? object : u)
    return object
  })
  sandbox.stub(model, 'findOne').callsFake(args => {
    const entries = db.map(u => Object.entries(u))
    const argsEntries = Object.entries(args)
    const object = entries.find(u => someExist(u, argsEntries))
    return Object.fromEntries(object)
  })
  sandbox.stub(model, 'remove').callsFake(ids => {
    if (!Array.isArray(ids)) db = db.filter(u => u.id !== ids)
    else db = db.filter(u => !ids.includes(u.id))
    return ids
  })
  sandbox.stub(model, 'findById').callsFake(id => {
    if (!id) return undefined
    const object = db.find(u => u.id === id)
    if (!object) return null
    return format(object, encoder)
  })
  sandbox.stub(model, 'instance').callsFake(() => {
    return model
  })
  sandbox.stub(model, 'findByIds').callsFake(ids => {
    const objects = db.filter(u => ids.includes(u.id))
      .map(u => format(u, encoder))
    return objects
  })
}

const eventAssignDates = events => {
  return events.map(event => {
    let start
    let end
    if (event.fromNow >= 0) {
      start = addBusinessDays(set(new Date(), { hours: 9 }), event.fromNow).toISOString()
      end = addBusinessDays(set(new Date(), { hours: 14 }), event.fromNow).toISOString()
    } else {
      start = subBusinessDays(set(new Date(), { hours: 9 }), -event.fromNow).toISOString()
      end = subBusinessDays(set(new Date(), { hours: 14 }), -event.fromNow).toISOString()
    }
    return {
      ...event,
      start,
      end,
      availableTimes: [{ startTime: start, endTime: end }],
      tags: [],
      visits: []
    }
  })
}
const events = eventAssignDates(dbevents)

const usersStub = sandbox => dbStub(sandbox, dbusers, User, 'user')
const eventsStub = sandbox => {
  sandbox.stub(Event, 'findByDays').callsFake((days) => {
    return events.filter(e => new Date(e.end) >= sub(new Date(), { days }))
      .map(u => format(u, 'event'))
  })
  return dbStub(sandbox, events, Event, 'event')
}
const visitsStub = sandbox => dbStub(sandbox, dbvisits, Visit, 'visit')
const tagsStub = sandbox => dbStub(sandbox, dbtags, Tag, 'tag')
const extrasStub = sandbox => dbStub(sandbox, dbextras, Extra, 'extra')
const emailsStub = sandbox => dbStub(sandbox, dbemails, Email, 'email')
const formsStub = sandbox => dbStub(sandbox, dbforms, Form, 'form')
const groupsStub = sandbox => dbStub(sandbox, dbgroups, Group, 'group')

const transactionStub = sandbox => {
  const session = new TransactionMock()
  sandbox.stub(Transaction, 'construct').callsFake((...args) => {
    const connections = []
    for (const connection of args) {
      const oldinsert = connection.insert
      connection.insert = (args) => {
        const object = oldinsert(args)
        session.insert(object, connection.constructor.name)
        return object
      }
      connections.push(connection.instance(session))
    }

    return [session, ...connections]
  })
  return session
}

module.exports = {
  usersStub,
  eventsStub,
  visitsStub,
  tagsStub,
  extrasStub,
  emailsStub,
  formsStub,
  groupsStub,
  transactionStub,
}