const { gql } = require('apollo-server-express')

const typeDefs = gql `
  type User {
    id: ID!
    username: String!
  }
  type Query {
    getUsers: [User]!
  }
`

module.exports = typeDefs

/*type Mutation {
    createUser(
      username: String!
      password: String!
    ): User
  }*/