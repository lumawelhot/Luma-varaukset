const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const User = require('../models/user')
const Form = require('../models/forms')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { CREATE_FORM, UPDATE_FORM, DELETE_FORM } = require('./testHelpers')

let adminUserData
let serverAdmin

beforeAll(async () => {
  await User.deleteMany({})
  await Form.deleteMany({})

  const adminPassword = await bcrypt.hash('admin-password', 10)
  adminUserData = { username: 'admin', passwordHash: adminPassword, isAdmin: true }
  const adminUser = new User(adminUserData)
  const savedAdminUser = await adminUser.save()
  expect(savedAdminUser.isAdmin).toBe(adminUser.isAdmin)

  serverAdmin = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = savedAdminUser
      return { currentUser }
    }
  })
})

describe('Form model test', () => {

  it('Form can be created', async () => {
    const formData = {
      name: 'Test form',
      fields: [
        { name: 'username',
          type: 'text',
          validation: { required: true, min: 1, max: null },
        },
        { name: 'email',
          type: 'text',
          validation: { required: true, min: 5, max: null, email: true },
        }
      ]
    }
    const form = new Form(formData)
    const savedForm = await form.save()
    expect(savedForm._id).toBeDefined()
    expect(savedForm.name).toBe(formData.name)
    expect(savedForm.fields.length).toBe(2)
    expect(savedForm.fields[0]).toBe(formData.fields[0])
    expect(savedForm.fields[1]).toBe(formData.fields[1])
  })

})

describe('Form server test', () => {

  it('Current user can create a new form successfully', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const response = await mutate({
      mutation: CREATE_FORM,
      variables: {
        name: 'Test form 2',
        fields: JSON.stringify([
          { name: 'username',
            type: 'text',
            validation: { required: true, min: 1, max: null },
          },
          { name: 'email',
            type: 'text',
            validation: { required: true, min: 5, max: null, email: true },
          }
        ])
      }
    })
    expect(response.errors).toBeUndefined()
  })

  it('Current user can update a form successfully', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const form = await Form.findOne({})
    const response = await mutate({
      mutation: UPDATE_FORM,
      variables: {
        id: form._id.toString(),
        name: 'Test form 2 updated',
        fields: JSON.stringify([
          { name: 'username',
            type: 'text',
            validation: { required: true, min: 1, max: null },
          },
          { name: 'email2',
            type: 'text',
            validation: { required: true, min: 5, max: null, email: true },
          }
        ])
      }
    })
    expect(response.errors).toBeUndefined()
  })

  it('Current user can delete a form successfully', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const form = await Form.findOne({})
    const response = await mutate({
      mutation: DELETE_FORM,
      variables: {
        id: form._id.toString()
      }
    })
    expect(response.errors).toBeUndefined()
  })
})