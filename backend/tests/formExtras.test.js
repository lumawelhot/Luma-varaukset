const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const UserModel = require('../models/user')
const FormModel = require('../models/forms')
const FormSubmissionsModel = require('../models/formSubmissions')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { CREATE_FORM, UPDATE_FORM, DELETE_FORM, CREATE_FORM_SUBMISSION } = require('./testHelpers')

let adminUserData
let serverAdmin

beforeAll(async () => {
  // connect to database
  await mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
      console.log('connected to test-mongodb')
    })
    .catch((error) => {
      console.log('connection error: ', error.message)
    })
  await UserModel.deleteMany({})
  await FormSubmissionsModel.deleteMany({})
  await FormModel.deleteMany({})

  const adminPassword = await bcrypt.hash('admin-password', 10)
  adminUserData = { username: 'admin', passwordHash: adminPassword, isAdmin: true }
  const adminUser = new UserModel(adminUserData)
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
    const form = new FormModel(formData)
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
    const form = await FormModel.findOne({})
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
    const form = await FormModel.findOne({})
    const response = await mutate({
      mutation: DELETE_FORM,
      variables: {
        id: form._id.toString()
      }
    })
    expect(response.errors).toBeUndefined()
  })
})

describe('Form Submissions model test', () => {
  it('Form submission can be created', async () => {
    const formData = {
      name: 'Test form for submissions',
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
    const form = new FormModel(formData)
    const savedForm = await form.save()
    const submissionData = {
      form: savedForm._id,
      values: [
        {
          name: 'username', value: 'tester'
        },
        {
          name: 'email', value: 'test@example.com'
        }
      ]
    }
    const submission = new FormSubmissionsModel(submissionData)
    const savedSubmission = await submission.save()
    expect(savedSubmission._id).toBeDefined()
    expect(savedSubmission.form).toEqual(savedForm._id)
    expect(savedSubmission.values[0]).toBe(submissionData.values[0])
    expect(savedSubmission.values[1]).toBe(submissionData.values[1])
  })

})

describe('Form Submissions server test', () => {
  it('Form submission can be created', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const form = await FormModel.findOne({})
    const values = [
      {
        name: 'username', value: 'tester'
      },
      {
        name: 'email', value: 'test@example.com'
      }
    ]
    const response = await mutate({
      mutation: CREATE_FORM_SUBMISSION,
      variables: {
        formID: form._id.toString(),
        values: JSON.stringify(values)
      }
    })
    expect(response.errors).toBeUndefined()
  })
})

afterAll(async () => {
  await UserModel.deleteMany({})
  await FormSubmissionsModel.deleteMany({})
  await FormModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})
