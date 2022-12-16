const { AuthenticationError, UserInputError } = require('apollo-server-express')
const { checkTimeslot, validTimeSlot, calcTimeSlot } = require('./calculator')
const { differenceInDays } = require('date-fns')
const bcrypt = require('bcrypt')

const authorized = fn => (root, args, context, ...rest) => {
  if (!context.currentUser) {
    throw new AuthenticationError('Not authorized')
  }
  return fn(root, args, context, ...rest)
}

const isAdmin = fn => (root, args, context, ...rest) => {
  if (!context.currentUser?.isAdmin) {
    throw new AuthenticationError('No admin privileges')
  }
  return fn(root, args, context, ...rest)
}

const eventValidate = args => {
  const { title, grades, start, end } = args
  if (title.length < 5) throw new UserInputError('Too short title')
  if (grades.length < 1) throw new UserInputError('At least on grade')
  if (checkTimeslot(start, end)) {
    throw new UserInputError('Invalid start or end time')
  }
}

const eventModifiableAndSlot = (args, event) => {
  if (!event) throw new UserInputError('Event not found')
  const start = args.start ? args.start : event.start
  const end = args.end ? args.end : event.end
  if (checkTimeslot(start, end)) throw new UserInputError('Invalid start or end')

  if (event.reserved) throw new UserInputError('Event cannot be modified because booking form is open')
  if (event.disabled) throw new UserInputError('This event is disabled')
  const timeSlot = calcTimeSlot(event.visits, start, end)
  if (!timeSlot) {
    throw new UserInputError('Invalid timeslot')
  }
  return timeSlot
}

const eventModifiable = (event) => {
  if (event.reserved) throw new UserInputError('Event cannot be modified because booking form is open')
  if (event.disabled) throw new UserInputError('This event is disabled')
}

const createVisitValidate = (args, event, currentUser) => {
  if (event.reserved && event.reserved !== args.token) throw new UserInputError('Invalid session')
  if (event.disabled) throw new UserInputError('This event is disabled')
  if (!args.remoteVisit && !args.inPersonVisit) {
    throw new UserInputError('Provide remote or inperson visit')
  }
  const limits = typeof event?.limits === 'string' ? JSON.parse(event.limits) : event?.limits
  const maxRemoteParticipants = limits?.remote?.maxParticipants
  const maxInPersonParticipants = limits?.inPerson?.maxParticipants
  if (args.remoteVisit && maxRemoteParticipants && args.participants > maxRemoteParticipants) {
    throw new UserInputError('Max number of participants exceeded')
  }
  if (args.inPersonVisit && maxInPersonParticipants && args.participants > maxInPersonParticipants) {
    throw new UserInputError('Max number of participants exceeded')
  }
  const days = event.closedDays || 14
  const afterDays = differenceInDays(new Date(event.start), new Date()) >= days
  if (!currentUser && !afterDays) throw new UserInputError('This event cannot be booked')
  if (!validTimeSlot(event.availableTimes, args.startTime, args.endTime)) {
    throw new UserInputError('Given timeslot is invalid')
  }
}

const userValidate = args => {
  const { username, password } = args
  if (username?.length < 5) throw new UserInputError('Too short username')
  if (password && password.length < 8) throw new UserInputError('Too short password')
}

const extraValidate = args => {
  const { name, classes, remoteLength, inPersonLength } = args
  if (name?.length < 3) throw new UserInputError('Too short name')
  if (classes?.length < 1) throw new UserInputError('At least one class')
  if (remoteLength < 1) throw new UserInputError('Remote length should be at least 1')
  if (inPersonLength < 1) throw new UserInputError('In-person length should be at least 1')
}

const notCurrentUser = (current, id) => {
  if (id === current.id) {
    throw new UserInputError('Current user has a same id')
  }
}

const validPassword = async (password, hash) => {
  try {
    const passwordCorrect = await bcrypt.compare(password, hash)
    if (!passwordCorrect) throw new UserInputError('Invalid password')
  } catch (err) {
    throw new UserInputError(err.message)
  }
}

const formValidate = ({ fields }) => {
  const parsedFields = JSON.parse(fields)
  const names = new Set()
  for (const field of parsedFields) {
    if (names.has(field.name)) throw new UserInputError('Field names should be unique')
    names.add(field.name)
    if (field?.options) {
      const optionNames = new Set()
      for (const option of field.options) {
        if (optionNames.has(option.text)) throw new UserInputError('Option names should be unique')
        optionNames.add(option.text)
      }
    }
  }
}

module.exports = {
  authorized,
  isAdmin,
  eventValidate,
  userValidate,
  notCurrentUser,
  validPassword,
  extraValidate,
  createVisitValidate,
  eventModifiable,
  eventModifiableAndSlot,
  formValidate
}
