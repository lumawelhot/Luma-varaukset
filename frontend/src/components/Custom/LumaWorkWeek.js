import React from 'react'
import startOfWeek from 'date-fns/startOfWeek'
import endOfWeek from 'date-fns/endOfWeek'
import addWeeks from 'date-fns/addWeeks'
import subWeeks from 'date-fns/subWeeks'
import addDays from 'date-fns/addDays'
import subDays from 'date-fns/subDays'
import format from 'date-fns/format'
import { Navigate } from 'react-big-calendar'
import TimeGrid from 'react-big-calendar/lib/TimeGrid'

class LumaWorkWeek extends React.Component {
  render() {
    let { date } = this.props
    let range = LumaWorkWeek.range(date)
    return (
      <TimeGrid {...this.props} range={range} eventOffset={15}/>
    )
  }
}

LumaWorkWeek.range = date => {
  let start = startOfWeek(date, { weekStartsOn: 1 })
  const end = subDays(endOfWeek(date, { weekStartsOn: 1 }), 2)
  let range = []
  while (start < end) {
    range.push(start)
    start = addDays(start, 1)
  }
  return range
}

LumaWorkWeek.navigate = (date, action) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return subWeeks(date, 1)

    case Navigate.NEXT:
      return addWeeks(date, 1)

    default:
      return date
  }
}

LumaWorkWeek.title = date => {
  let start = startOfWeek(date, { weekStartsOn: 1 })
  let end = subDays(endOfWeek(date, { weekStartsOn: 1 }), 2)
  return `Viikko ${format(date, 'w')} (${start.toLocaleDateString()}-${end.toLocaleDateString()})`
}

export default LumaWorkWeek