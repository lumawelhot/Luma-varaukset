// These test helpers are used to replace "db/index.js" (db access interface)
// Keep this file up to date with common.js file
// Keep in mind that DO NOT TRUST that everything here works as expected, you may need to modify this file alot
const dbusers = require('../db/users.json')
const dbevents = require('../db/events.json')
const dbvisits = require('../db/visits.json')
let dbtags = require('../db/tags.json')
const dbextras = require('../db/extras.json')
const dbemails = require('../db/emails.json')
const dbforms = require('../db/forms.json')
const dbgroups = require('../db/groups.json')
const { Transaction, User, Event, Visit, Tag, Extra, Email, Form, Group } = require('../../db')
const encoders = require('../../db/encoders')
const { sub } = require('date-fns')
const { assignDates, models } = require('./helpers')
const format = (args, encoder) => encoders[encoder].decode(encoders[encoder].encode(args))
const someExist = (a, b) => b?.some(v => a?.some(u => u[0] === v[0] && u[1] === v[1]))
const [events, visits] = assignDates(dbevents, dbvisits)

// Why this way ? Because otherwise there are bugs when updating the database
const getDbByEncoder = db => db === 'event' ? events
  : db === 'visit' ? visits
    : db === 'group' ? dbgroups
      : db === 'tag' ? dbtags
        : db === 'extra' ? dbextras
          : db === 'from' ? dbforms
            : db === 'email' ? dbemails
              : null

const encoderByField = {
  event: 'event',
  visits: 'visit',
  group: 'group',
  tags: 'tag',
  extras: 'extra',
  customForm: 'form',
  events: 'event'
}

// This is not the most elegant and efficient way to achieve this
// TODO: refactor this to more efficient.
const populate = (inst, expand) => {
  const object = { ...inst } // Define this or you encounter a strange bug where db instance updates and it should not to do so
  if (!expand) return object
  for (const [field,] of Object.entries(expand)) {
    const ids = object[field]
    const encoder = encoderByField[field]
    const db = getDbByEncoder(encoder)
    if (!ids || !db) continue
    if (Array.isArray(ids)) {
      object[field] = db.filter(o => ids.includes(o.id)).map(o => format(o, encoder))
    } else {
      object[field] = format(db.filter(o => ids.includes(o.id))[0], encoder)
    }
  }
  return object
}

const unPopulate = (inst, expand) => {
  const object = { ...inst }
  if (expand) {
    Object.entries(expand).forEach(e => {
      const field = e[0]
      try {
        if (typeof object[field][0] === 'object') {
          object[field] = object[field].map(o => o.id)
        }
      } catch (err) { undefined }
    })
  }
  return object
}

class TransactionMock {
  constructor() {
    this.instances = {}
    this.committed = {}
  }
  instanceById(id, model) {
    return this.instances[`${id}-${model}`]
  }
  insert(inst, model) {
    this.instances[`${inst._id}-${model}`] = inst
  }
  commit() {
    for (const [key, inst] of Object.entries(this.instances)) {
      const model = key.split('-')[1]
      delete inst._id
      const modelInst = new models[model](inst)
      const error = modelInst.validateSync()
      if (error
        && !error.message.includes('Cast to ObjectId failed for value')
        && !error.message.includes('Cast to [ObjectId] failed for value')
      ) {
        throw new Error(error)
      }
    }
    this.committed = this.instances
    this.instances = {}
  }
}

const dbStub = (sandbox, db, model, encoder) => {
  sandbox.stub(model, 'find').callsFake((args, expand) =>
    db.map(u => populate(u, expand)).map(u => format(u, encoder))
  )
  sandbox.stub(model, 'insert').callsFake((args, expand) => {
    const object = unPopulate(
      format({ ...args, id: (db.length + 1).toString() }, encoder),
      expand
    )
    db = db.concat(object)
    return populate(object, expand)
  })
  sandbox.stub(model, 'update').callsFake((id, args, expand) => {
    if (!id) return
    const object = format({ ...db.find(u => u.id === id), ...args }, encoder)
    db = db.map(e => e.id === object.id ? unPopulate(object, expand) : e)
    return populate(object, expand)
  })
  sandbox.stub(model, 'findOne').callsFake((args, expand) => {
    const entries = db.map(u => Object.entries(u))
    const argsEntries = Object.entries(args)
    const object = entries.find(u => someExist(u, argsEntries))
    return populate(Object.fromEntries(object), expand)
  })
  sandbox.stub(model, 'remove').callsFake(ids => {
    if (Array.isArray(ids)) {
      db = db.filter(u => !ids.includes(u.id))
    }
    else if (ids) {
      db = db.filter(u => u.id !== ids)
    }
    return ids
  })
  sandbox.stub(model, 'findById').callsFake((id, expand) => {
    if (!id) return undefined
    let object = db.find(u => u.id === id)
    if (!object) return null
    object = populate(object, expand)
    return format(object, encoder)
  })
  sandbox.stub(model, 'instance').callsFake(() => {
    return model
  })
  sandbox.stub(model, 'findByIds').callsFake((ids, expand) => {
    if (!ids) return undefined
    const objects = db.filter(u => ids.includes(u.id))
      .map(u => populate(u, expand))
      .map(u => format(u, encoder))
    return objects
  })
}

const usersStub = sandbox => dbStub(sandbox, dbusers, User, 'user')
const eventsStub = sandbox => {
  sandbox.stub(Event, 'findByDays').callsFake((days, expand) => {
    return events.filter(e => new Date(e.end) >= sub(new Date(), { days }))
      .map(u => populate(u, expand))
      .map(u => format(u, 'event'))
  })
  return dbStub(sandbox, events, Event, 'event')
}

const visitsStub = sandbox => dbStub(sandbox, visits, Visit, 'visit')
const tagsStub = sandbox => {
  sandbox.stub(Tag, 'Insert').callsFake(async tags => {
    const foundTags = dbtags.filter(t => tags.includes(t.name))
    const foundTagNames = foundTags.map(t => t.name)
    const newTags = []
    for (const tag of tags) {
      if (!foundTagNames.includes(tag)) {
        newTags.push(await Tag.insert({ name: tag }))
      }
    }
    dbtags = foundTags.concat(newTags)
    return foundTags.concat(newTags)
  })
  return dbStub(sandbox, dbtags, Tag, 'tag')
}
const extrasStub = sandbox => dbStub(sandbox, dbextras, Extra, 'extra')
const emailsStub = sandbox => dbStub(sandbox, dbemails, Email, 'email')
const formsStub = sandbox => dbStub(sandbox, dbforms, Form, 'form')
const groupsStub = sandbox => dbStub(sandbox, dbgroups, Group, 'group')

const transactionStub = sandbox => {
  const session = new TransactionMock()
  sandbox.stub(Transaction, 'construct').callsFake((...args) => {
    const connections = []
    for (const connection of args) {
      const oldInsert = connection.insert
      const oldUpdate = connection.update
      const oldFindById = connection.findById
      connection.insert = (args, expand) => {
        const object = oldInsert(args, expand)
        session.insert(object, connection.constructor.name)
        return object
      }
      connection.update = (id, args, expand) => {
        if (!id) return
        const object = oldUpdate(id, args, expand)
        session.insert(object, connection.constructor.name)
        return object
      }
      connection.findById = (id, expand) => {
        if (!id) return
        const object = session.instanceById(id, connection.constructor.name)
        if (object) return object
        return oldFindById(id, expand)
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