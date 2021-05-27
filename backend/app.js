const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bcrypt = require('bcrypt')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

const app = express()
const cors = require('cors')

const jwt = require('jsonwebtoken')

const User = require('./models/user')

const { ApolloServer } = require('apollo-server-express')
const resolvers = require('./graphql/resolvers')
const typeDefs = require('./graphql/typeDefs')
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), 'huippusalainen'
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
});
server.applyMiddleware({ app });


const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
const mongoServer = new MongoMemoryServer()

mongoServer.getUri().then(async (uri) => {
  const port = await mongoServer.getPort();
  const dbPath = await mongoServer.getDbPath();
  const dbName = await mongoServer.getDbName();
  console.log('tietoja: ', port, dbName, dbPath)
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('connected to mongodb')
})

const createAdmin = async () => {
  const userObject = new User({
    username: 'Admin',
    passwordHash: await bcrypt.hash('salainen', 10),
    isAdmin: true,
  })
  userObject.save()
}

createAdmin()

app.use(logger('dev'));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
})

module.exports = app;