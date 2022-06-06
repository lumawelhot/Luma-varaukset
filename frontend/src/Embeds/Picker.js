import React from 'react'
import { default as UPicker } from 'react-datepicker'
import Title from './Title'
import styled from 'styled-components'
import { getDay } from 'date-fns'


const Picker = styled(UPicker)`
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'tnum', "tnum";
  box-sizing: border-box;
  margin: 0;
  font-family: inherit;
  overflow: visible;
  -webkit-appearance: none;
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
    outline: 2px solid lightblue !important;
  }
`

export const TimePicker = rest => {
  return <div>
    <Title>{rest.title}</Title>
    <Picker
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
}

export const DatePicker = rest => {
  return <div>
    <Title>{rest.title}</Title>
    <Picker
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
}