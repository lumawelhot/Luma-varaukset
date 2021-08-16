const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const User = require('../models/user')
const Event = require('../models/event')
const Visit = require('../models/visit')
const Group = require('../models/group')
const { CREATE_VISIT, CANCEL_VISIT, CREATE_GROUP, UPDATE_GROUP, ASSIGN_EVENTS_TO_GROUP, DELETE_GROUP, createDate, UPDATE_EVENT } = require('./testHelpers')
const { details, eventData1 : eventDetails } = require('./testData')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')

let server, serverNoUser
let group1, group2, group3
let event1, event2, event3

const visitResponse = async (event, start, end) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: CREATE_VISIT,
    variables: {
      event,
      ...details,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      token: 'token'
    },
  })
}

const cancelVisit = async (id) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: CANCEL_VISIT,
    variables: { id },
  })
}

const createGroup = async (name, maxCount, publishDate, isEmployee) => {
  const { mutate } = createTestClient(isEmployee ? server : serverNoUser)
  return await mutate({
    mutation: CREATE_GROUP,
    variables: {
      name,
      maxCount,
      publishDate
    }
  })
}

const modifyGroup = async (id, name, maxCount, publishDate, isEmployee) => {
  const { mutate } = createTestClient(isEmployee ? server : serverNoUser)
  return await mutate({
    mutation: UPDATE_GROUP,
    variables: {
      id,
      name,
      maxCount,
      publishDate
    }
  })
}

const assignEventsToGroup = async (group, events) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: ASSIGN_EVENTS_TO_GROUP,
    variables: {
      group,
      events
    }
  })
}

const deleteGroup = async (group) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: DELETE_GROUP,
    variables: {
      group
    }
  })
}

const modifyEvent = async (event, group) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: UPDATE_EVENT,
    variables: {
      event,
      group,
      tags: []
    }
  })
}

beforeAll(async () => {
  await User.deleteMany({})

  const userPassword = await bcrypt.hash('password', 10)
  const userData = { username: 'employee', passwordHash: userPassword, isAdmin: false }

  const user = new User(userData)
  const savedUser = await user.save()

  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = savedUser
      return { currentUser }
    }
  })
  serverNoUser = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = undefined
      return { currentUser }
    }
  })
})

beforeEach(async () => {
  await Event.deleteMany({})
  await Visit.deleteMany({})
  await Group.deleteMany({})
  const groupDetails = {
    visitCount: 0,
    publishDate: null,
    disabled: false
  }

  const data1 = new Group({
    name: 'group1',
    maxCount: 4,
    visitCount: 0,
    publishDate: new Date().toISOString(),
    disabled: false
  })
  const data2 = new Group({
    name: 'group2',
    maxCount: 2,
    ...groupDetails
  })
  const data3 = new Group({
    name: 'group3',
    maxCount: 1,
    ...groupDetails
  })
  const eventData1 = new Event({ ...eventDetails, reserved: null })
  const eventData2 = new Event({ ...eventDetails, reserved: null })
  const eventData3 = new Event({ ...eventDetails, reserved: null })
  group1 = await data1.save()
  group2 = await data2.save()
  group3 = await data3.save()
  event1 = await eventData1.save()
  event2 = await eventData2.save()
  event3 = await eventData3.save()
})

describe('A group', () => {

  it('can be created by an employee', async () => {
    const response = await createGroup('group', 5, null, true)
    expect(response.errors).toBeUndefined()
    expect(response.data.createGroup.name).toBe('group')
  })

  it('cannot be created by an unauthorized user', async () => {
    const response = await createGroup('nogroup', 5, null, false)
    expect(response.errors[0].message).toBe('not authenticated')
    expect(response.data.createGroup).toBe(null)
  })

  it('can be modified by an employee', async () => {
    const response = await modifyGroup(group1.id, 'new name', 4, '', true)
    const { name, maxCount, publishDate } = response.data.modifyGroup
    expect(response.errors).toBeUndefined()
    expect(name).toBe('new name')
    expect(maxCount).toBe(4)
    expect(publishDate).toBe(null)
  })

  it('cannot be modified by an unauthorized user', async () => {
    const response = await modifyGroup(group1.id, 'name try', 5, '', false)
    expect(response.errors[0].message).toBe('not authenticated')
    expect(response.data.modifyGroup).toBe(null)
  })

  it('can be assigned to multiple events', async () => {
    const response = await assignEventsToGroup(group1.id, [event1.id, event3.id])
    expect(response.errors).toBeUndefined()
    expect(response.data.assignEventsToGroup.length).toBe(2)
    event1 = await Event.findById(event1.id)
    event2 = await Event.findById(event2.id)
    expect(event1.group.toString()).toBe(group1.id)
    expect(event2.group).toBe(undefined)
  })

  it('can be deleted by an employee', async () => {
    const response = await deleteGroup(group1.id)
    expect(response.errors).toBeUndefined()
    expect(response.data.deleteGroup).toBe(`Deleted Group with ID ${group1.id}`)
  })

  it('is disabled if it reaches maximum number of visits', async () => {
    await assignEventsToGroup(group3.id, [event1.id])
    await visitResponse(event1.id, createDate(11, 0), createDate(12, 0))
    const data = await Group.findById(group3.id)
    expect(data.name).toBe('group3')
    expect(data.disabled).toBe(true)
    expect(data.visitCount).toBe(1)
  })

  it('is not disabled if maximum number of visits is not exceeded', async () => {
    await assignEventsToGroup(group2.id, [event1.id])
    await visitResponse(event1.id, createDate(11, 0), createDate(12, 0))
    const data = await Group.findById(group2.id)
    expect(data.name).toBe('group2')
    expect(data.disabled).toBe(false)
    expect(data.visitCount).toBe(1)
  })

  it('can be assigned by modifying an event', async () => {
    await modifyEvent(event1.id, group2.id)
    const group = await Group.findById(group2.id)
    const event = await Event.findById(event1.id)
    expect(group.events.length).toBe(1)
    expect(event.group.toString()).toBe(group.id.toString())
  })

})

describe('Visit count calculation works properly', () => {

  it('if event is booked', async () => {
    await assignEventsToGroup(group1.id, [event1.id, event2.id])
    await visitResponse(event1.id, createDate(11, 0), createDate(12, 0))
    const data = await Group.findById(group1.id)
    expect(data.visitCount).toBe(1)
    expect(data.disabled).toBe(false)
  })

  it('if multiple events are booked', async () => {
    await assignEventsToGroup(group1.id, [event1.id, event2.id])
    await visitResponse(event1.id, createDate(11, 0), createDate(11, 15))
    await visitResponse(event1.id, createDate(11, 45), createDate(12, 0))
    await visitResponse(event2.id, createDate(11, 0), createDate(12, 0))
    await visitResponse(event3.id, createDate(11, 0), createDate(12, 0))
    const data = await Group.findById(group1.id)
    expect(data.visitCount).toBe(3)
    expect(data.disabled).toBe(false)
  })

  it('if event\'s group is changed', async () => {
    await assignEventsToGroup(group1.id, [event1.id])
    await assignEventsToGroup(group2.id, [event2.id])
    await visitResponse(event1.id, createDate(11, 0), createDate(12, 0))
    await visitResponse(event2.id, createDate(11, 0), createDate(12, 0))
    let data1 = await Group.findById(group1.id)
    let data2 = await Group.findById(group2.id)
    expect(data1.visitCount).toBe(1)
    expect(data2.visitCount).toBe(1)
    await assignEventsToGroup(group2.id, [event1.id])
    data1 = await Group.findById(group1.id)
    data2 = await Group.findById(group2.id)
    expect(data1.visitCount).toBe(0)
    expect(data2.visitCount).toBe(2)
    expect(data2.disabled).toBe(true)
  })

  it('if event\'s group changing fails', async () => {
    await assignEventsToGroup(group1.id, [event1.id])
    await assignEventsToGroup(group3.id, [event2.id])
    await visitResponse(event1.id, createDate(11, 0), createDate(12, 0))
    await visitResponse(event2.id, createDate(11, 0), createDate(12, 0))
    let data1 = await Group.findById(group1.id)
    let data2 = await Group.findById(group3.id)
    expect(data1.visitCount).toBe(1)
    expect(data2.visitCount).toBe(1)
    await assignEventsToGroup(group3.id, [event1.id])
    data1 = await Group.findById(group1.id)
    data2 = await Group.findById(group3.id)
    expect(data1.visitCount).toBe(1)
    expect(data2.visitCount).toBe(1)
  })

})

describe('An event', () => {

  it('cannot be booked if maximum number of visits in the group is exceeded', async () => {
    await assignEventsToGroup(group3.id, [event1.id, event2.id])
    await visitResponse(event1.id, createDate(11, 0), createDate(12, 0))
    const response = await visitResponse(event2.id, createDate(11, 0), createDate(12, 0))
    expect(response.errors[0].message).toBe('this group is disabled')
    expect(response.data.createVisit).toBe(null)
  })

  it('is created with correct details if event\'s visit in the disabled group is cancelled', async () => {
    await assignEventsToGroup(group3.id, [event1.id, event2.id])
    const visit = await visitResponse(event1.id, createDate(11, 0), createDate(12, 0))
    await cancelVisit(visit.data.createVisit.id)
    const group = await Group.findById(group3.id)
    const events = await Event.find({})
    const event = events.filter(event => ![event1.id, event2.id, event3.id].includes(event.id))[0]
    expect(group.name).toBe('group3')
    expect(group.disabled).toBe(true)
    expect(group.visitCount).toBe(0)
    expect(event.name).toBe(event1.name)
    expect(event.id).not.toBe(event1.id)
    expect(event.group).toBeUndefined()
    expect(event.start.toISOString()).toBe(createDate(11, 0).toISOString())
    expect(event.end.toISOString()).toBe(createDate(12, 0).toISOString())
    expect(event.availableTimes[0].startTime).toBe(createDate(11, 0).toISOString())
    expect(event.availableTimes[0].endTime).toBe(createDate(12, 0).toISOString())
    expect(event.availableTimes.length).toBe(1)
    expect(event.visits.length).toBe(0)
  })

})