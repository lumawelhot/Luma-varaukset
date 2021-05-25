// Example test

const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

beforeEach( () => {
  //
})

describe('example test set', () => {
  test('example test', () => {
    // do something here
  })
})

