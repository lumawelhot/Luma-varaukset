const sinon = require('sinon')
const { expect } = require('chai')
const { createTestClient } = require('./utils/client')
const { GROUPS, CREATE_GROUP, MODIFY_GROUP, DELETE_GROUPS, ASSIGN_EVENTS_TO_GROUP, EVENT } = require('./graphql/queries')
const { /* adminServer, */ employeeServer, customerServer, adminServer } = require('./utils/server')
const { groupsStub, eventsStub, transactionStub } = require('./utils/dbstub')
const { PubSub } = require('graphql-subscriptions')
const dbgroups = require('./db/groups.json')

let serverAdmin
let serverEmployee
let serverCustomer

let sandbox
let session
beforeEach(() => {
  serverAdmin = adminServer()
  serverEmployee = employeeServer()
  serverCustomer = customerServer()
  sandbox = sinon.createSandbox()
  sandbox.stub(new PubSub(), 'publish').callsFake(() => {})
  groupsStub(sandbox)
  eventsStub(sandbox)
  session = transactionStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

const getGroups = async () => {
  const { query } = createTestClient(serverEmployee)
  const { data } = await query({ query: GROUPS })
  return data.getGroups.map(g => ({ ...g, events: g.events.map(e => e.id) }))
}

const getEvent = async id => {
  const { query } = createTestClient(serverAdmin)
  const res = await query({ query: EVENT, variables: { id } })
  return res.data.getEvent
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

  it('can assign a group to multiple events', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const oldGroupIds = []
    for (const e of ['10', '7']) oldGroupIds.push((await getEvent(e)).group.id)
    const { errors, data } = await mutate({
      mutation: ASSIGN_EVENTS_TO_GROUP,
      variables: {
        group: '7',
        events: ['10', '7']
      }
    })
    expect(errors).to.be.undefined
    const events = ['10', '7'].map(e => session.committed[`${e}-Event`])
    const assignedGroup = session.committed['7-Group']
    const oldGroups = oldGroupIds.map(g => session.committed[`${g}-Group`])
    expect(oldGroups).to.deep.equal([
      { id: '5', name: 'Group 5', maxCount: 3, visitCount: 1, disabled: true, events: [] },
      { id: '6', name: 'Group 6', maxCount: 2, visitCount: 0, disabled: true, events: [] }
    ])
    expect(events.find(e => e.id === '10').group).to.equal('7')
    expect(events.find(e => e.id === '7').group).to.equal('7')
    expect(assignedGroup).to.deep.equal({
      id: '7', name: 'Group 7', maxCount: 7, visitCount: 4, disabled: false, events: [ '7', '10' ]
    })
    expect(data.assignEventsToGroup.map(e => e.id)).to.have.members(['10', '7'])
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

  it('cannot assign groups to events', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors, data } = await mutate({
      mutation: ASSIGN_EVENTS_TO_GROUP,
      variables: {
        group: '7',
        events: ['10', '7']
      }
    })
    expect(errors[0].message).to.equal('Not authorized')
    expect(data.assignEventsToGroup).to.be.null
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
      visitCount: 2,
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
      events: [{ id: '9', title: 'Event in full group' }],
      maxCount: 4,
      visitCount: 3,
      disabled: false
    })
  })

})
