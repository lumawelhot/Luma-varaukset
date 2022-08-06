const { assert, expect } = require('chai')
const { split, findRange, sort, diff, slotFromDate, checkTimeslot, parseDate, validTimeSlot, calcTimeSlot } = require('../utils/calculator')

it('Parse date', () => {
  const parsed = parseDate('2022-08-06T13:13:36.780Z')
  expect(parsed).to.equal('2022-08-06T13:13:00.000Z')
})

it('Sort', () => {
  const result = sort([[9, 10], [6, 8], [0, 1], [3, 5]])
  assert.deepEqual(result, [[0, 1], [3, 5], [6, 8], [9, 10]])
})

describe('Find range', () => {

  it('range is valid', () => {
    const result = findRange([[0, 1], [3, 5], [6, 10]], [6, 7])
    assert.deepEqual(result, [6, 10])
  })

  it('range overflow right', () => {
    const result = findRange([[0, 1], [3, 5], [6, 10]], [5, 6])
    assert.strictEqual(result, undefined)
  })

  it('range overflow left', () => {
    const result = findRange([[0, 1], [3, 5], [6, 10]], [2, 5])
    assert.strictEqual(result, undefined)
  })

})

describe('Split', () => {

  it('slot empty', () => {
    const result = split([], [0, 2], 1)
    assert.deepEqual(result, [])
  })

  it('slot in the beginning', () => {
    const result = split([[0, 10]], [0, 2], 1)
    assert.deepEqual(result, [[3, 10]])
  })

  it('slot in the end', () => {
    const result = split([[0, 10]], [8, 10], 1)
    assert.deepEqual(result, [[0, 7]])
  })

  it('slot in the middle', () => {
    const result = split([[0, 10]], [4, 6], 1)
    assert.deepEqual(result, [[0, 3], [7, 10]])
  })

  it('slot in the beginning, multi range', () => {
    const result = split([[0, 7], [8, 15]], [0, 2], 1)
    assert.deepEqual(result, [[3, 7], [8, 15]])
  })

  it('slot in the end, multi range', () => {
    const result = split([[0, 7], [8, 15]], [5, 7], 1)
    assert.deepEqual(result, [[0, 4], [8, 15]])
  })

  it('slot in the middle, multi range', () => {
    const result = split([[0, 7], [8, 15]], [3, 4], 1)
    assert.deepEqual(result, [[0, 2], [5, 7], [8, 15]])
  })

  it('invalid slot multi range', () => {
    const result = split([[0, 7], [8, 15]], [6, 8], 1)
    assert.deepEqual(result, [[0, 7], [8, 15]])
  })

  it('invalid slot in the beginning', () => {
    const result = split([[5, 10]], [4, 6], 1)
    assert.deepEqual(result, [[5, 10]])
  })

  it('invalid slot in the end', () => {
    const result = split([[0, 5]], [4, 6], 1)
    assert.deepEqual(result, [[0, 5]])
  })

})

describe('Difference', () => {

  it('slot empty', () => {
    const result = diff([], [0, 10], 1)
    assert.deepEqual(result, [[0, 10]])
  })

  it('slot in the beginning', () => {
    const result = diff([[1, 3]], [0, 10], 1)
    assert.deepEqual(result, [[4, 10]])
  })

  it('slot in the end', () => {
    const result = diff([[7, 9]], [0, 10], 1)
    assert.deepEqual(result, [[0, 6]])
  })

  it('slot in the middle', () => {
    const result = diff([[4, 6]], [0, 10], 1)
    assert.deepEqual(result, [[0, 3], [7, 10]])
  })

  it('slot multi', () => {
    const result = diff([[4, 5], [8, 9], [11,14]], [0, 20], 1)
    assert.deepEqual(result, [[0, 3], [6, 7], [15, 20]])
  })

  it('slot full', () => {
    const result = diff([[0, 10]], [0, 10], 1)
    assert.deepEqual(result, [])
  })

})

describe('Calculate timeslot', () => {

  it('visit times are an empty array', () => {
    const timeSlot = calcTimeSlot([], '2022-08-06T13:24:29.009Z', '2022-08-06T14:53:29.009Z')
    expect(timeSlot).to.deep.equal({
      start: '2022-08-06T13:24:00.000Z',
      end: '2022-08-06T14:53:00.000Z'
    })
  })

  // TODO: add rest of the tests

})

describe('Valid timeslot', () => {

  it('available time found for a timeslot', () => {
    const availableTimes = [{
      startTime: '2022-08-06T12:30:07.204Z',
      endTime: '2022-08-06T12:55:07.204Z'
    }]
    const start = '2022-08-06T12:31:07.204Z'
    const end = '2022-08-06T12:54:07.204Z'
    expect(validTimeSlot(availableTimes, start, end)).to.be.true
  })

  it('available time not found for a timeslot', () => {
    const availableTimes = [{
      startTime: '2022-08-06T12:32:07.204Z',
      endTime: '2022-08-06T12:55:07.204Z'
    }]
    const start = '2022-08-06T12:31:07.204Z'
    const end = '2022-08-06T12:54:07.204Z'
    expect(validTimeSlot(availableTimes, start, end)).to.be.false
  })

})

describe('Check timeslot', () => {

  it('starting time before ending time', () => {
    const start = '2022-08-06T12:55:07.204Z'
    const end = '2022-08-06T12:55:07.205Z'
    expect(checkTimeslot(start, end)).to.be.false
  })

  it('starting time after ending time', () => {
    const start = '2022-08-06T12:55:07.205Z'
    const end = '2022-08-06T12:55:07.204Z'
    expect(checkTimeslot(start, end)).to.be.true
  })

  it('starting before 5am (8am Helsinki time)', () => {
    const start = '2022-08-06T04:59:07.205Z'
    const end = '2022-08-06T12:55:07.204Z'
    expect(checkTimeslot(start, end)).to.be.true
  })

  it('ending after 2pm (5pm Helsinki time)', () => {
    const start = '2022-08-06T12:55:07.204Z'
    const end = '2022-08-06T17:00:07.205Z'
    expect(checkTimeslot(start, end)).to.be.true
  })

})

describe('Timeslot from date', () => {

  it('returns correct timeslot', () => {
    const date = '2103-05-23T07:23:29.482Z'
    const start = '2023-09-12T10:36:49.482Z'
    const end = '2023-09-13T15:45:13.411Z'
    expect(slotFromDate(date, start, end)).to.deep.equal([
      '2103-05-23T10:36:00.000Z',
      '2103-05-23T15:45:00.000Z'
    ])
  })

})