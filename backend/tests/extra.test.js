const sinon = require('sinon')
const expect = require('chai').expect
const { createTestClient } = require('./utils/client')
const { EXTRAS, CREATE_EXTRA, MODIFY_EXTRA, DELETE_EXTRAS } = require('./graphql/queries')
const { employeeServer, customerServer } = require('./utils/server')
const { extrasStub } = require('./utils/dbstub')
const { PubSub } = require('graphql-subscriptions')
const dbextras = require('./db/extras.json')
const { validExtra } = require('./db/data')

let serverEmployee
let serverCustomer

let sandbox
beforeEach(async () => {
  serverEmployee = employeeServer()
  serverCustomer = customerServer()
  sandbox = sinon.createSandbox()
  sandbox.stub(new PubSub(), 'publish').callsFake(() => {})
  extrasStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

const getExtras = async () => {
  const { query } = createTestClient(serverCustomer)
  return (await query({ query: EXTRAS }))?.data?.getExtras
}

describe('As an employee I', () => {

  it('can create a new extra', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data } = await mutate({
      mutation: CREATE_EXTRA,
      variables: validExtra
    })
    const extra = Object.assign(validExtra, { id: (dbextras.length + 1).toString() })
    expect(data.createExtra).to.deep.equal(extra)
    expect(await getExtras()).to.deep.equal(dbextras.concat(extra))
  })

  it('can modify an extra', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const extra = {
      id: '3',
      name: 'This is a new name',
      remoteLength: 20
    }
    const { data } = await mutate({
      mutation: MODIFY_EXTRA,
      variables: extra
    })
    expect(data.modifyExtra).to.deep.equal({
      ...extra,
      classes: [ 1, 2, 3 ],
      inPersonLength: 10
    })
    expect(await getExtras()).to.deep.equal(dbextras.map(e => e.id === '3'
      ? { ...e, name: 'This is a new name', remoteLength: 20 } : e))
  })

  it('can delete extras', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data } = await mutate({
      mutation: DELETE_EXTRAS,
      variables: { ids: ['1', '4'] }
    })
    expect(data.deleteExtras).to.deep.equal(['1', '4'])
    expect(await getExtras()).to.deep.equal(dbextras.filter(e => !['1', '4'].includes(e.id)))
  })

})

describe('As a customer I', () => {

  it('can get all extras', async () => {
    expect(await getExtras()).to.deep.equal(dbextras)
  })

  it('cannot create a new extra', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: CREATE_EXTRA,
      variables: validExtra
    })
    expect(errors[0].message).to.equal('Not authorized')
    expect(await getExtras()).to.deep.equal(dbextras)
  })

  it('cannot modify an extra', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: MODIFY_EXTRA,
      variables: {
        id: '3',
        name: 'This is a new name',
        remoteLength: 20
      }
    })
    expect(errors[0].message).to.equal('Not authorized')
  })

  it('cannot delete extras', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: DELETE_EXTRAS,
      variables: { ids: ['2', '4'] }
    })
    expect(errors[0].message).to.equal('Not authorized')
  })

})