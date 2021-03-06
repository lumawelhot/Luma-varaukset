import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MenuButton } from '../Embeds/Button'
import { UserContext } from '../services/contexts'
import { useEvict } from '../hooks/contexts'
import { Container } from 'react-bootstrap'
import Event from './Modals/Event'
import Banner from '../Embeds/Banner'

const Menu = () => {
  const { current: user } = useContext(UserContext)
  const [showEvent, setShowEvent] = useState()
  const [showBanner, setShowBanner] = useState(localStorage.getItem('hide-banner') !== 'false')
  const { evict } = useEvict()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('app-token')
    evict()
  }

  if (!user) return <div style={{ marginBottom: 40 }}>
    <Banner show={showBanner} />
    <MenuButton
      onClick={() => {
        localStorage.setItem('hide-banner', String(!showBanner))
        setShowBanner(!showBanner)
      }}
      style={{ borderColor: 'white', float: 'right' }}
    >{showBanner ? t('hide') : t('show')}</MenuButton>
  </div>

  return (
    <div style={{ marginBottom: 40, backgroundColor: '#0479a5' }}>
      <Banner show={showBanner} />
      <hr></hr>
      <Container>
        <div style={{ marginRight: -20, marginLeft: -20, position: 'relative' }}>
          <MenuButton className='active' onClick={() => navigate('/')}>{t('calendar')}</MenuButton>
          <MenuButton className='active' onClick={() => navigate('/events')}>{t('event-list')}</MenuButton>
          <MenuButton className='active' onClick={() => navigate('/visits')}>{t('visit-list')}</MenuButton>
          {user.isAdmin && <MenuButton className='active' onClick={() => navigate('/users')}>{t('user-list')}</MenuButton>}
          <MenuButton className='active' onClick={() => navigate('/groups')}>{t('group-list')}</MenuButton>
          <MenuButton className='active' onClick={() => navigate('/extras')}>{t('extra-list')}</MenuButton>
          <MenuButton className='active' onClick={() => navigate('/forms')}>{t('form-list')}</MenuButton>
          <MenuButton className='active' onClick={() => navigate('/configs')}>{t('configurations')}</MenuButton>
          <MenuButton className='active' onClick={() => setShowEvent(true)}>{t('create-event')}</MenuButton>
          <MenuButton className='active' onClick={handleLogout}>{t('log-out')}</MenuButton>
          <MenuButton className='active' onClick={() => {
            localStorage.setItem('hide-banner', String(!showBanner))
            setShowBanner(!showBanner)
          }}>{showBanner ? t('hide') : t('show')}</MenuButton>
        </div>
        <Event show={showEvent} close={() => setShowEvent(false)} />
      </Container>
    </div>
  )
}

export default Menu
