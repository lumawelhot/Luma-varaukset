const { ApolloServer } = require('apollo-server-express')
const typeDefs = require('../../graphql/typeDefs')
const resolvers = require('../../graphql/resolvers')
const users = require('../db/users.json')

const employeeServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => ({ currentUser: users[1] })
  })
}

const adminServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => ({ currentUser: users[0] })
  })
}

const customerServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {}
  })
}

module.exports = {
  adminServer,
  employeeServer,
  customerServer
}