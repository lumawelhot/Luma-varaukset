const { expect } = require('chai')
const { Transaction, User, Extra, Event, Group } = require('../../db')
const { getExistingObject } = require('../utils/helpers')

describe('Common.js', () => {

  // find
  it('all users are returned', async () => {
    const users = await User.find()
    expect(users.map(u => u.username)).to.deep.members(['Admin', 'Employee', 'Employee2'])
  })

  // findOne
  it('a user is found by username', async () => {
    const user = await User.findOne({ username: 'Employee' })
    delete user._id
    expect(user).to.deep.equal({
      id: user.id,
      username: 'Employee',
      passwordHash: user.passwordHash,
      isAdmin: false
    })
  })

  // findById
  it('an existing user is found from database with correct id', async () => {
    const object = await getExistingObject(User)
    const user = await User.findById(object.id)
    expect(user).to.deep.equal(object)
  })

  it('null is returned if user with an id does not exist', async () => {
    const user = await User.findById('000000000000000000000000')
    expect(user).to.be.null
  })

  // findByIds
  it('multiple extras are found by a list of ids', async () => {
    const id1 = await Extra.findOne({ name: 'Opiskelijan elämää' })
    const id2 = await Extra.findOne({ name: 'Vinkit jatkotyöskentelyyn' })
    const notExists = '000000000000000000000000'
    const extras = await Extra.findByIds([id1, id2, notExists])
    expect(extras.length).to.equal(2)
    expect(extras.map(e => e.name)).to.deep.equal(['Opiskelijan elämää', 'Vinkit jatkotyöskentelyyn'])
  })

  // insert
  it('a new user is added', async () => {
    const user = await User.insert({
      username: 'NewUser',
      passwordHash: 'hash',
      isAdmin: false
    })
    const users = await User.find()
    expect(user.username).to.equal('NewUser')
    expect(users.map(u => u.id)).to.include(user.id)
    expect(users.length).to.equal(4)
  })

  it('a new user is not added if a session is valid', async () => {
    const _User = User.instance(new Transaction())
    const user = await _User.insert({
      username: 'NewUser',
      passwordHash: 'hash',
      isAdmin: false
    })
    const users = await User.find()
    expect(user.username).to.equal('NewUser')
    expect(users.map(u => u.id)).to.not.include(user.id)
  })

  // update
  it('an existing user is updated', async () => {
    const object = await getExistingObject(User)
    const user = await User.update(object.id, { username: 'UpdatedUsername' })
    const users = await User.find()
    expect(users.find(u => u.id === user.id)).to.deep.equal(user)
    expect(user).to.deep.equal({
      ...object,
      username: 'UpdatedUsername',
    })
  })

  it('an existing user is not updated if a session is valid', async () => {
    const _User = User.instance(new Transaction())
    const object = await getExistingObject(User)
    const user = await _User.update(object.id, { username: 'UpdatedUsername' })
    const users = await User.find()
    expect(users.find(u => u.id === user.id)).to.deep.equal(object)
    expect(user.username).to.equal('UpdatedUsername')
    expect(object.username).to.not.equal('UpdatedUsername')
  })

  it('updating a user that does not exist do not influence to the database', async () => {
    const usersBefore = await User.find()
    const user = await User.update('000000000000000000000000', { username: 'UpdatedUsername' })
    const users = await User.find()
    expect(users).to.deep.equal(usersBefore)
    expect(user).to.be.undefined
  })

  it('update returns undefined if undefined id is given', async () => {
    const user = await User.update(undefined, { username: 'UpdatedUsername' })
    expect(user).to.be.undefined
  })

  // remove
  it('existing extra by id is removed', async () => {
    const { id } = await Extra.findOne({ name: 'Opiskelijan elämää' })
    const extrasBefore = await Extra.find()
    const ids = await Extra.remove(id)
    const extras = await Extra.find()
    expect(extras.length).to.equal(extrasBefore.length - 1)
    expect(extras).to.deep.equal(extrasBefore.filter(e => id !== e.id))
    expect(ids).to.deep.equal([id])
  })

  it('existing extras by ids are removed from database', async () => {
    const id1 = (await Extra.findOne({ name: 'Opiskelijan elämää' })).id
    const id2 = (await Extra.findOne({ name: 'Vinkit jatkotyöskentelyyn' })).id
    const extrasBefore = await Extra.find()
    const ids = await Extra.remove([id1, id2])
    const extras = await Extra.find()
    expect(extras.length).to.equal(extrasBefore.length - 2)
    expect(extras).to.deep.equal(extrasBefore.filter(e => ![id1, id2].includes(e.id)))
    expect(ids).to.deep.members([id1, id2])
  })

  it('existing extras by ids are not removed if there is an invalid id', async () => {
    const { id } = await Extra.findOne({ name: 'Opiskelijan elämää' })
    const extrasBefore = await Extra.find()
    const ids = await Extra.remove([id, 'invalid'])
    const extras = await Extra.find()
    expect(extras).to.deep.equal(extrasBefore)
    expect(ids).to.deep.equal([])
  })

})

describe('Populate', () => {

  // populate
  it('event is expanded by correct extra fields', async () => {
    const event = await Event.findOne({ title: 'Booked extras' }, {
      extras: { name: 1, classes: 1, inPersonLength: 1 }
    })
    event.extras.forEach(e => {
      expect(e.remoteLength).to.be.undefined
      expect(e.inPersonLength).to.not.be.undefined
    })
    expect(event.extras.map(e => ({
      name: e.name, classes: e.classes, inPersonLength: e.inPersonLength
    }))).to.deep.equal([
      {
        name: 'Opiskelijan elämää',
        classes: [ 1, 2, 4, 5 ],
        inPersonLength: 10
      },
      {
        name: 'Tieteenalan esittely',
        classes: [ 1, 2, 3 ],
        inPersonLength: 10
      }
    ])
  })

  // execPopulate
  it('event is populated with correct extra fields when updated', async () => {
    const { id } = await Event.findOne({ title: 'Booked extras' })
    const event = await Event.update(id, { title: 'Modified' }, {
      extras: { classes: 1 }
    })
    event.extras.forEach(e => {
      expect(e.name).to.be.undefined
      expect(e.remoteLength).to.be.undefined
      expect(e.inPersonLength).to.be.undefined
    })
    expect(event.extras.map(e => ({
      classes: e.classes
    }))).to.deep.equal([{ classes: [ 1, 2, 4, 5 ] }, { classes: [ 1, 2, 3 ] }])
  })

})

describe('Group', () => {
  let id
  let object
  beforeEach(async () => {
    object = await Group.findOne({ name: 'Opiskelijan elämää' })
    id = object.id
  })

  describe('DeltaUpdate', () => {
    it('returns undefined if undefined id is given', async () => {
      const group = await Group.DeltaUpdate(undefined, { name: 'hello world' })
      expect(group).to.be.undefined
    })

    it('visit count updates properly if max number of visits is not exceeded', async () => {
      expect((await Group.DeltaUpdate(id, { visitCount: 3 })).visitCount).to.equal(3)
      expect((await Group.DeltaUpdate(id, { visitCount: 1 })).visitCount).to.equal(4)
      expect((await Group.DeltaUpdate(id, { visitCount: 1 })).visitCount).to.equal(5)
    })

    it('a group remain enabled if maximum number of visits is not reached', async () => {
      const group = await Group.DeltaUpdate(id, { visitCount: 4 })
      expect(group.visitCount).to.equal(4)
      expect(group.disabled).to.be.false
    })

    it('a group is disabled if number of visits is the same as the number of visits', async () => {
      const group = await Group.DeltaUpdate(id, { visitCount: 5 })
      expect(group.visitCount).to.equal(5)
      expect(group.disabled).to.be.true
    })

    it('updating fails and error is thrown if max number of visits exceeds', async () => {
      try {
        await Group.DeltaUpdate(id, { visitCount: 6 })
      } catch (err) {
        expect(err.message).to.equal('Max number of visits exceeded')
      }
      const group = await Group.findById(id)
      expect(group.visitCount).to.equal(0)
      expect(group.disabled).to.be.false
    })

    it('returns original group if returnOriginal option is given', async () => {
      const group = await Group.DeltaUpdate(id, { visitCount: 2, returnOriginal: true })
      expect(group).to.deep.equal(object)
    })

    it('if a group is disabled then it cannot be enabled', async () => {
      await Group.DeltaUpdate(id, { visitCount: 5 })
      const group = await Group.DeltaUpdate(id, { visitCount: -3 })
      expect(group.disabled).to.be.true
      expect(group.visitCount).to.equal(2)
    })

  })

  describe('Update', () => {

    it('updating with undefined id results undefined', async () => {
      const group = await Group.Update(undefined, { visitCount: 2 })
      expect(group).to.be.undefined
    })

    it('values are updated correctly if max number of visits is not exceeded', async () => {
      const group = await Group.Update(id, { visitCount: 3, name: 'New name', maxCount: 4 })
      expect(group.name).to.equal('New name')
      expect(group.maxCount).to.equal(4)
      expect(group.visitCount).to.equal(3)
      expect(group.disabled).to.equal(false)
    })

    it('visit count can be larger than max count', async () => {
      const group = await Group.Update(id, { visitCount: 4, name: 'New name', maxCount: 3 })
      expect(group.name).to.equal('New name')
      expect(group.maxCount).to.equal(3)
      expect(group.visitCount).to.equal(4)
      expect(group.disabled).to.equal(true)
    })

    it('disabled group can be re-enabled', async () => {
      expect((await Group.Update(id, { visitCount: 4, maxCount: 4 })).disabled).to.be.true
      expect((await Group.Update(id, { maxCount: 5 })).disabled).to.be.false
    })

  })

})
