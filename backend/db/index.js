const { UserInputError } = require('apollo-server-express')
const { sub } = require('date-fns')
const Common = require('./common')
const encoders = require('./encoders')

class User extends Common {
  constructor(session) { super(require('../models/user'), encoders.user, session) }
  instance(session) { return new User(session) }
}

class Event extends Common {
  constructor(session) { super(require('../models/event'), encoders.event, session) }
  instance(session) { return new Event(session) }//new Event(session) }
  async findByDays(days, expand) {
    return await this.find({ end: { $gt: sub(new Date(), { days }) } }, expand)
  }
}

class Visit extends Common {
  constructor(session) { super(require('../models/visit'), encoders.visit, session) }
  instance(session) { return new Visit(session) }
}

class Group extends Common {
  constructor(session) { super(require('../models/group'), encoders.group, session) }
  instance(session) { return new Group(session) }
  async Update(id, args, expand) {
    const group = await this.findById(id)
    const maxCount = (group.visitCount <= args.maxCount) ? args.maxCount : group.maxCount
    const disabled = maxCount <= (args.visitCount ? args.visitCount : group.visitCount)
    return await this.update(id, { ...args, maxCount, disabled }, expand)
  }
  async Insert(args, expand) {
    return await this.insert({
      ...args,
      visitCount: 0,
      events: [],
      disabled: false
    }, expand)
  }
  async DeltaUpdate(id, delta, expand, args) {
    if (!id) return
    const group = await this.findById(id)
    const visitCount = group.visitCount + delta.visitCount
    if (group.maxCount < visitCount) {
      throw new UserInputError('Max number of visits exceeded')
    }
    const disabled = visitCount >= group.maxCount
    let events = group.events
    if (delta.events?.concat) {
      events = events.concat(delta.events.concat)
    }
    if (delta.events?.filter) {
      events = events.filter(e => e.toString() !== delta.events.filter)
    }
    const updatedGroup = await this.update(id, { ...args, visitCount, events, disabled }, expand)
    return delta.returnOriginal ? group : updatedGroup
  }
}

class Extra extends Common {
  constructor(session) { super(require('../models/extra'), encoders.extra, session) }
  instance(session) { return new Extra(session) }
}

class Tag extends Common {
  constructor(session) { super(require('../models/tag'), encoders.tag, session) }
  instance(session) { return new Tag(session) }
  // Defined here but includes old design. Deprecate this later.
  async Insert(tags) {
    const foundTags = await this.find({ name: { $in: tags } })
    const foundTagNames = foundTags.map(t => t.name)
    const newTags = []
    for (const tag of tags) {
      if (!foundTagNames.includes(tag)) {
        newTags.push(await this.insert({ name: tag }))
      }
    }
    return foundTags.concat(newTags)
  }
}

class Form extends Common {
  constructor(session) { super(require('../models/forms'), encoders.form, session) }
  instance(session) { return new Form(session) }
}

class Email extends Common {
  constructor(session) { super(require('../models/email'), encoders.email, session) }
  instance(session) { return new Email(session) }
}

class Transaction {
  constructor() {
    this.instances = {}
  }
  instanceById(id) {
    return this.instances[id]
  }
  insert(inst) {
    this.instances[inst._id] = inst
  }
  static construct(...args) {
    const session = new Transaction()
    const connections = []
    for (const connection of args) {
      connections.push(connection.instance(session))
    }
    return [session, ...connections]
  }
  async commit() {
    const entries = Object.entries(this.instances)
    for (const [, inst] of entries) {
      const err = inst.validateSync()
      if (err) {
        console.log('\x1b[31m%s\x1b[0m', err.message)
        console.log('\x1b[31m%s\x1b[0m', 'FAILED TO COMMIT INSTANCES')
        // Throw an error if validation fails
        throw new Error(err)
      }
    }
    for (const [, inst] of entries) {
      try {
        await inst.save()
      } catch (err) {
        console.error(inst)
        console.error(err)
        throw new Error(err)
      }
    }
  }
}
module.exports = {
  Transaction,
  User: new User(),
  Event: new Event(),
  Visit: new Visit(),
  Group: new Group(),
  Extra: new Extra(),
  Tag: new Tag(),
  Form: new Form(),
  Email: new Email(),
}