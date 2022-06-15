const { AuthenticationError, UserInputError } = require('apollo-server-express')

const authorized = user => {
  if (!user) {
    throw new AuthenticationError('Not authenticated')
  }
}

const isAdmin = user => {
  if (!user?.isAdmin) {
    throw new AuthenticationError('Not authenticated or no admin priviledges')
  }
}

const notFound = object => {
  if (!object) {
    throw new UserInputError('Model object not found')
  }
  return object
}

const minLenghtTest = (value, min) => {
  if (value.length < min) {
    throw new UserInputError('Malformatted input, min lenght')
  }
}

const idNotFound = id => {
  if (!id) {
    throw new UserInputError('No ID provided!')
  }
}

module.exports = {
  authorized,
  isAdmin,
  notFound,
  minLenghtTest,
  idNotFound
}