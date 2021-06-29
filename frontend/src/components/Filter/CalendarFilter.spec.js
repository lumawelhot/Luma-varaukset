import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent, waitFor } from '@testing-library/react'
import CalendarFilter from './CalendarFilter'

const events = [
  {
    'title': 'Maanjäristysten alueellisuus ja niiden vaikutukset',
    'start': '2021-07-09T09:00:00+0300',
    'end': '2021-07-09T13:30:00+0300',
    'resourceId': 4,
    'grades': [1],
    'booked': false,
    'inPersonVisit': true,
    'remoteVisit': true
  },
  {
    'title': 'Lämpösäteily ja ilmastonmuutos',
    'start': '2021-06-15T08:30:00+0300',
    'end': '2021-06-15T14:30:00+0300',
    'resourceId': 4,
    'grades': [1],
    'booked': false,
    'inPersonVisit': true,
    'remoteVisit': false
  }
]

describe('Calendar filtering works', () => {

  it('Filtering by resource', async () => {
    const filterFunction = () => () => { return true }
    const setFilterFunction = jest.fn()

    const component = render(
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
    )
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let checkbox = await component.findByLabelText('Lähiopetus')
    fireEvent.click(checkbox)
    const localEvents = events.filter(event => filterFunction(event))
    expect(localEvents).toHaveLength(2)
  })
})