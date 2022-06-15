const createError = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const path = require('path')

const app = express()
const cors = require('cors')

const jwt = require('jsonwebtoken')

const User = require('./models/user')

const config = require('./utils/config')

const { ApolloServer } = require('apollo-server-express')
const { createServer } = require('http')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const httpServer = createServer(app)

const resolvers = require('./graphql/resolvers')
const typeDefs = require('./graphql/typeDefs')
const schema = makeExecutableSchema({ typeDefs, resolvers })

const graphQLEndpoint = process.env.PUBLIC_URL?.includes('staging') ? '/luma-varaukset/graphql' : '/graphql'
const server = new ApolloServer({
  schema,
  introspection: true,
  playground: {
    endpoint: graphQLEndpoint,
    subscriptionEndpoint: graphQLEndpoint + '/ws'
  },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      try {
        const decodedToken = jwt.verify(
          auth.substring(7), config.SECRET
        )
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser: currentUser ? currentUser : 'user' }
      } catch (error) {
        return null
      }
    }
  }
})
server.applyMiddleware({ app })

SubscriptionServer.create({
  schema,
  execute,
  subscribe,
}, {
  server: httpServer,
  path: server.graphqlPath + '/ws',
})

// Define this here
require('./services/mongoSetup')

app.use(logger('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(express.static('build'))
app.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html'))) // This is needed for React Router in frontend!
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = httpServer
