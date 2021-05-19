import React from 'react'
import { Calendar, Views, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
//import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'moment/locale/fi'
import * as dates from 'react-big-calendar/lib/utils/dates'

const localizer = momentLocalizer(moment)

let allViews = Object.keys(Views).map(k => Views[k])

const resourceMap = [
  { resourceId: 1, resourceTitle: 'Summamutikka' },
  { resourceId: 2, resourceTitle: 'Fotoni' },
  { resourceId: 3, resourceTitle: 'Linkki' },
  { resourceId: 4, resourceTitle: 'Geopiste' },
  { resourceId: 5, resourceTitle: 'Gadolin' },
]

const MyCalendar = ({ events }) => (
  <div>
    <Calendar
      culture='fi'
      localizer={localizer}
      views={allViews}
      showMultiDayTimes
      events={events}
      startAccessor='start'
      endAccessor='end'
      style={{ height: 500 }}
      max={dates.add(dates.endOf(new Date(2021, 7, 1), 'day'), -1, 'hours')}
      resources={resourceMap}
      resourceIdAccessor="resourceId"
      resourceTitleAccessor="resourceTitle"
    />
  </div>
)

export default MyCalendar