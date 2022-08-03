const sinon = require('sinon')
const expect = require('chai').expect
const { createTestClient } = require('apollo-server-testing')
const { GROUPS, CREATE_GROUP, MODIFY_GROUP, DELETE_GROUPS } = require('./graphql/queries')
const { /* adminServer, */ employeeServer, customerServer } = require('./utils/server')
const { groupsStub } = require('./utils/dbstub')
const { PubSub } = require('graphql-subscriptions')
const dbgroups = require('./db/groups.json')

//let serverAdmin
let serverEmployee
let serverCustomer

let sandbox
beforeEach(async () => {
  //serverAdmin = adminServer()
  serverEmployee = employeeServer()
  serverCustomer = customerServer()
  sandbox = sinon.createSandbox()
  sandbox.stub(new PubSub(), 'publish').callsFake(() => {})
  groupsStub(sandbox)
  //session = transactionStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

const getGroups = async () => {
  const { query } = createTestClient(serverEmployee)
  return (await query({ query: GROUPS }))?.data?.getGroups
}


describe('As an admin I', () => {

})

describe('As an employee I', () => {

  it('can get all groups', async () => {
    const groups = await getGroups()
    expect(groups).to.deep.equal(dbgroups)
  })

  it('can create a new group', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data } = await mutate({
      mutation: CREATE_GROUP,
      variables: { maxCount: 3, name: 'New group' }
    })
    expect(data.createGroup).to.deep.equal({
      id: (dbgroups.length + 1).toString(),
      name: 'New group',
      events: [],
      maxCount: 3,
      visitCount: 0,
      disabled: false
    })
  })

  it('can modify a group', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data } = await mutate({
      mutation: MODIFY_GROUP,
      variables: { id: '2', maxCount: 2, name: 'Modified' }
    })
    expect(data.modifyGroup).to.deep.equal({
      id: '2',
      name: 'Modified',
      events: [],
      maxCount: 2,
      visitCount: 0,
      disabled: false
    })
  })

  it('can remove groups', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data } = await mutate({
      mutation: DELETE_GROUPS,
      variables: { ids: ['2', '4'] }
    })
    expect(data.deleteGroups).to.deep.equal(['2', '4'])
    expect(await getGroups()).to.deep.equal(dbgroups.filter(g => !['2', '4'].includes(g.id)))
  })

})

describe('As a customer I', () => {

  it('cannot get groups', async () => {
    const { query } = createTestClient(serverCustomer)
    const { errors } = await query({ query: GROUPS })
    expect(errors[0].message).to.equal('Not authorized')
  })

  it('cannot create a new group', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: CREATE_GROUP,
      variables: { maxCount: 3, name: 'New group' }
    })
    expect(errors[0].message).to.equal('Not authorized')
  })

  it('cannot modify a group', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: MODIFY_GROUP,
      variables: { id: '2', maxCount: 2, name: 'Modified' }
    })
    expect(errors[0].message).to.equal('Not authorized')
  })

  it('cannot remove groups', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: DELETE_GROUPS,
      variables: { ids: ['2', '4'] }
    })
    expect(errors[0].message).to.equal('Not authorized')
    expect(await getGroups()).to.deep.equal(dbgroups)
  })

})

describe('A group', () => {

  it('is set to disabled if it has maximum number of visits', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data } = await mutate({
      mutation: MODIFY_GROUP,
      variables: { id: '3', maxCount: 2 }
    })
    expect(data.modifyGroup).to.deep.equal({
      id: '3',
      name: 'Group 3',
      events: [],
      maxCount: 2,
      visitCount: 3,
      disabled: true
    })
  })

  it('is set to undisabled if it doesn\'t have maximun number of visits', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data } = await mutate({
      mutation: MODIFY_GROUP,
      variables: { id: '4', maxCount: 4 }
    })
    expect(data.modifyGroup).to.deep.equal({
      id: '4',
      name: 'Group 4',
      events: [],
      maxCount: 4,
      visitCount: 3,
      disabled: false
    })
  })

})