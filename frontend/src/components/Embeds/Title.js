import React from 'react'
import styled from 'styled-components'

const Title = styled.div`
  line-height: 1.5715;
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  touch-action: manipulation;
  color: #363636;
  display: block;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: .5em;
  margin-top: .5em;
`

export const Error = styled(Title)`
  color: red;
  margin-top: -2px;
  font-size: 15px;
  font-weight: 100;
`

export const required = (text) => <span>{text} <span style={{ color: 'red' }}>*</span></span>

export default Title
