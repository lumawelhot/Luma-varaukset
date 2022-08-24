const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')

const { User } = require('./db')
const config = require('./config')

const { ApolloServer } = require('apollo-server-express')
const { createServer } = require('http')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const httpServer = createServer(app)
const logger = require('./logger')

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const resolvers = require('./graphql/resolvers')
const typeDefs = require('./graphql/typeDefs')
const schema = makeExecutableSchema({ typeDefs, resolvers })

const graphQLEndpoint = process.env.PUBLIC_URL?.includes('staging') ? '/luma-varaukset/graphql' : '/graphql'

const server = new ApolloServer({
  schema,
  cache: 'bounded',
  introspection: true,
  csrfPrevention: true,
  playground: {
    endpoint: graphQLEndpoint,
    subscriptionEndpoint: `${graphQLEndpoint }/ws`
  },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    const prefix = 'bearer '
    if (auth && auth.toLowerCase().startsWith(prefix)) {
      try {
        const decodedToken = jwt.verify(auth.substring(prefix.length), config.SECRET)
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser: currentUser ? currentUser : 'user' }
      } catch (error) {
        return null
      }
    }
  },
  formatError: (err) => {
    // Logging in production could be usefull
    // Be carefull when logging, do not log user details
    // Do not log database errors
    /* const isDev = process.env.NODE_ENV !== 'production'
    if (isDev || (
      !err.message.includes('alidation') &&
      !err.message.includes('model')
    )) logger.error(`Error: "${err.message}", Path: "${err.path}"`) */
    logger.debug(`Error: "${err.message}", Path: "${err.path}"`)
    return Error('Internal Server Error')
  }
})
server.start().then(() => server.applyMiddleware({ app }))

const wsServer = new WebSocketServer({
  server: httpServer,
  path: `${server.graphqlPath }/ws`,
})
useServer({ schema }, wsServer)

// Setup MongoDB
require('./services/dbsetup')

// Ensure that this cannot run on production environment
if (process.env.NODE_ENV === 'e2e') {
  const initE2E = require('./tests/utils/initE2E')
  initE2E(app)
}

// These are not probably needed, consider to remove:
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(express.static('build'))
app.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html'))) // This is needed for React Router in frontend!

module.exports = httpServer
