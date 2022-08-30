import styled from 'styled-components'
import { useClipboard } from '@chakra-ui/react'
import React from 'react'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'
import Countdown from 'react-countdown'
import PropTypes from 'prop-types'

export const Badge = styled.span`
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  font-size: .75rem;
  height: 2em;
  justify-content: center;
  line-height: 1.5;
  padding-left: .75em;
  padding-right: .75em;
  white-space: nowrap;
  margin-bottom: .5rem;
  background-color: #0479a5;
  color: #fff;
  margin-right: .5rem;
  font-size: 14px;
`

export const Clipboard = ({ text, content, style }) => {
  const { hasCopied, onCopy } = useClipboard(content)
  return <div style={{ ...style }}>
    <span style={{ marginRight: 5 }}>{text}</span>
    {hasCopied
      ? <CheckIcon style={{ color: '#31bd48' }} w={4} h={4} />
      : <CopyIcon onClick={onCopy} style={{ cursor: 'pointer', color: '#1890ff' }} w={4} h={4} />}
  </div>
}

export const Timer = ({ seconds }) => <Countdown
  date={Date.now() + (1000 * seconds)}
  renderer={({ minutes, seconds, completed }) => {
    if (completed) {
      return <span style={{ color: 'red', fontWeight: 'bold' }}>0:00</span>
    }
    const secString = seconds < 10 ? `0${seconds}` : seconds
    const totalSeconds = (60 * minutes) + seconds
    const color = totalSeconds >= 120 ? 'green' : 'red'
    return <span style={{ color, fontWeight: 'bold' }}>
      {minutes}:{secString}
    </span>
  }}
/>

Clipboard.propTypes = {
  text: PropTypes.string,
  content: PropTypes.node,
  style: PropTypes.object
}

Timer.propTypes = {
  seconds: PropTypes.number.isRequired
}
