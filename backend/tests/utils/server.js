const { ApolloServer } = require('apollo-server-express')
const typeDefs = require('../../graphql/typeDefs')
const resolvers = require('../../graphql/resolvers')
const users = require('../db/users.json')

const employeeServer = () => new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ currentUser: users[1] })
})

const adminServer = () => new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ currentUser: users[0] })
})

const customerServer = () => new ApolloServer({
  typeDefs,
  resolvers,
  context: async () => {}
})

module.exports = {
  adminServer,
  employeeServer,
  customerServer
}
