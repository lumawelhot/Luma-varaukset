const createError = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bcrypt = require('bcrypt')
const path = require('path')

const app = express()
const cors = require('cors')

const jwt = require('jsonwebtoken')

const User = require('./models/user')
const Event = require('./models/event')
const Tag = require('./models/tag')
//const Extra = require('./models/tag')
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

const mongoose = require('mongoose')

const createAdmin = async () => {
  await User.deleteMany({})
  const userObject = new User({
    username: 'Admin',
    passwordHash: await bcrypt.hash('salainen', 10),
    isAdmin: true,
  })
  await userObject.save()
}
const createEmployee = async () => {
  const userObject = new User({
    username: 'Employee',
    passwordHash: await bcrypt.hash('emp', 10),
    isAdmin: false,
  })
  await userObject.save()
}

const createTags = async () => {
  await Tag.deleteMany({})
  const tag1 = new Tag({
    name: 'Matematiikka'
  })
  const tag2 = new Tag({
    name: 'Fysiikka'
  })
  const tag3 = new Tag({
    name: 'Maantiede'
  })

  await tag1.save()
  await tag2.save()
  await tag3.save()
}

const unlockEvents = async () => {
  const events = await Event.find({})
  for (let event of events) {
    event.reserved = null
    await event.save()
  }
  console.log('event reservations unlocked')
}

if (process.env.NODE_ENV === 'test') {
  const { importStaticEvents }  = require('./utils/importStaticData')
  const { MongoMemoryServer } = require('mongodb-memory-server')
  const mongoServer = new MongoMemoryServer()
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)
  mongoServer.getUri().then(uri => {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(async () => {
        console.log('connected to MongoDB memory server, initializing database')
        await createAdmin()
        await createEmployee()
        await createTags()
        await importStaticEvents()
        //await createExtras()
      })
      .catch((error) => {
        console.log('error connecting to MongoDB: ', error.message)
      })
  })
  const { resetDbForE2E } = require('./utils/mongoinit')
  app.get('/reset', async (req, res) => {
    await resetDbForE2E()
    res.json({ message: 'Database reset for E2E tests' })
  })
} else if (process.env.NODE_ENV === 'production') { // production mode
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)
  mongoose.connect('mongodb://luma-varaukset-db:27017/luma-varaukset', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB')
      unlockEvents()
    })
    .catch((error) => {
      console.log('Error connecting to MongoDB: ', error.message)
    })
} else {
  const { importStaticEvents }  = require('./utils/importStaticData')
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)
  mongoose.connect('mongodb://localhost:27017/luma-varaukset', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('connected to MongoDB')
      unlockEvents()
    })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'MongoDB connection error:'))
  const { resetDbForE2E } = require('./utils/mongoinit')
  app.get('/reset', async (req, res) => {
    await resetDbForE2E()
    await createAdmin()
    await createEmployee()
    await createTags()
    await importStaticEvents()
    res.json({ message: 'Database reset for E2E tests' })
  })
}

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
