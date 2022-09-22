import { Heading } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../Embeds/Button'
import { useNavigate, useParams } from 'react-router-dom'
import Emails from './Emails'
import { useEvents, useUsers, useVisits } from '../../../hooks/cache'
import { exec, getCSV } from '../../../helpers/utils'

const Configs = () => {
  const { t } = useTranslation()
  const { all: visits, fetchAll } = useVisits()
  const { all: parsed, findEvent } = useEvents()
  const { current: user } = useUsers()
  const { page } = useParams()
  const navigate = useNavigate()
  const title = page ? page : 'csv'

  useEffect(exec(fetchAll), [])

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
        {title === 'csv' && <Button onClick={() => getCSV(visits, parsed, findEvent)}>{t('get-csv')}</Button>}
        {user?.isAdmin && title === 'emails' && <Emails />}
      </div>
    </>
  )
}

export default Configs
