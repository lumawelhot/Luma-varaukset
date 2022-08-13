/* eslint-disable react/display-name */
import React from 'react'
import { default as UPicker } from 'react-datepicker'
import Title from './Title'
import styled from 'styled-components'
import { getDay } from 'date-fns'


const Picker = styled(UPicker)`
  box-sizing: border-box;
  margin: 0;
  font-family: inherit;
  overflow: visible;
  align-items: center;
  border: 1px solid transparent;
  display: inline-flex;
  font-size: 1rem;
  height: 2.5em;
  justify-content: flex-start;
  line-height: 1.5;
  padding-bottom: calc(.5em - 1px);
  padding-left: calc(.75em - 1px);
  padding-right: calc(.75em - 1px);
  padding-top: calc(.5em - 1px);
  position: relative;
  vertical-align: top;
  background-color: #fff;
  border-color: #dbdbdb;
  border-radius: 4px;
  color: #363636;
  box-shadow: inset 0 .0625em .125em rgba(10,10,10,.05);
  max-width: 100%;
  width: 100%;
  touch-action: manipulation;
  &:focus {
    outline: 1px solid #0479a5 !important;
  }
`

export const TimePicker = React.forwardRef((rest, ref) => {
  return <div>
    <Title>{rest.title}</Title>
    <Picker
      ref={ref}
      selected={rest.value}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={5}
      filterTime={(time) => {
        if (rest.hideHours) {
          const hours = new Date(time).getHours()
          return !rest.hideHours(hours)
        }
        return true
      }}
      timeCaption='Time'
      locale='fi'
      dateFormat='H:mm'
      { ...rest}
    />
  </div>
})

export const DatePicker = React.forwardRef((rest, ref) => {
  return <div>
    <Title>{rest.title}</Title>
    <Picker
      ref={ref}
      isClearable={rest.cleanable}
      filterDate={(date) => {
        const day = getDay(date)
        return day !== 0 && day !== 6
      }}
      dateFormat='P'
      locale='fi'
      cleanable={rest?.cleanable ? true : false}
      { ...rest }
      selected={rest.value}
    />
  </div>
})