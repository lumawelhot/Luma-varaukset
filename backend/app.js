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

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const resolvers = require('./graphql/resolvers')
const typeDefs = require('./graphql/typeDefs')
const schema = makeExecutableSchema({ typeDefs, resolvers })

const graphQLEndpoint = process.env.PUBLIC_URL?.includes('staging') ? '/luma-varaukset/graphql' : '/graphql'

const server = new ApolloServer({
  schema,
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
    if (process.env.NODE_ENV !== 'production') {
      // These are helpful for debugging.
      console.log('\x1b[31m%s\x1b[0m', 'ERROR:', `${err.message}.`, '\x1b[36mPath:\x1b[0m', err.path)
      return Error('Internal Server Error')
    }
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

// These are not probably needed, consider to remove:
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(express.static('build'))
app.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html'))) // This is needed for React Router in frontend!

module.exports = httpServer
