import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent, waitFor } from '@testing-library/react'
import CalendarFilter from './CalendarFilter'
import '../../i18n'

const events = [
  {
    'title': 'Maanjäristysten alueellisuus ja niiden vaikutukset',
    'start': '2021-07-09T09:00:00+0300',
    'end': '2021-07-09T13:30:00+0300',
    'resourceids': [4],
    'grades': [1],
    'booked': false,
    'inPersonVisit': false,
    'remoteVisit': true
  },
  {
    'title': 'Lämpösäteily ja ilmastonmuutos',
    'start': '2021-06-15T08:30:00+0300',
    'end': '2021-06-15T14:30:00+0300',
    'resourceids': [2],
    'grades': [2],
    'booked': false,
    'inPersonVisit': true,
    'remoteVisit': false
  }
]

describe('Calendar filtering works', () => {

  it('Filtering by visitType inPerson', async () => {
    const filterFunction = () => () => { return true }
    const setFilterFunction = jest.fn()

    const component = render(
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
    )
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let button = await component.findByText('Lähiopetus')
    fireEvent.click(button)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    const receivedFilterFunction = setFilterFunction.mock.calls[0][0]()
    const localEvents = events.filter(event => receivedFilterFunction(event))
    expect(localEvents).toHaveLength(1)
  })

  it('Filtering by visitType remote', async () => {
    const filterFunction = () => () => { return true }
    const setFilterFunction = jest.fn()

    const component = render(
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
    )
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let button = await component.findByText('Etäopetus')
    fireEvent.click(button)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    const receivedFilterFunction = setFilterFunction.mock.calls[0][0]()
    const localEvents = events.filter(event => receivedFilterFunction(event))
    expect(localEvents).toHaveLength(1)
  })

  it('Filtering by visitType deselect all', async () => {
    const filterFunction = () => () => { return true }
    const setFilterFunction = jest.fn()

    const component = render(
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
    )
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let button = await component.findByText('Etäopetus')
    fireEvent.click(button)
    button = await component.findByText('Lähiopetus')
    fireEvent.click(button)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    const receivedFilterFunction = setFilterFunction.mock.calls[1][0]()
    const localEvents = events.filter(event => receivedFilterFunction(event))
    expect(localEvents).toHaveLength(0)
  })

  it('Filtering by scienceClass', async () => {
    const filterFunction = () => () => { return true }
    const setFilterFunction = jest.fn()

    const component = render(
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
    )
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let button = await component.findByText('FOTONI')
    fireEvent.click(button)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    const receivedFilterFunction = setFilterFunction.mock.calls[0][0]()
    const localEvents = events.filter(event => receivedFilterFunction(event))
    expect(localEvents).toHaveLength(1)
  })

  it('Filtering by scienceClass deselect all', async () => {
    const filterFunction = () => () => { return true }
    const setFilterFunction = jest.fn()

    const component = render(
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
    )
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let button = await component.findByText('SUMMAMUTIKKA')
    fireEvent.click(button)
    button = await component.findByText('FOTONI')
    fireEvent.click(button)
    button = await component.findByText('LINKKI')
    fireEvent.click(button)
    button = await component.findByText('GEOPISTE')
    fireEvent.click(button)
    button = await component.findByText('GADOLIN')
    fireEvent.click(button)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    const receivedFilterFunction = setFilterFunction.mock.calls[4][0]()
    const localEvents = events.filter(event => receivedFilterFunction(event))
    expect(localEvents).toHaveLength(0)
  })

  it('Filtering by grade', async () => {
    const filterFunction = () => () => { return true }
    const setFilterFunction = jest.fn()

    const component = render(
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
    )
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let button = await component.findByText('1.-2. luokka')
    fireEvent.click(button)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    const receivedFilterFunction = setFilterFunction.mock.calls[0][0]()
    const localEvents = events.filter(event => receivedFilterFunction(event))
    expect(localEvents).toHaveLength(1)
  })

  it('Filtering by grade deselect all', async () => {
    const filterFunction = () => () => { return true }
    const setFilterFunction = jest.fn()

    const component = render(
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
    )
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let button = await component.findByText('Varhaiskasvatus')
    fireEvent.click(button)
    button = await component.findByText('1.-2. luokka')
    fireEvent.click(button)
    button = await component.findByText('3.-6. luokka')
    fireEvent.click(button)
    button = await component.findByText('7.-9. luokka')
    fireEvent.click(button)
    button = await component.findByText('Toinen aste')
    fireEvent.click(button)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    const receivedFilterFunction = setFilterFunction.mock.calls[4][0]()
    const localEvents = events.filter(event => receivedFilterFunction(event))
    expect(localEvents).toHaveLength(0)
  })

  it('Show none works', async () => {
    const filterFunction = () => () => { return true }
    const setFilterFunction = jest.fn()

    const component = render(
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
    )
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let button = await component.findByText('Poista kaikki')
    fireEvent.click(button)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    let receivedFilterFunction = setFilterFunction.mock.calls[0][0]()
    let localEvents = events.filter(event => receivedFilterFunction(event))
    expect(localEvents).toHaveLength(0)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    button = await component.findByText('Näytä kaikki')
    fireEvent.click(button)
    await waitFor(() => new Promise((res) => setTimeout(res, 0)))
    receivedFilterFunction = setFilterFunction.mock.calls[1][0]()
    localEvents = events.filter(event => receivedFilterFunction(event))
    expect(localEvents).toHaveLength(2)
  })
})