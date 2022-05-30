import React from 'react'
import { DatePicker as Picker } from 'rsuite'
import Title from './Title'

export const TimePicker = rest => {
  return <div>
    <Title>{rest.title}</Title>
    <Picker
      placement='auto'
      format="HH:mm"
      ranges={[]}
      cleanable={rest?.cleanable ? true : false}
      { ...rest }
      style={{ width: '100%', ...rest?.style }}
    />
  </div>
}

export const DatePicker = rest => {
  return <div>
    <Title>{rest.title}</Title>
    <Picker
      placement='auto'
      format='dd.MM.yyyy'
      cleanable={rest?.cleanable ? true : false}
      { ...rest }
      style={{ width: '100%', ...rest?.style }}
    />
  </div>
}