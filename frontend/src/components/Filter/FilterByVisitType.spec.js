import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent, waitFor } from '@testing-library/react'
import FilterByVisitType from './FilterByVisitType'
import '../../i18n'

test('Checkboxes working', async () => {
  const remote = true
  const inPerson = true
  const setType = jest.fn()

  const component = render(
    <FilterByVisitType
      remote={remote}
      inPerson={inPerson}
      setType={setType}
    />
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0)))
  let checkbox = await component.findByText('Lähiopetus')
  fireEvent.click(checkbox)
  checkbox = await component.findByText('Etäopetus')
  fireEvent.click(checkbox)
  expect(setType.mock.calls).toHaveLength(2)
})