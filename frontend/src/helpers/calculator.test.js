import { split, findRange, sort, diff } from './calculator'

it('Sort', () => {
  const result = sort([[9, 10], [6, 8], [0, 1], [3, 5]])
  expect(result).toEqual([[0, 1], [3, 5], [6, 8], [9, 10]])
})

describe('Find range', () => {

  it('range is valid', () => {
    const result = findRange([[0, 1], [3, 5], [6, 10]], [6, 7])
    expect(result).toEqual([6, 10])
  })

  it('range overflow right', () => {
    const result = findRange([[0, 1], [3, 5], [6, 10]], [5, 6])
    expect(result).toBeUndefined()
  })

  it('range overflow left', () => {
    const result = findRange([[0, 1], [3, 5], [6, 10]], [2, 5])
    expect(result).toBeUndefined()
  })

})

describe('Split', () => {

  it('slot empty', () => {
    const result = split([], [0, 2], 1)
    expect(result).toEqual([])
  })

  it('slot in the beginning', () => {
    const result = split([[0, 10]], [0, 2], 1)
    expect(result).toEqual([[3, 10]])
  })

  it('slot in the end', () => {
    const result = split([[0, 10]], [8, 10], 1)
    expect(result).toEqual([[0, 7]])
  })

  it('slot in the middle', () => {
    const result = split([[0, 10]], [4, 6], 1)
    expect(result).toEqual([[0, 3], [7, 10]])
  })

  it('slot in the beginning, multi range', () => {
    const result = split([[0, 7], [8, 15]], [0, 2], 1)
    expect(result).toEqual([[3, 7], [8, 15]])
  })

  it('slot in the end, multi range', () => {
    const result = split([[0, 7], [8, 15]], [5, 7], 1)
    expect(result).toEqual([[0, 4], [8, 15]])
  })

  it('slot in the middle, multi range', () => {
    const result = split([[0, 7], [8, 15]], [3, 4], 1)
    expect(result).toEqual([[0, 2], [5, 7], [8, 15]])
  })

  it('invalid slot multi range', () => {
    const result = split([[0, 7], [8, 15]], [6, 8], 1)
    expect(result).toEqual([[0, 7], [8, 15]])
  })

  it('invalid slot in the beginning', () => {
    const result = split([[5, 10]], [4, 6], 1)
    expect(result).toEqual([[5, 10]])
  })

  it('invalid slot in the end', () => {
    const result = split([[0, 5]], [4, 6], 1)
    expect(result).toEqual([[0, 5]])
  })

})

describe('Difference', () => {

  it('slot empty', () => {
    const result = diff([], [0, 10], 1)
    expect(result).toEqual([[0, 10]])
  })

  it('slot in the beginning', () => {
    const result = diff([[1, 3]], [0, 10], 1)
    expect(result).toEqual([[4, 10]])
  })

  it('slot in the end', () => {
    const result = diff([[7, 9]], [0, 10], 1)
    expect(result).toEqual([[0, 6]])
  })

  it('slot in the middle', () => {
    const result = diff([[4, 6]], [0, 10], 1)
    expect(result).toEqual([[0, 3], [7, 10]])
  })

  it('slot multi', () => {
    const result = diff([[4, 5], [8, 9], [11,14]], [0, 20], 1)
    expect(result).toEqual([[0, 3], [6, 7], [15, 20]])
  })

  it('slot full', () => {
    const result = diff([[0, 10]], [0, 10], 1)
    expect(result).toEqual([])
  })

})
