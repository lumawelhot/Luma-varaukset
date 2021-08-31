import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent, screen } from '@testing-library/react'
import VisitItem from './VisitItem'
import '../i18n'

const testItem = {
  event: {
    title: 'Test title'
  },
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  grade: 'Test grade',
  extras: [
    {
      name: 'Extra 1'
    }
  ],
  clientName: 'Test Client',
  clientEmail: 'test@example.com',
  clientPhone: '040-04004000',
  schoolName: 'Test School',
  schoolLocation: 'Test Location',
  dataUseAgreement: true
}

test('Renders without error with empty visit', () => {
  const { container } = render(
    <VisitItem />
  )
  expect(container).toMatchSnapshot()
})

test('Back button works', () => {
  const handler = jest.fn()

  render(
    <VisitItem item={testItem} close={handler}/>
  )
  const closeButtons = screen.getAllByRole('button')
  expect(closeButtons).toHaveLength(2)
  fireEvent.click(closeButtons[0])
  fireEvent.click(closeButtons[1])
  expect(handler).toHaveBeenCalledTimes(2)
})