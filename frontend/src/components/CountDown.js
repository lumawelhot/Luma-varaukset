import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toasts from './Toasts'

const CountDown = () => {
  const { t } = useTranslation('common')
  const [minutes, setMinutes] = useState(2)
  const [seconds, setSeconds] = useState(10)

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds <= 0 && minutes > 0) {
        setSeconds(59)
        setMinutes(minutes - 1)
      } else if (seconds > 0) {
        setSeconds(seconds - 1)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [seconds, setSeconds, minutes, setMinutes])

  const toasts = !(minutes === 0 && seconds === 0) ? [{
    message: `${t('time-left')} - ${minutes}:${seconds.toString().length > 1 ? '' : '0'}${seconds}`,
    type: `${
      minutes > 2 ? 'success'
        : minutes === 2 && seconds > 0 ? 'success'
          : minutes > 0 || seconds > 30 ? 'warning'
            : 'danger'
    }`
  }] : [{
    message: t('timeout-message'),
    type: 'danger'
  }]

  return (
    <Toasts toasts={toasts} />
  )
}

export default CountDown