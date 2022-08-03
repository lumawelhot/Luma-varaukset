const sinon = require('sinon')
const expect = require('chai').expect
const { createTestClient } = require('apollo-server-testing')
const { GET_ALL_FORMS, CREATE_FORM, MODIFY_FORM, DELETE_FORMS } = require('./graphql/queries')
const { employeeServer, customerServer } = require('./utils/server')
const { formsStub } = require('./utils/dbstub')
const { PubSub } = require('graphql-subscriptions')
const dbforms = require('./db/forms.json')
const { validForm } = require('./db/data')

let serverEmployee
let serverCustomer

let sandbox
beforeEach(async () => {
  serverEmployee = employeeServer()
  serverCustomer = customerServer()
  sandbox = sinon.createSandbox()
  sandbox.stub(new PubSub(), 'publish').callsFake(() => {})
  formsStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

const getForms = async () => {
  const { query } = createTestClient(serverCustomer)
  return (await query({ query: GET_ALL_FORMS }))?.data?.getForms
    .map(f => ({ ...f, fields: typeof JSON.parse(f.fields) === 'string'
      ? JSON.parse(f.fields) : f.fields }))
}

describe('As an employee I', () => {

  it('can create a new form', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data } = await mutate({
      mutation: CREATE_FORM,
      variables: validForm
    })
    const form = { ...validForm, id: (dbforms.length + 1).toString() }
    expect(data.createForm).to.deep.equal(form)
    expect(await getForms()).to.deep.equal(dbforms.concat(form))
  })

  it('can modify a form', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const form = {
      id: '2',
      fields: '[{"name":"This is a question?","type":"text","validation":{"required":true}}]',
      name: 'This is a new name'
    }
    const { data } = await mutate({
      mutation: MODIFY_FORM,
      variables: form
    })
    expect(data.updateForm).to.deep.equal(form)
    expect(await getForms()).to.deep.equal(dbforms.map(f => f.id === form.id ? form : f))
  })

  it('can delete forms', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data } = await mutate({
      mutation: DELETE_FORMS,
      variables: { ids: ['1', '2'] }
    })
    expect(data.deleteForms).to.deep.equal(['1', '2'])
    expect(await getForms()).to.deep.equal(dbforms.filter(f => !['1', '2'].includes(f.id)))
  })

})

describe('As a customer I', () => {

  it('cannot create a new form', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: CREATE_FORM,
      variables: validForm
    })
    expect(errors[0].message).to.equal('Not authorized')
  })

  it('cannot modify a form', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: MODIFY_FORM,
      variables: {
        id: '2',
        fields: '[{"name":"This is a question?","type":"text","validation":{"required":true}}]',
        name: 'This is a new name'
      }
    })
    expect(errors[0].message).to.equal('Not authorized')
    expect(await getForms()).to.deep.equal(dbforms)
  })

  it('cannot delete forms', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { errors } = await mutate({
      mutation: DELETE_FORMS,
      variables: { ids: ['1', '2'] }
    })
    expect(errors[0].message).to.deep.equal('Not authorized')
    expect(await getForms()).to.deep.equal(dbforms)
  })

  it('can get all forms', async () => {
    expect(await getForms()).to.deep.equal(dbforms)
  })

})