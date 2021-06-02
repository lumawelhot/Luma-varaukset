import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import Tags from './Tags'

const tags = ['Matematiikka', 'Fysiikka', 'Ohjelmointi', 'Maantiede', 'Kemia']

test('renders content', () => {
  const component = render(
    <Tags
      tags={tags}
    />
  )

  expect(component.container).toHaveTextContent(
    'Matematiikka'
  )
  const numberOfTags = component.container.querySelectorAll('span:not(.tag.is-info)')
  expect(numberOfTags).toHaveLength(5)
})

test('clicking the delete-button calls event handler once', async () => {
  const mockHandler = jest.fn()

  const component = render(
    <Tags
      tags={tags}
      removeTag={(index) => mockHandler(index)}
    />
  )

  const button = component.getAllByRole('button')[0]
  fireEvent.click(button)

  expect(mockHandler.mock.calls).toHaveLength(1)
})