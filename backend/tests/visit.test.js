const sinon = require('sinon')
const expect = require('chai').expect
const { createTestClient } = require('apollo-server-testing')
const { CREATE_VISIT } = require('./graphql/queries')
const { employeeServer, customerServer } = require('./utils/server')
const { groupsStub, visitsStub, eventsStub, transactionStub, extrasStub } = require('./utils/dbstub')
const { PubSub } = require('graphql-subscriptions')
const { visitTwoWeeksAhead } = require('./db/data')
const { addBusinessDays, set } = require('date-fns')
//const dbgroups = require('./db/groups.json')

let serverEmployee
let serverCustomer

let session
let sandbox
beforeEach(async () => {
  serverEmployee = employeeServer()
  serverCustomer = customerServer()
  sandbox = sinon.createSandbox()
  sandbox.stub(new PubSub(), 'publish').callsFake(() => {})
  groupsStub(sandbox)
  visitsStub(sandbox)
  eventsStub(sandbox)
  extrasStub(sandbox)
  session = transactionStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

describe('As an employee I', () => {



})

describe('As a customer I', () => {

  it('can book a visit atleast two weeks ahead', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const data = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        ...visitTwoWeeksAhead,
        startTime: addBusinessDays(set(new Date(), { hours: 11 }), 15).toISOString(),
        endTime: addBusinessDays(set(new Date(), { hours: 12 }), 15).toISOString()
      }
    })
    console.log(data)
  })

})