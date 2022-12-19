const { UserInputError } = require('apollo-server-express')
const logger = require('../logger')
const Common = require('./common')
const encoders = require('./encoders')

const getModel = modelName => require(`../models/${modelName}`)

class User extends Common {
  constructor(session) { super(getModel('user'), encoders.user, session) }
  instance(session) { return new User(session) }
}

class Event extends Common {
  constructor(session) { super(getModel('event'), encoders.event, session) }
  instance(session) { return new Event(session) }
  FindByRange(rule, expand) {
    return this.find({
      end: Object.fromEntries(Object.entries(rule.end).map(e => {
        if (e[0] === 'after') return ['$gt', new Date(e[1])]
        if (e[0] === 'before') return ['$lt', new Date(e[1])]
      }))
    }, expand)
  }
}

class Visit extends Common {
  constructor(session) { super(getModel('visit'), encoders.visit, session) }
  instance(session) { return new Visit(session) }
}

class Group extends Common {
  constructor(session) { super(getModel('group'), encoders.group, session) }
  instance(session) { return new Group(session) }
  async Update(id, args, expand) {
    if (!id) return
    const group = await this.findById(id)
    const maxCount = (group.visitCount <= args.maxCount) ? args.maxCount : group.maxCount
    const disabled = maxCount <= (args.visitCount ? args.visitCount : group.visitCount)
    return this.update(id, { ...args, maxCount, disabled }, expand)
  }
  Insert(args, expand) {
    return this.insert({
      ...args,
      visitCount: 0,
      events: [],
      disabled: false
    }, expand)
  }
  // Stub is injected so tests can run properly.
  // Make sure that "stub" arg is defined as null or undefined in production code
  async DeltaUpdate(id, delta, expand, args, stub) {
    if (!id) return
    const group = stub ? await stub.findById(id) : await this.findById(id)
    if (!group) return
    const visitCount = group.visitCount + delta.visitCount
    if (group.maxCount < visitCount && !delta.forceUpdate) {
      throw new UserInputError('Max number of visits exceeded')
    }
    const disabled = group.disabled || visitCount >= group.maxCount
    let { events } = group
    if (delta.events?.concat && !events.includes(delta.events.concat)) {
      events = events.concat(delta.events.concat)
    }
    if (delta.events?.filter) {
      events = events.filter(e => e.toString() !== delta.events.filter)
    }
    const updatedGroup = stub
      ? await stub.update(id, { ...args, visitCount, events, disabled }, expand)
      : await this.update(id, { ...args, visitCount, events, disabled }, expand)
    return delta.returnOriginal ? group : updatedGroup
  }
}

class Extra extends Common {
  constructor(session) { super(getModel('extra'), encoders.extra, session) }
  instance(session) { return new Extra(session) }
}

class Tag extends Common {
  constructor(session) { super(getModel('tag'), encoders.tag, session) }
  instance(session) { return new Tag(session) }
  async Insert(tags) {
    const _tags = await this.find({ name: { $in: tags } })
    const result = (await Promise.allSettled(tags.map(t => this.insert({ name: t }))))
      .filter(t => t.status === 'fulfilled')
      .map(t => t.value)
      .concat(_tags)
    return result
  }
}

class Form extends Common {
  constructor(session) { super(getModel('forms'), encoders.form, session) }
  instance(session) { return new Form(session) }
}

class Email extends Common {
  constructor(session) { super(getModel('email'), encoders.email, session) }
  instance(session) { return new Email(session) }
}

// Maybe we can use MongoDB transactions but I thought it was a fun idea to create own
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
    return [session, ...args.map(c => c.instance(session))]
  }
  async commit() {
    const entries = Object.entries(this.instances)
    for (const [, inst] of entries) {
      const err = inst.validateSync()
      if (err) {
        logger.error('FAILED TO COMMIT INSTANCES')
        throw new Error(err)
      }
    }
    try {
      await Promise.all(entries.map(e => e[1].save()))
    } catch (err) {
      logger.critical(err.message)
      logger.critical('A CRITICAL ERROR OCCURED DURING COMMIT')
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
