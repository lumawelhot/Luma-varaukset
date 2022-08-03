import { Heading } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../Embeds/Button'
import { useNavigate, useParams } from 'react-router-dom'
import CSV from './CSV'
import Emails from './Emails'
import { useUser, useVisits } from '../../../hooks/api'

const Configs = () => {
  const { t } = useTranslation()
  const { fetch } = useVisits()
  const { current: user } = useUser()
  const { page } = useParams()
  const navigate = useNavigate()
  const title = page ? page : 'csv'

  useEffect(fetch, [])

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('configs')}</Heading>
      <div style={{ marginLeft: -10 }}>
        <Button
          className={title === 'csv' ? 'active' : ''}
          onClick={() => navigate('/configs/')}>{t('csv')}
        </Button>
        {user?.isAdmin && <Button
          className={title === 'emails' ? 'active' : ''}
          onClick={() => navigate('/configs/emails')}>{t('emails')}
        </Button>}
      </div>
      <div style={{ marginLeft: -10, marginTop: 50 }}>
        {title === 'csv' && <CSV />}
        {user?.isAdmin && title === 'emails' && <Emails />}
      </div>
    </>
  )
}

export default Configs
