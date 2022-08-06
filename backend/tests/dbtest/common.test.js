// TODO: For now we are using "services/staticdata", we probably should fix this so static data does not influence to tests
// TODO: We should test populating objects
const expect = require('chai').expect
const { initializeDB } = require('../../services/dbsetup')
const { User, Extra, Transaction } = require('../../db')

const getExistingObject = async (Model) => {
  const objects = await Model.find()
  return objects[Math.floor(Math.random() * objects.length)]
}

beforeEach(async () => await initializeDB())

describe('Common.js', () => {

  // find
  it('all users are returned', async () => {
    const users = await User.find()
    expect(users.map(u => u.username)).to.deep.members(['Admin', 'Employee'])
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
    expect(users.length).to.equal(3)
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

  // remove
  it('existing extra by id is removed', async () => {
    const id = (await Extra.findOne({ name: 'Opiskelijan elämää' })).id
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
    const id = (await Extra.findOne({ name: 'Opiskelijan elämää' })).id
    const extrasBefore = await Extra.find()
    const ids = await Extra.remove([id, 'invalid'])
    const extras = await Extra.find()
    expect(extras).to.deep.equal(extrasBefore)
    expect(ids).to.deep.equal([])
  })

})

describe('Transaction', () => {

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

  it('a user is updated after a commit', async () => {
    const session = new Transaction()
    const _User = User.instance(session)
    const object = await getExistingObject(User)
    const user = await _User.update(object.id, { username: 'UpdatedUsername' })
    expect((await User.findById(object.id)).username).to.not.equal(user.username)
    await session.commit()
    expect((await User.findById(object.id)).username).to.equal(user.username)
  })

  it('findById returns an updated instance before a commit', async () => {
    const session = new Transaction()
    const _User = User.instance(session)
    const object = await getExistingObject(User)
    const user = await _User.update(object.id, { username: 'UpdatedUsername' })
    expect((await _User.findById(object.id)).username).to.equal(user.username)
    expect((await User.findById(object.id)).username).to.not.equal(user.username)
  })

})