import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { ModifyEvent } from '.'
import React from 'react'
import { set } from 'date-fns'
import '../../i18n'

const testEvent = {
  booked: undefined,
  desc: 'Hauska kuvaus',
  duration: 30,
  eventStart: set(new Date(), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }),
  eventEnd: set(new Date(), { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 }),
  extras: [],
  grades: [1, 2],
  id: '60eef65c2c93e42db00ff6fc',
  inPersonVisit: true,
  invalidTimeSlot: undefined,
  otherRemotePlatformOption: null,
  remotePlatforms: [],
  remoteVisit: false,
  resourceids: [3],
  start: set(new Date(), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }),
  end: set(new Date(), { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 }),
  tags: [{ id: '60eef65c2c93e42db00ff6f6', name: 'Maantiede' }],
  titleText: 'Scratch-ohjelmointikieli'
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
  // eslint-disable-next-line no-useless-escape
  expect(innerHTML).toContain('<label><input type=\"checkbox\" name=\"scienceClass\"> FOTONI </label>')
  // eslint-disable-next-line no-useless-escape
  expect(innerHTML).toContain('<label><input type=\"checkbox\" name=\"scienceClass\" checked=\"\"> LINKKI </label>')
  expect(innerHTML).not.toContain('Zoom')
  expect(innerHTML).not.toContain('Valitse vierailulle sopivat lisäpalvelut')
})