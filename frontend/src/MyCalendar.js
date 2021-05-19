import React from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
//import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'moment/locale/fi'
import { messages } from './helpers/calendar-messages-fi'

const localizer = momentLocalizer(moment)

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
      messages={messages}
      views={['month','work_week','day','agenda']}
      showMultiDayTimes
      events={events}
      startAccessor='start'
      endAccessor='end'
      style={{ height: 500 }}
      min={moment('8:00am', 'h:mma').toDate()}
      max={moment('5:00pm', 'h:mma').toDate()}
      resources={resourceMap}
      resourceIdAccessor="resourceId"
      resourceTitleAccessor="resourceTitle"
    />
  </div>
)

export default MyCalendar