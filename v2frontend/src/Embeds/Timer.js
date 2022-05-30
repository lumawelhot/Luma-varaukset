import React from 'react'
import Countdown from 'react-countdown'

const renderer = ({ minutes, seconds, completed }) => {
  if (completed) return <span style={{ color: 'red', fontWeight: 'bold' }}>0:00</span>
  const secString = seconds < 10 ? `0${seconds}` : seconds
  const totalSeconds = 60 * minutes + seconds
  const color = totalSeconds >= 120 ? 'green' : 'red'
  return <span
    style={{ color, fontWeight: 'bold' }}
  >
    {minutes}:{secString}
  </span>
}

const Timer = ({ seconds }) => {

  return (
    <Countdown
      date={Date.now() + 1000 * seconds}
      renderer={renderer}
    />
  )
}

export default Timer
