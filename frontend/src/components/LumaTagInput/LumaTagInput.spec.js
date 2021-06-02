import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import LumaTagInput from './LumaTagInput'

const tags = ['Matematiikka', 'Fysiikka', 'Ohjelmointi', 'Maantiede', 'Kemia']

test('Renders content correctly', () => {
  const component = render(
    <LumaTagInput label='LumaTagInput' suggestedTags={tags} prompt='Omaprompti'/>
  )

  expect(component.container).toHaveTextContent(
    'LumaTagInput'
  )
  const input = component.container.querySelector('.input')
  expect(input.placeholder).toBe('Omaprompti')
})

test('Clicking the delete-button calls event handler once', async () => {
  const mockHandler = jest.fn()

  const component = render(
    <LumaTagInput label='LumaTagInput' suggestedTags={tags} tags={['Matikka', 'Fysiikka']} setTags={mockHandler}/>
  )

  const button = component.container.querySelectorAll('.delete.is-small')[0]
  fireEvent.click(button)

  expect(mockHandler.mock.calls).toHaveLength(1)
})

test('Adding new tag calls event handler once', async () => {
  const mockHandler = jest.fn()

  const component = render(
    <LumaTagInput label='LumaTagInput' suggestedTags={tags} tags={['Matikka', 'Fysiikka']} setTags={mockHandler}/>
  )

  const input = component.container.querySelector('.input')

  fireEvent.change(input, {
    target: { value: 'testtag' }
  })

  fireEvent.keyDown(input, { key: ',' } )

  expect(mockHandler.mock.calls).toHaveLength(1)
  expect(input.placeholder).toBe('Lisää tagi')
})