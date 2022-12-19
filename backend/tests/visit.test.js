const sinon = require('sinon')
const { expect } = require('chai')
const { createTestClient } = require('./utils/client')
const { CREATE_VISIT, VISITS, FIND_VISIT, CANCEL_VISIT } = require('./graphql/queries')
const { employeeServer, customerServer } = require('./utils/server')
const { groupsStub, visitsStub, eventsStub, transactionStub, extrasStub, tagsStub } = require('./utils/dbstub')
const { PubSub } = require('graphql-subscriptions')
const { visitTwoWeeksAhead, visitLessThanTwoWeeksAhead, visitOneHourAhead, reservedEventVisit, disabledEventVisit, visitEventInDisabledGroup, visitEventInFullGroup } = require('./db/data')
const { subMinutes, addMinutes } = require('date-fns')
const dbvisits = require('./db/visits.json')
const dbevents = require('./db/events.json')
const { timeSlotByDay } = require('./utils/helpers')

let serverEmployee
let serverCustomer

let session
let sandbox
beforeEach(() => {
  serverEmployee = employeeServer()
  serverCustomer = customerServer()
  sandbox = sinon.createSandbox()
  sandbox.stub(new PubSub(), 'publish').callsFake(() => {})
  groupsStub(sandbox)
  visitsStub(sandbox)
  eventsStub(sandbox)
  extrasStub(sandbox)
  tagsStub(sandbox)
  session = transactionStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

describe('As an employee I', () => {

  it('can get all visits', async () => {
    const { query } = createTestClient(serverEmployee)
    const { data } = await query({ query: VISITS })
    expect(data.getVisits.map(v => ({ id: v.id, clientName: v.clientName })))
      .to.deep.equal(dbvisits.map(v => ({ id: v.id, clientName: v.clientName })))
  })

  // This test and one below are pretty similar. TODO: Maybe reduce some redundant code.
  it('can book a visit atleast one hour ahead', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const [startTime, endTime] = timeSlotByDay(1, { start: 12, end: 13 })
    const { data } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...visitOneHourAhead, startTime, endTime }
    })
    const visit = session.committed[`${dbvisits.length + 1}-Visit`]
    const event = session.committed[`${visit.event.id}-Event`]
    expect(visit.id).to.equal((dbvisits.length + 1).toString())
    expect(visit.clientName).to.equal('Olli Opettaja')
    expect(event.id).to.equal(visit.event.id)
    expect(event.availableTimes).to.deep.equal([
      { startTime: event.start, endTime: subMinutes(new Date(startTime), event.waitingTime).toISOString() },
      { startTime: addMinutes(new Date(endTime), event.waitingTime).toISOString(), endTime: event.end }
    ])
    expect(event.title).to.equal('Python-ohjelmointikieli')
    expect(data.createVisit).not.to.equal(null)
  })

})

describe('As a customer I', () => {

  // ------------ VISIT BOOK
  it('can book a visit atleast two weeks ahead', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 11, end: 12 })
    const { data } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...visitTwoWeeksAhead, startTime, endTime }
    })
    const visit = session.committed[`${dbvisits.length + 1}-Visit`]
    const event = session.committed[`${visit.event.id}-Event`]
    expect(visit.id).to.equal((dbvisits.length + 1).toString())
    expect(visit.clientName).to.equal('Olli Opettaja')
    expect(event.id).to.equal(visit.event.id)
    expect(event.availableTimes).to.deep.equal([
      { startTime: event.start, endTime: subMinutes(new Date(startTime), event.waitingTime).toISOString() },
      { startTime: addMinutes(new Date(endTime), event.waitingTime).toISOString(), endTime: event.end }
    ])
    expect(event.title).to.equal('Maanjäristysten alueellisuus ja niiden vaikutukset')
    expect(data.createVisit).not.to.equal(null)
  })

  it('cannot book a visit less than two weeks ahead', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(13, { start: 11, end: 12 })
    const { data, errors } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...visitLessThanTwoWeeksAhead, startTime, endTime }
    })
    expect(errors[0].message).to.equal('This event cannot be booked')
    expect(Object.values(session.committed).length).to.equal(0)
    expect(data.createVisit).to.equal(null)
  })

  it('cannot book a visit if starting time is invalid', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 8, end: 12 })
    const { data, errors } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...visitTwoWeeksAhead, startTime, endTime }
    })
    expect(errors[0].message).to.equal('Given timeslot is invalid')
    expect(Object.values(session.committed).length).to.equal(0)
    expect(data.createVisit).to.equal(null)
  })

  it('cannot book a visit if ending time is invalid', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 11, end: 15 })
    const { data, errors } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...visitTwoWeeksAhead, startTime, endTime }
    })
    expect(errors[0].message).to.equal('Given timeslot is invalid')
    expect(Object.values(session.committed).length).to.equal(0)
    expect(data.createVisit).to.equal(null)
  })

  it('cannot book a reserved event with invalid token', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 11, end: 12 })
    const { errors } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...reservedEventVisit, startTime, endTime }
    })
    expect(errors[0].message).to.equal('Invalid session')
  })

  it('can book a reserved event with valid token', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 11, end: 12 })
    const { errors, data } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...reservedEventVisit, startTime, endTime, token: 'token' }
    })
    expect(errors).to.be.undefined
    expect(data.createVisit.id).to.equal((dbvisits.length + 1).toString())
  })

  it('cannot book a disabled event', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 11, end: 12 })
    const { errors } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...disabledEventVisit, startTime, endTime }
    })
    expect(errors[0].message).to.equal('This event is disabled')
  })

  it('cannot book an event if an event group has maximum number of visits', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 11, end: 12 })
    const { errors, data } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...visitEventInFullGroup, startTime, endTime }
    })
    expect(errors[0].message).to.equal('Max number of visits exceeded')
    expect(data.createVisit).to.be.null
  })

  it('cannot book an event which is in disabled group', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 11, end: 12 })
    const { errors } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...visitEventInDisabledGroup, startTime, endTime }
    })
    expect(errors[0].message).to.equal('Event is assigned to a disabled group')
  })

  it('cannot book an event with too many participants', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 11, end: 12 })
    const { errors } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...visitTwoWeeksAhead, startTime, endTime, participants: 100 }
    })
    expect(errors[0].message).to.equal('Max number of participants exceeded')
  })

  it('cannot book an event without specifying visit type', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const [startTime, endTime] = timeSlotByDay(15, { start: 11, end: 12 })
    const { errors } = await mutate({
      mutation: CREATE_VISIT,
      variables: { ...visitTwoWeeksAhead, startTime, endTime, teaching: undefined }
    })
    expect(errors[0].message).to.equal('Provide a teaching type')
  })

  // ------------ VISIT GET
  it('cannot get all visits', async () => {
    const { query } = createTestClient(serverCustomer)
    const { errors } = await query({ query: VISITS })
    expect(errors[0].message).to.equal('Not authorized')
  })

  it('can get a visit by id', async () => {
    const { query } = createTestClient(serverCustomer)
    const { data } = await query({ query: FIND_VISIT, variables: { id: '2' } })
    expect(data.findVisit.clientName).to.equal('Ivalon Opettaja 2')
    expect(data.findVisit.id).to.equal('2')
  })

  it('cannot get a nonexisting visit', async () => {
    const { query } = createTestClient(serverCustomer)
    const { data } = await query({ query: FIND_VISIT, variables: { id: 'notexists' } })
    expect(data.findVisit).to.equal(null)
  })

  // ------------ VISIT CANCEL

  it('can cancel a visit', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const id = '2'
    const { data, errors } = await mutate({
      mutation: CANCEL_VISIT,
      variables: { id }
    })
    expect(errors).to.be.undefined
    const visit = session.committed[`${id}-Visit`]
    const event = session.committed[`${visit.event}-Event`]
    const newEvent = session.committed[`${dbevents.length + 1}-Event`]
    const group = session.committed[`${event.group}-Group`]
    expect(visit.id).to.equal(id)
    expect(visit.status).to.equal(false)
    expect(visit.clientName).to.equal('Ivalon Opettaja 2')
    expect(event.title).to.equal('Fully booked')
    expect(event.visits.map(v => v.id)).not.to.contain(visit.id)
    expect(event.visits.length).to.equal(1)
    expect(event.group).to.equal(group.id)
    expect(group.visitCount).to.equal(1)
    expect(group.disabled).to.be.true
    expect(newEvent.group).to.be.null
    expect(newEvent.start).to.equal(visit.startTime)
    expect(newEvent.end).to.equal(visit.endTime)
    expect(Object.entries(session.committed).length).to.equal(4)
    expect(data.cancelVisit.id).to.equal(id)
  })

  it('cannot cancel a visit that does not exist', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors, data } = await mutate({
      mutation: CANCEL_VISIT,
      variables: { id: 'notexist' }
    })
    expect(errors[0].message).to.equal('Visit not found')
    expect(data.cancelVisit).to.equal(null)
  })

  it('cannot cancel a visit that is already cancelled', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors, data } = await mutate({
      mutation: CANCEL_VISIT,
      variables: { id: '1' }
    })
    expect(errors[0].message).to.equal('Visit not found')
    expect(data.cancelVisit).to.equal(null)
  })

})
