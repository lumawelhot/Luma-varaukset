const sinon = require('sinon')
const { expect } = require('chai')
const { createTestClient } = require('./utils/client')
const { GET_EMAIL_TEMPLATES, UPDATE_EMAIL } = require('./graphql/queries')
const { adminServer, employeeServer } = require('./utils/server')
const { emailsStub } = require('./utils/dbstub')
const dbemails = require('./db/emails.json')

let serverAdmin
let serverEmployee

let sandbox
beforeEach(() => {
  serverAdmin = adminServer()
  serverEmployee = employeeServer()
  sandbox = sinon.createSandbox()
  emailsStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

describe('As an admin I', () => {

  it('can get all email templates', async () => {
    const { query } = createTestClient(serverAdmin)
    const { data, errors } = await query({ query: GET_EMAIL_TEMPLATES })
    expect(errors).to.be.undefined
    expect(data.getEmailTemplates).to.deep.equal(dbemails.map(e => {
      const email = { ...e }
      delete email.id
      return email
    }))
  })

  it('can modify an email template', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const { data, errors } = await mutate({
      mutation: UPDATE_EMAIL,
      variables: { name: 'welcome', html: 'New html' }
    })
    expect(errors).to.be.undefined
    expect(data.updateEmail.name).to.equal('welcome')
    expect(data.updateEmail.html).to.equal('New html')
  })

})

describe('As an employee I', () => {

  it('cannot get email templates', async () => {
    const { query } = createTestClient(serverEmployee)
    const { data, errors } = await query({ query: GET_EMAIL_TEMPLATES })
    expect(data.getEmailTemplates).to.be.null
    expect(errors[0].message).to.equal('No admin privileges')
  })

  it('cannot modify an email template', async () => {
    const { mutate } = createTestClient(serverEmployee)
    const { data, errors } = await mutate({
      mutation: UPDATE_EMAIL,
      variables: { name: 'welcome', html: 'Malicious' }
    })
    expect(data.updateEmail).to.be.null
    expect(errors[0].message).to.equal('No admin privileges')
  })

})
