import React from 'react'
import DatePicker from './DatePicker'

const disabledHours = () => {
  return [0,1,2,3,4,5,6,7,17,18,19,20,21,22,23]
}

const TimePicker = React.forwardRef((props, ref) => {
  return <DatePicker
    disabledHours={disabledHours}
    picker="time"
    minuteStep={5}
    mode={undefined}
    format={'HH:mm'}
    inputReadOnly={true}
    ref={ref}
    showNow={false}
    {...props}/>
})

TimePicker.displayName = 'TimePicker'

export default TimePicker