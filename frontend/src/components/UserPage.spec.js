import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import UserPage from './UserPage'
import '../i18n'

test('Renders without error with empty user', async () => {
  const { container } = render(
    <UserPage/>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  expect(container).toMatchSnapshot()
})

test('Renders without error with user', async () => {
  const { container } = render(
    <UserPage  currentUser={{ name: 'Tester', isAdmin: false }}/>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  expect(container).toMatchSnapshot()
})

test('Renders without error with admin user', async () => {
  const { container } = render(
    <UserPage  currentUser={{ name: 'Tester', isAdmin: true }}/>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  expect(container).toMatchSnapshot()
})

test('CreateEvent modal is set to true', async () => {
  const handler = jest.fn()

  const { container } = render(
    <UserPage currentUser={{ name: 'Tester', isAdmin: false }} setShowEventForm={handler}/>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const buttons = container.querySelectorAll('.button.luma')
  fireEvent.click(buttons[0])
  expect(handler).toHaveBeenCalledTimes(1)
  expect(handler).toHaveBeenCalledWith(true)
})

test('History should be set to /visits', async () => {
  const history = createMemoryHistory()

  const { container } = render(
    <Router history={history}>
      <UserPage currentUser={{ name: 'Tester', isAdmin: false }}/>
    </Router>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const buttons = container.querySelectorAll('.button.luma')
  fireEvent.click(buttons[1])
  expect(history.location.pathname).toBe('/visits')
})

test('History should be set to /extras', async () => {
  const history = createMemoryHistory()

  const { container } = render(
    <Router history={history}>
      <UserPage currentUser={{ name: 'Tester', isAdmin: false }}/>
    </Router>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const buttons = container.querySelectorAll('.button.luma')
  fireEvent.click(buttons[2])
  expect(history.location.pathname).toBe('/extras')
})

test('History should be set to /forms', async () => {
  const history = createMemoryHistory()

  const { container } = render(
    <Router history={history}>
      <UserPage currentUser={{ name: 'Tester', isAdmin: true }}/>
    </Router>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const buttons = container.querySelectorAll('.button.luma')
  fireEvent.click(buttons[3])
  expect(history.location.pathname).toBe('/forms')
})

test('History should be set to /users', async () => {
  const history = createMemoryHistory()

  const { container } = render(
    <Router history={history}>
      <UserPage currentUser={{ name: 'Tester', isAdmin: true }}/>
    </Router>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const buttons = container.querySelectorAll('.button.luma')
  fireEvent.click(buttons[6])
  expect(history.location.pathname).toBe('/users')
})