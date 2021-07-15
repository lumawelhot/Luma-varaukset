import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { ModifyEvent } from '.'
import React from 'react'

const testEvent = {
  booked: undefined,
  desc: 'Hauska kuvaus',
  duration: 30,
  end: 'Thu Jul 15 2021 14:00:00 GMT+0300 (Eastern European Summer Time)',
  eventEnd: 'Thu Jul 15 2021 14:00:00 GMT+0300 (Eastern European Summer Time)',
  eventStart: 'Thu Jul 15 2021 09:00:00 GMT+0300 (Eastern European Summer Time)',
  extras: [],
  grades: [1, 2],
  id: '60eef65c2c93e42db00ff6fc',
  inPersonVisit: true,
  invalidTimeSlot: undefined,
  otherRemotePlatformOption: null,
  remotePlatforms: [],
  remoteVisit: false,
  resourceids: [3],
  start: 'Thu Jul 15 2021 09:00:00 GMT+0300 (Eastern European Summer Time)',
  tags: [{ __typename: 'Tag', id: '60eef65c2c93e42db00ff6f6', name: 'Maantiede' }],
  title: 'Scratch-ohjelmointikieli'
}

test('Form renders correctly', async () => {
  const { container } = render(
    <MockedProvider>
      <ModifyEvent event={testEvent} />
    </MockedProvider>
  )
  await waitFor(() => new Promise((res) => setTimeout(res, 0)))
  const { innerHTML } = container
  expect(innerHTML).toContain('Scratch-ohjelmointikieli')
  expect(innerHTML).toContain('Hauska kuvaus')
  expect(innerHTML).toContain('Maantiede')
  expect(innerHTML).toContain('14:00')
  expect(innerHTML).toContain('09:00')
  expect(innerHTML).toContain('<label><input type="checkbox" name="scienceClass"> FOTONI</label>')
  expect(innerHTML).toContain('<label><input type="checkbox" name="scienceClass" checked=""> LINKKI</label>')
  expect(innerHTML).not.toContain('Zoom')
  expect(innerHTML).not.toContain('Valitse vierailulle sopivat lisäpalvelut')
})