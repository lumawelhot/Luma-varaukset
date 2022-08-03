const sinon = require('sinon')
const expect = require('chai').expect
const { createTestClient } = require('apollo-server-testing')
const { EVENTS, CREATE_EVENTS } = require('./graphql/queries')
const { adminServer, employeeServer, customerServer } = require('./utils/server')
const { eventsStub, groupsStub, transactionStub, extrasStub } = require('./utils/dbstub')
const { PubSub } = require('graphql-subscriptions')
const { eventsInTheFuture, eventsInTheFutureDates, eventTooEarly, eventTooLate, eventStartAfterEnd } = require('./db/events')
const dbevents = require('./db/events.json')

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
  session = transactionStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

const getEvents = async () => {
  const { query } = createTestClient(serverAdmin)
  const res = await query({ query: EVENTS })
  console.log(res)
  return res.data.getEvents
}

describe('As an admin I', () => {

  it('can get all events', async () => {
    /* const { mutate } = createTestClient(serverAdmin)

    await mutate({
      mutation: CREATE_EVENTS,
      variables: {
        customForm: '62deac30586daed408db45c9',
        dates: ['2022-08-17T09:00:00.000Z', '2022-08-24T09:00:00.000Z', '2022-08-31T09:00:00.000Z'],
        desc: '',
        duration: 30,
        end: '2022-08-31T07:00:00.000Z',
        extras: ['62de92e170067fd890cafd6f', '62de92e170067fd890cafd70', '62de92e170067fd890cafd71'],
        grades: [1],
        group: '62e055d08556118308721014',
        inPersonVisit: true,
        languages: ['fi'],
        otherRemotePlatformOption: '',
        publishDate: null,
        remotePlatforms: [],
        remoteVisit: false,
        resourceids: [4],
        start: '2022-08-31T05:00:00.000Z',
        tags: ['Todennäköisyys', 'Ohjelmointi'],
        title: 'Lämpösäteily ja ilmastonmuutos',
        waitingTime: 15,
      }
    })
    console.log(session) */
  })

})

describe('As an employee I', () => {

  xit('can create new events', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const res = await mutate({
      mutation: CREATE_EVENTS,
      variables: eventsInTheFuture
    })
    console.log(res)
    expect(session.committed[(dbevents.length + 1).toString()].start)
      .to.equal(eventsInTheFutureDates[0])
    expect(session.committed[(dbevents.length + 2).toString()].start)
      .to.equal(eventsInTheFutureDates[1])
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

})

describe('As a customer I', () => {

  it('cannot create new events', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: CREATE_EVENTS,
      variables: eventsInTheFuture
    })
    expect(Object.values(session.committed).length).to.equal(0)
    expect(errors[0].message).to.equal('Not authorized')
  })

})