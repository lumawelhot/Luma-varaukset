import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, waitFor, fireEvent, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { GraphQLError } from 'graphql'
import { LOGIN } from '../graphql/queries'
import '../i18n'

import LoginForm from './LoginForm'

const loginSuccess = [
  {
    request: {
      query: LOGIN,
      variables: { username: 'Test', password: 'Test' }
    },
    result: {
      data: {
        login: { 'value': 'abrakadabra' },
      },
    },
  },
]

const loginFailed = [
  {
    request: {
      query: LOGIN,
      variables: { username: 'Test', password: 'Test' }
    },
    result: {
      errors: [new GraphQLError('Error!')]
    },
  },
]

test('Renders without error', () => {
  const { container } = render(
    <MockedProvider mocks={loginSuccess} addTypename={false}>
      <LoginForm/>
    </MockedProvider>
  )
  expect(container.firstChild).toMatchSnapshot()
})

test('Login successful', async () => {
  let mockStorage = {}
  const setItemSpy = jest
    .spyOn(global.Storage.prototype, 'setItem')
    .mockImplementation((key, value) => {
      mockStorage[key] = value
    })
  const history = createMemoryHistory()
  const getUser = jest.fn()
  const { container } = render(
    <MockedProvider mocks={loginSuccess} addTypename={false}>
      <Router history={history}>
        <LoginForm getUser={getUser}/>
      </Router>
    </MockedProvider>
  )
  const usernameInput = container.querySelector('#username')

  fireEvent.change(usernameInput, {
    target: { value: 'Test' }
  })
  const passwordInput = container.querySelector('#password')
  fireEvent.change(passwordInput, {
    target: { value: 'Test' }
  })
  const loginButton = await container.querySelector('#login')
  fireEvent.click(loginButton)
  await waitFor(() => new Promise((res) => setTimeout(res, 300))) // Allow component time to render
  expect(getUser).toHaveBeenCalled()
  expect(setItemSpy).toHaveBeenCalled()
  expect(history.location.pathname).toBe('/')
  expect(mockStorage['app-token']).toEqual('abrakadabra')
  setItemSpy.mockRestore()
})

test('Login not successful', async () => {
  const history = createMemoryHistory()
  const getUser = jest.fn()
  const sendMessage = jest.fn()
  const { container } = render(
    <MockedProvider mocks={loginFailed}>
      <Router history={history}>
        <LoginForm getUser={getUser} sendMessage={sendMessage} />
      </Router>
    </MockedProvider>
  )
  const usernameInput = container.querySelector('#username')

  fireEvent.change(usernameInput, {
    target: { value: 'Test' }
  })
  const passwordInput = container.querySelector('#password')
  fireEvent.change(passwordInput, {
    target: { value: 'Test' }
  })
  const loginButton = await container.querySelector('#login')
  fireEvent.click(loginButton)
  await waitFor(() => new Promise((res) => setTimeout(res, 300))) // Allow component time to render
  expect(sendMessage).toHaveBeenCalledTimes(1)
})

test('Return on clicking "Back"', async () => {
  const history = createMemoryHistory()

  const { container } = render(
    <MockedProvider mocks={loginSuccess} addTypename={false}>
      <Router history={history}>
        <LoginForm/>
      </Router>
    </MockedProvider>
  )
  const backButton = await container.querySelector('button:not(.primary)')
  fireEvent.click(backButton)
  //await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  expect(history.location.pathname).toBe('/')
})

