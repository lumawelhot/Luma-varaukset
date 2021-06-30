/* eslint-disable no-unused-vars */
import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, waitFor, fireEvent, screen } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { createMemoryHistory } from 'history'
import { EVENTS } from '../graphql/queries'
import EventPage from './EventPage'
import { set, addDays } from 'date-fns'

const emptyList = [
  {
    request: {
      query: EVENTS,
    },
    result: {
      data: {
        getEvents: [],
      },
    },
  },
]

const testEvent = {
  id:'60d89e27aca3d4193fe02ce3',
  title:'Test unavailable event',
  resourceids:[1,2,3],
  grades:[1,2],
  inPersonVisit:true,
  remoteVisit:false,
  tags:[
    {
      id:'60d89831aca3d4193fe02c7e',
      name:'Fysiikka'
    },
    {
      id:'60d89831aca3d4193fe02c7d',
      name:'Matematiikka'
    }
  ],
  extras:[],
  duration:60,
  desc:'Unavailable event description',
  otherRemotePlatformOption:null,
  start: addDays(set(new Date(), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }), 5),
  end: addDays(set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }), 5),
  booked:false
}

const testUser = {
  username: 'tester',
  isAdmin: false
}

test('Renders without error with valid event', async () => {
  const { container } = render(
    <MockedProvider mocks={emptyList} addTypename={false}>
      <EventPage event={testEvent} handleBookingButtonClick={null} currentUser={null} sendMessage={null}/>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0)))
})

test('Booking button should not be visible for an anonymous user', async () => {
  const { container } = render(
    <MockedProvider mocks={emptyList} addTypename={false}>
      <EventPage event={testEvent} handleBookingButtonClick={null} currentUser={null} sendMessage={null}/>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0)))
  const button = document.getElementById('booking-button')
  expect(button).toBe(null)
  expect(container.innerHTML).toContain('Valitettavasti tämä vierailu ei ole varattavissa.')
})

test('Booking button should be visible for a logged in user', async () => {
  const { container } = render(
    <MockedProvider mocks={emptyList} addTypename={false}>
      <EventPage event={testEvent} handleBookingButtonClick={null} currentUser={testUser} sendMessage={null}/>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0)))
  const button = document.getElementById('booking-button')
  expect(container.innerHTML).not.toContain('Valitettavasti tämä vierailu ei ole varattavissa.')
  expect(button.innerHTML).toContain('Varaa vierailu')
})

test('Booking button should not be visible for a booked event', async () => {
  let event = { ...testEvent, booked: true }
  const { container } = render(
    <MockedProvider mocks={emptyList} addTypename={false}>
      <EventPage event={event} handleBookingButtonClick={null} currentUser={null} sendMessage={null}/>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0)))
  const button = document.getElementById('booking-button')
  expect(button).toBe(null)
  expect(container.innerHTML).toContain('Valitettavasti tämä vierailu ei ole varattavissa.')
})