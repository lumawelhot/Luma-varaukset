import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import Toasts from './Toasts'

const testToasts = [
  {
    message: 'Test Toast 1',
  },
  {
    message: 'Test Toast 2',
    type: 'success'
  },
  {
    message: 'Test Toast 2',
    type: 'danger'
  },
  {
    message: 'Test Toast 2',
    type: 'warning'
  }
]

test('Renders without error four toasts', () => {
  const { container } = render(
    <Toasts toasts={testToasts}/>
  )
  expect(container.firstChild).toMatchSnapshot()
})