const sinon = require('sinon')
const expect = require('chai').expect
const { createTestClient } = require('./utils/client')
const { USERS, CREATE_USER, MODIFY_USER, LOGIN, DELETE_USERS, CURRENT_USER } = require('./graphql/queries')
const { adminServer, employeeServer, customerServer } = require('./utils/server')
const { usersStub } = require('./utils/dbstub')

let serverAdmin
let serverEmployee
let serverCustomer

let sandbox
beforeEach(async () => {
  serverAdmin = adminServer()
  serverEmployee = employeeServer()
  serverCustomer = customerServer()
  sandbox = sinon.createSandbox()
  usersStub(sandbox)
})

afterEach(() => {
  sandbox.restore()
})

const getUsers = async () => {
  const { query } = createTestClient(serverAdmin)
  const res = await query({ query: USERS })
  return res.data.getUsers
}

describe('As an admin I', () => {

  it('can create a new user', async () => {
    const { mutate } = createTestClient(serverAdmin)
    await mutate({
      mutation: CREATE_USER,
      variables: {
        username: 'new-user',
        password: 'new-password',
        isAdmin: false
      }
    })
    expect(await getUsers()).to.deep.equal([
      { id: '1', username: 'admin', isAdmin: true },
      { id: '2', username: 'employee', isAdmin: false },
      { id: '3', username: 'new-user', isAdmin: false },
    ])
  })

  it('can modify a user', async () => {
    const { mutate } = createTestClient(serverAdmin)
    await mutate({
      mutation: MODIFY_USER,
      variables: {
        user: '2',
        username: 'modified',
        password: 'newsecret'
      }
    })
    expect(await getUsers()).to.deep.equal([
      { id: '1', username: 'admin', isAdmin: true },
      { id: '2', username: 'modified', isAdmin: false }
    ])
  })

  it('cannot degrade own permissions', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const { errors } = await mutate({
      mutation: MODIFY_USER,
      variables: {
        user: '1',
        isAdmin: false
      }
    })
    expect(errors[0].message).to.include('Current user has a same id')
    expect(await getUsers()).to.deep.equal([
      { id: '1', username: 'admin', isAdmin: true },
      { id: '2', username: 'employee', isAdmin: false }
    ])
  })

  it('can remove a user', async () => {
    const { mutate } = createTestClient(serverAdmin)
    await mutate({
      mutation: DELETE_USERS,
      variables: { ids: ['2'] }
    })
    expect(await getUsers()).to.deep.equal([
      { id: '1', username: 'admin', isAdmin: true },
    ])
  })

  it('cannot remove myself', async () => {
    const { mutate } = createTestClient(serverAdmin)
    await mutate({
      mutation: DELETE_USERS,
      variables: { ids: ['1'] }
    })
    expect(await getUsers()).to.deep.equal([
      { id: '1', username: 'admin', isAdmin: true },
      { id: '2', username: 'employee', isAdmin: false }
    ])
  })

  it('can get all users', async () => {
    expect(await getUsers()).to.deep.equal([
      { id: '1', username: 'admin', isAdmin: true },
      { id: '2', username: 'employee', isAdmin: false }
    ])
  })

})

describe('As an employee I', () => {

  it('cannot create a new user', async () => {
    const { mutate } = createTestClient(serverEmployee)
    await mutate({
      mutation: CREATE_USER,
      variables: {
        username: 'new-user',
        password: 'new-password',
        isAdmin: false
      }
    })
    expect(await getUsers()).to.deep.equal([
      { id: '1', username: 'admin', isAdmin: true },
      { id: '2', username: 'employee', isAdmin: false },
    ])
  })

  it('cannot modify a user', async () => {
    const { mutate } = createTestClient(serverEmployee)
    await mutate({
      mutation: MODIFY_USER,
      variables: {
        user: '2',
        username: 'modified',
        password: 'newsecret'
      }
    })
    expect(await getUsers()).to.deep.equal([
      { id: '1', username: 'admin', isAdmin: true },
      { id: '2', username: 'employee', isAdmin: false }
    ])
  })

  it('cannot remove a user', async () => {
    const { mutate } = createTestClient(serverEmployee)
    await mutate({
      mutation: DELETE_USERS,
      variables: { ids: ['2'] }
    })
    expect(await getUsers()).to.deep.equal([
      { id: '1', username: 'admin', isAdmin: true },
      { id: '2', username: 'employee', isAdmin: false }
    ])
  })

})

describe('As a user I', () => {
  it('can log in', async () => {
    const { mutate } = createTestClient(serverCustomer)
    const { data } = await mutate({
      mutation: LOGIN,
      variables: {
        username: 'employee',
        password: 'basic-password'
      }
    })
    expect(data.login.value).to.be.a('string')
  })
  it('can get my user details', async () => {
    const { query } = createTestClient(serverEmployee)
    const { data } = await query({ query: CURRENT_USER })
    expect(data.me).to.deep.equal({
      id: '2',
      username: 'employee',
      isAdmin: false
    })
  })
})