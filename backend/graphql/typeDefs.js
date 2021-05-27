const { gql } = require('apollo-server-express')

const typeDefs = gql `
  type User {
    id: ID!
    username: String!
    isAdmin: Boolean!
  }
  type Token {
    value: String!
  }
  type Query {
    getUsers: [User]!
    me: User!
  }
  type Mutation {
    createUser(
      username: String!
      password: String!
      isAdmin: Boolean!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

module.exports = typeDefs