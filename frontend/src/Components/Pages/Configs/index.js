import { Heading } from '@chakra-ui/react'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../Embeds/Button'
import { UserContext, VisitContext } from '../../../services/contexts'
import { useNavigate, useParams } from 'react-router-dom'
import CSV from './CSV'
import Emails from './Emails'

const Configs = () => {
  const { t } = useTranslation()
  const { fetch } = useContext(VisitContext)
  const { current: user } = useContext(UserContext)
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
