const { expect } = require('chai')
const { Transaction, User, Extra, Event, Group } = require('../../db')
const { getExistingObject } = require('../utils/helpers')

const _ctor = inst => inst.constructor.name

describe('Transaction', () => {

  it('constructor works', () => {
    const [session, extraInst, eventInst, groupInst] = Transaction.construct(Extra, Event, Group)
    expect(session).to.be.instanceOf(Transaction)
    expect(_ctor(extraInst)).to.equal('Extra')
    expect(extraInst.session).to.equal(session)
    expect(_ctor(eventInst)).to.equal('Event')
    expect(eventInst.session).to.equal(session)
    expect(_ctor(groupInst)).to.equal('Group')
    expect(groupInst.session).to.equal(session)
  })

  it('a new user is added after a commit', async () => {
    const session = new Transaction()
    const _User = User.instance(session)
    const user = await _User.insert({
      username: 'NewUser',
      passwordHash: 'hash',
      isAdmin: false
    })
    expect((await User.find()).map(u => u.id)).to.not.include(user.id)
    await session.commit()
    expect((await User.find()).map(u => u.id)).to.include(user.id)
  })

  it('a new user is added after a commit', async () => {
    const session = new Transaction()
    session.instances['invalid'] = { validateSync: () => { throw new Error('validation error')} }
    const _User = User.instance(session)
    const user = await _User.insert({
      username: 'NewUser',
      passwordHash: 'hash',
      isAdmin: false
    })
    expect((await User.find()).map(u => u.id)).to.not.include(user.id)
    try {
      await session.commit()
    } catch (err) {
      expect(err.message).to.equal('validation error')
    }
    expect((await User.find()).map(u => u.id)).to.not.include(user.id)
  })

  it('a user is updated after a commit', async () => {
    const session = new Transaction()
    const _User = User.instance(session)
    const object = await getExistingObject(User)
    const user = await _User.update(object.id, { username: 'UpdatedUsername' })
    expect((await User.findById(object.id)).username).to.not.equal(user.username)
    await session.commit()
    expect((await User.findById(object.id)).username).to.equal(user.username)
  })

  it('a user is not updated after a commit if committing fails', async () => {
    const session = new Transaction()
    session.instances['invalid'] = { validateSync: () => { throw new Error('validation error')} }
    const _User = User.instance(session)
    const object = await getExistingObject(User)
    const user = await _User.update(object.id, { username: 'UpdatedUsername' })
    expect((await User.findById(object.id)).username).to.not.equal(user.username)
    try {
      await session.commit()
    } catch (err) {
      expect(err.message).to.equal('validation error')
    }
    expect((await User.findById(object.id)).username).to.not.equal(user.username)
    expect((await User.findById(object.id)).username).to.equal(object.username)
  })

  it('findById returns an updated instance before a commit', async () => {
    const session = new Transaction()
    const _User = User.instance(session)
    const object = await getExistingObject(User)
    const user = await _User.update(object.id, { username: 'UpdatedUsername' })
    expect((await _User.findById(object.id)).username).to.equal(user.username)
    expect((await User.findById(object.id)).username).to.not.equal(user.username)
  })

  it('findById returns instance from db if no instances are cached', async () => {
    const session = new Transaction()
    const _User = User.instance(session)
    const object = await getExistingObject(User)
    const user = await _User.findById(object.id)
    expect(user.username).to.equal(object.username)
  })

})
