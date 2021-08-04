import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, waitFor, fireEvent, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { VISITS } from '../graphql/queries'
import VisitList from './VisitList'
import '../i18n'

const emptyList = [
  {
    request: {
      query: VISITS,
    },
    result: {
      data: {
        getVisits: [],
      },
    },
  },
]

const singleItem = [
  {
    request: {
      query: VISITS,
    },
    result: {
      data: {
        getVisits: [
          {
            'id':'60c8628feb217d69b0703967',
            'event': {
              'id':'60c86276eb217d69b0703960',
              'title':'Maanjäristysten alueellisuus ja niiden vaikutukset',
              'resourceids':[4]
            },
            'grade':'1. luokka',
            'participants':9,
            'extras':[],
            'clientName':'Opettaja',
            'schoolName':'Koulu',
            'schoolLocation':'Location',
            'clientEmail':'opettaja@luma.com',
            'clientPhone':'4234242',
            'status':true,
            'startTime': new Date().getTime(),
            'endTime': new Date().getTime(),
            'remotePlatform': 'Zoom',
            'customFormData': null
          }
        ],
      },
    },
  },
]

test('Renders without error with empty list', async () => {
  const { container } = render(
    <MockedProvider mocks={emptyList} addTypename={false}>
      <VisitList/>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const field = container.querySelector('.subtitle.luma')
  expect(field.innerHTML).toContain('Varauksia ei löytynyt.')
})

test('Renders without error with 1 item', async () => {
  const { container } = render(
    <MockedProvider mocks={singleItem} addTypename={false}>
      <VisitList/>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const element = container.querySelector('tbody > tr > td')
  expect(element.innerHTML).toContain('Maanjäristysten alueellisuus ja niiden vaikutukset')
})

test('URL is copied', async () => {
  document.execCommand = jest.fn()
  const notify = jest.fn()
  const { container } = render(
    <MockedProvider mocks={singleItem} addTypename={false}>
      <VisitList notify={notify}/>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const element = container.querySelector('tbody > tr button.luma')
  fireEvent.click(element)
  expect(document.execCommand.mock.calls).toHaveLength(1)
  expect(document.execCommand.mock.calls[0][0]).toBe('copy')
})

test('Return on clicking "Poistu"', async () => {
  const history = createMemoryHistory()

  const { container } = render(
    <MockedProvider mocks={singleItem} addTypename={false}>
      <Router history={history}>
        <VisitList/>
      </Router>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const element = container.querySelector('.button.luma.primary')
  fireEvent.click(element)
  expect(history.location.pathname).toBe('/')
})

test('Filtering works as expected', async () => {
  render(
    <MockedProvider mocks={singleItem} addTypename={false}>
      <VisitList/>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const element = screen.getByText('FOTONI')
  fireEvent.click(element)
  const field = screen.getByText('Varauksia ei löytynyt.')
  expect(field).toBeDefined()
})

test('Status is displayed correctly', async () => {
  let singleItemCancelled = [...singleItem]
  singleItemCancelled[0].result.data.getVisits[0].status = false

  render(
    <MockedProvider mocks={singleItemCancelled} addTypename={false}>
      <VisitList/>
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0))) // Allow component time to render
  const field = screen.getByText('PERUTTU')
  expect(field).toBeDefined()
})