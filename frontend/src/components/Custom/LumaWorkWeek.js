import React from 'react'
import moment from 'moment'
import { Navigate } from 'react-big-calendar'
import TimeGrid from 'react-big-calendar/lib/TimeGrid'
//import LumaTimeGrid from './LumaTimeGrid'

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
  let start = moment(date).startOf('week')
  let end = moment(date).endOf('week').subtract(2,'days')
  let range = []
  while (start < end) {
    range.push(start.toDate())
    start.add(1,'day')
  }
  return range
}

LumaWorkWeek.navigate = (date, action) => {
  switch (action) {
  case Navigate.PREVIOUS:
    return moment(date).subtract(1, 'week').toDate()

  case Navigate.NEXT:
    return moment(date).add(1,'week').toDate()

  default:
    return date
  }
}

LumaWorkWeek.title = date => {
  let start = moment(date).startOf('week').toDate()
  let end = moment(date).endOf('week').subtract(2,'days').toDate()
  return `Viikko ${moment(date).format('w')} (${start.toLocaleDateString()}-${end.toLocaleDateString()})`
}

export default LumaWorkWeek