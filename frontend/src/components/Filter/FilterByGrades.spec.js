import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent, waitFor } from '@testing-library/react'
import FilterByGrades from './FilterByGrades'

test('Checkboxes working', async () => {
  const grades = []
  const setGrades = jest.fn()

  const component = render(
    <FilterByGrades
      grades={grades}
      setGrades={(grades) => setGrades(grades)}
    />
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0)))
  let checkbox = await component.findByLabelText('Toinen aste')
  fireEvent.click(checkbox)
  checkbox = await component.findByLabelText('1.-2. luokka')
  fireEvent.click(checkbox)
  checkbox = await component.findByLabelText('3.-6. luokka')
  fireEvent.click(checkbox)
  checkbox = await component.findByLabelText('7.-9. luokka')
  fireEvent.click(checkbox)
  checkbox = await component.findByLabelText('Varhaiskasvatus')
  fireEvent.click(checkbox)
  expect(setGrades.mock.calls).toHaveLength(5)
})

test('Checkboxes working with initial values', async () => {
  const grades = [1,2]
  const setGrades = jest.fn()

  const component = render(
    <FilterByGrades
      grades={grades}
      setGrades={(grades) => setGrades(grades)}
    />
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0)))
  let checkbox = await component.findByLabelText('Toinen aste')
  fireEvent.click(checkbox)
  checkbox = await component.findByLabelText('1.-2. luokka')
  fireEvent.click(checkbox)
  checkbox = await component.findByLabelText('3.-6. luokka')
  fireEvent.click(checkbox)
  checkbox = await component.findByLabelText('7.-9. luokka')
  fireEvent.click(checkbox)
  checkbox = await component.findByLabelText('Varhaiskasvatus')
  fireEvent.click(checkbox)
  expect(setGrades.mock.calls).toHaveLength(5)
})