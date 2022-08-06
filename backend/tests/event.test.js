const sinon = require('sinon')
const expect = require('chai').expect
const { createTestClient } = require('apollo-server-testing')
const { EVENTS, CREATE_EVENTS, FORCE_DELETE_EVENTS, TAGS, EVENT, MODIFY_EVENT, DISABLE_EVENT, ENABLE_EVENT, LOCK_EVENT } = require('./graphql/queries')
const { adminServer, employeeServer, customerServer } = require('./utils/server')
const { eventsStub, groupsStub, transactionStub, extrasStub, usersStub, visitsStub, tagsStub } = require('./utils/dbstub')
const { PubSub } = require('graphql-subscriptions')
const { eventsInTheFuture, eventTooEarly, eventTooLate, eventStartAfterEnd } = require('./db/data')
const dbevents = require('./db/events.json')
const dbtags = require('./db/tags.json')

let serverAdmin
let serverEmployee
let serverCustomer

let sandbox
let session
beforeEach(async () => {
  serverAdmin = adminServer()
  serverEmployee = employeeServer()
  serverCustomer = customerServer()
  sandbox = sinon.createSandbox()
  sandbox.stub(new PubSub(), 'publish').callsFake(() => {})
  eventsStub(sandbox)
  groupsStub(sandbox)
  extrasStub(sandbox)
  usersStub(sandbox)
  visitsStub(sandbox)
  tagsStub(sandbox)
  session = transactionStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

const getEvents = async () => {
  const { query } = createTestClient(serverAdmin)
  const res = await query({ query: EVENTS })
  return res.data.getEvents
}

const getTags = async () => {
  const { query } = createTestClient(serverCustomer)
  const { data } = await query({ query: TAGS })
  return data.getTags
}

describe('As an admin I', () => {

  it('can get all events', async () => {
    const { query } = createTestClient(serverAdmin)
    const { data, errors } = await query({ query: EVENTS })
    expect(errors).to.be.undefined
    expect(data.getEvents.map(e => e.id)).to.deep.equal(dbevents.map(e => e.id))
  })

  // ----- FORCE DELETE
  it('can force delete events with valid password', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const { data, errors } = await mutate({
      mutation: FORCE_DELETE_EVENTS,
      variables: { events: ['4', '7'], password: 'admin-password' }
    })
    expect(errors).to.be.undefined
    expect(data.forceDeleteEvents.map(e => e.id)).to.deep.equal(['4', '7'])
    await getEvents()
  })
  it('cannot force delete events with invalid passwrod', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const { errors } = await mutate({
      mutation: FORCE_DELETE_EVENTS,
      variables: { events: ['4', '7'], password: 'invalid' }
    })
    expect(errors[0].message).to.equal('Invalid password')
  })
  // ------------------

})

describe('As an employee I', () => {

  it('can get only events in the future', async () => {
    const { query } = createTestClient(serverEmployee)
    const { data, errors } = await query({ query: EVENTS })
    expect(errors).to.be.undefined
    expect(data.getEvents.map(e => e.id)).to.deep.equal(dbevents
      .filter(e => e.fromNow >= 0).map(e => e.id))
  })

  // ----- CREATE EVENTS
  it('can create new events', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data, errors } = await mutate({
      mutation: CREATE_EVENTS,
      variables: eventsInTheFuture
    })
    const events = data.createEvents
    const committedEvents = Object.entries(session.committed)
      .filter(e => e[0] === `${e[1].id}-Event`).map(e => e[1])
    const group = session.committed[`${eventsInTheFuture.group}-Group`]

    expect(errors).to.be.undefined
    events.forEach(event => {
      expect(event.extras.map(e => e.id)).to.deep.equal(eventsInTheFuture.extras)
      expect(event.tags.map(t => t.name)).to.deep.equal(eventsInTheFuture.tags)
    })
    expect(await getTags()).to.deep.equal(
      dbtags.concat({ id: (dbtags.length + 1).toString(), name: 'Algoritmit' }))
    expect(events.map(e => e.id)).to.deep.equal(
      committedEvents.map(e => e.id)
    )
    expect(events.length).to.equal(eventsInTheFuture.dates.length)
    expect(group.events).to.deep.equal(events.map(e => e.id))
    committedEvents.forEach(event => {
      expect(event.group.id).to.equal(group.id)
    })
  })

  it('cannot create a new event starting too early', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { errors } = await mutate({
      mutation: CREATE_EVENTS,
      variables: eventTooEarly
    })
    expect(errors[0].message).to.equal('Invalid start or end time')
  })

  it('cannot create a new event ending too late', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { errors } = await mutate({
      mutation: CREATE_EVENTS,
      variables: eventTooLate
    })
    expect(errors[0].message).to.equal('Invalid start or end time')
  })

  it('cannot create a new event starting after it ends', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { errors } = await mutate({
      mutation: CREATE_EVENTS,
      variables: eventStartAfterEnd
    })
    expect(errors[0].message).to.equal('Invalid start or end time')
  })
  // -------------------

  // ----- MODIFY EVENT
  //it('')
  // ------------------

  // ----- FORCE DELETE
  it('cannot force delete events', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { errors } = await mutate({
      mutation: FORCE_DELETE_EVENTS,
      variables: { events: ['4', '7'], password: 'basic-password' }
    })
    expect(errors[0].message).to.equal('No admin privileges')
  })
  // ------------------

  // ----- DISABLE / ENABLE

  it('can disabled an event', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { errors, data } = await mutate({
      mutation: DISABLE_EVENT,
      variables: { event: '1' }
    })
    expect(errors).to.be.undefined
    expect(data.disableEvent).to.deep.equal({ id: '1', disabled: true })
  })

  it('can enable an event', async  () => {
    const { mutate } = createTestClient(serverEmployee)
    const { errors, data } = await mutate({
      mutation: ENABLE_EVENT,
      variables: { event: '8' }
    })
    expect(errors).to.be.undefined
    expect(data.enableEvent).to.deep.equal({ id: '8', disabled: false })
  })

  it('can cancel a reservation by disabling an event', async () => {
    const { query, mutate } = createTestClient(serverEmployee)
    const id = '3'
    const eventBefore = await query({ query: EVENT, variables: { id } })
    await mutate({
      mutation: DISABLE_EVENT,
      variables: { event: id }
    })
    const event = await query({ query: EVENT, variables: { id } })
    expect(eventBefore.data.getEvent.locked).to.be.true
    expect(event.data.getEvent.locked).to.be.false
  })

  // ----------------------

})

describe('As a customer I', () => {

  // ----- CREATE EVENTS
  it('cannot create new events', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: CREATE_EVENTS,
      variables: eventsInTheFuture
    })
    expect(Object.values(session.committed).length).to.equal(0)
    expect(errors[0].message).to.equal('Not authorized')
  })
  // -------------------

  // ----- MODIFY EVENT
  /* it('cannot modify an event', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: MODIFY_EVENT,
      variables: modifiedEventDetails
    })
  }) */
  // ------------------

  // ----- DISABLE / ENABLE

  it('cannot disabled an event', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors, data } = await mutate({
      mutation: DISABLE_EVENT,
      variables: { event: '1' }
    })
    expect(errors[0].message).to.equal('Not authorized')
    expect(data.disableEvent).to.be.null
  })

  it('cannot enable an event', async  () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors, data } = await mutate({
      mutation: ENABLE_EVENT,
      variables: { event: '8' }
    })
    expect(errors[0].message).to.equal('Not authorized')
    expect(data.enableEvent).to.be.null
  })

  // ----------------------

  // ----- LOCK / UNLOCK

  it('cannot lock an event that is already locked', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors, data } = await mutate({
      mutation: LOCK_EVENT,
      variables: { event: '3' }
    })
    expect(errors[0].message).to.equal('Event cannot be modified because booking form is open')
    expect(data.lockEvent).to.be.null
  })

  // -------------------

})