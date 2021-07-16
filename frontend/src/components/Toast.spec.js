import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import Toast from './Toast'

test('Renders without error with empty props', () => {
  const { container } = render(
    <Toast />
  )
  expect(container.firstChild).toMatchSnapshot()
})

test('Renders without error with type success', () => {
  const { container } = render(
    <Toast toast={{ message: 'Test', type: 'success' }}/>
  )
  expect(container.firstChild).toMatchSnapshot()
})

test('Renders without error with type warning', () => {
  const { container } = render(
    <Toast toast={{ message: 'Test', type: 'warning' }}/>
  )
  expect(container.firstChild).toMatchSnapshot()
})

test('Renders without error with type danger', () => {
  const { container } = render(
    <Toast toast={{ message: 'Test', type: 'danger' }}/>
  )
  expect(container.firstChild).toMatchSnapshot()
})

test('Renders without error with no type', () => {
  const { container } = render(
    <Toast toast={{ message: 'Test' }}/>
  )
  expect(container.firstChild).toMatchSnapshot()
})