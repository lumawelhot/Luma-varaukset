import React from 'react'
import { Spinner } from '@chakra-ui/react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button } from '../../Embeds/Button'
import { useNavigate } from 'react-router-dom'

const Status = ({ status, visit }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const toVisitPage = () => {
    navigate(`/${visit.id}`)
  }

  if(status === undefined) return (
    <div style={{ textAlign: 'center' }}>
      <Spinner
        thickness='4px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
      />
    </div>
  )

  if(!status) return (
    <Alert variant='danger'>
      <Alert.Heading>{t('booking-failed-header')}</Alert.Heading>
      <p>{t('booking-failed-text')}</p>
    </Alert>
  )

  return (
    <Alert variant='success'>
      <Alert.Heading>{t('booking-success-header')}</Alert.Heading>
      <p>{t('booking-success-text')}</p>
      <div style={{ marginLeft: -10, marginTop: 20 }}>
        <Button onClick={toVisitPage}>{t('check-booking')}</Button>
      </div>
    </Alert>
  )
}

export default Status
