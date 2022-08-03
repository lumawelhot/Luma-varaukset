const { set } = require('date-fns')

const dateByHours = (hours) => {
  return set(new Date(), { hours, minutes: 0, seconds: 0, milliseconds: 0 })
}

module.exports = {
  dateByHours
}