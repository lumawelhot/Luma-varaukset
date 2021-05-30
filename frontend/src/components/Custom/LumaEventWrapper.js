import React from 'react'
import clsx from 'clsx'
import * as dates from 'react-big-calendar/lib/utils/dates'
import { resourceColors } from '../../helpers/styles'

const LumaEventWrapper = (props) => {

  const {
    style,
    className,
    event,
    selected,
    isAllDay,
    onSelect,
    onDoubleClick,
    onKeyPress,
    localizer,
    continuesPrior,
    continuesAfter,
    accessors,
    getters,
    components: { event: Event },
    slotStart,
    slotEnd,
  } = props

  console.log(props.components)

  const resourceStyle={ backgroundColor: resourceColors[event.resourceId-1] }

  let title = accessors.title(event)
  let tooltip = accessors.tooltip(event)
  let end = accessors.end(event)
  let start = accessors.start(event)
  let allDay = accessors.allDay(event)

  let showAsAllDay =
    isAllDay || allDay || dates.diff(start, dates.ceil(end, 'day'), 'day') > 1

  const userProps = getters.eventProp(event, start, end, selected)

  const content = (
    <div className="rbc-event-content luma" title={tooltip || undefined}>
      {Event ? (
        <Event
          event={event}
          continuesPrior={continuesPrior}
          continuesAfter={continuesAfter}
          title={title}
          isAllDay={allDay}
          localizer={localizer}
          slotStart={slotStart}
          slotEnd={slotEnd}
        />
      ) : (
        title
      )}
    </div>
  )

  return (
    <div
      tabIndex={0}
      style={{ ...userProps.style,...style, ...resourceStyle }}
      className={clsx('rbc-event luma', className, userProps.className, {
        'rbc-selected': selected,
        'rbc-event-allday': showAsAllDay,
        'rbc-event-continues-prior': continuesPrior,
        'rbc-event-continues-after': continuesAfter,
      })}
      onClick={e => onSelect && onSelect(event, e)}
      onDoubleClick={e => onDoubleClick && onDoubleClick(event, e)}
      onKeyPress={e => onKeyPress && onKeyPress(event, e)}
    >
      {content}
    </div>
  )
}

export default LumaEventWrapper