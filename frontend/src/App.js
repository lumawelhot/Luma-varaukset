import React, { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './components/Modals/Login'
import './App.css'
import LumaCalendar from './components/LumaCalendar'
import { Container } from 'react-bootstrap'
import { FcKey } from 'react-icons/fc'
import Menu from './components/Menu'
import EventList from './components/Pages/EventList'
import GroupList from './components/Pages/GroupList'
import UserList from './components/Pages/UserList'
import VisitList from './components/Pages/VisitList'
import { default as VisitPage } from './components/Pages/Visit'
import Visit from './components/Modals/Visit'
import Configs from './components/Pages/Configs'
import ExtraList from './components/Pages/ExtraList'
import { useTranslation } from 'react-i18next'
import { Button } from './components/Embeds/Button'
import Event from './components/Modals/Event'
import { eventInitWithValues } from './helpers/initialvalues'
import { useNavigate } from 'react-router-dom'
import FormList from './components/Pages/FormList'
import Root from './Root'
import { useEvents, useUser } from './hooks/api'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showEvent, setShowEvent] = useState(false)
  const { current: user } = useUser()
  const { current: event, enable, disable } = useEvents()
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <Login show={showLogin} close={() => setShowLogin(false)} />
      <Event
        show={showEvent}
        close={() => setShowEvent(false)}
        modify
        initialValues={event ? eventInitWithValues({
          ...event,
          eventStart: new Date(event.start),
          eventEnd: new Date(event.end)
        }) : undefined}
      />
      <Menu />
      <Container style={{ marginTop: 30 }}>
        {user && window.location.href.includes('/visits') && <VisitList />}
        <Routes>
          <Route path='/' element={<LumaCalendar />} />
          <Route path='/:id' element={<>
            <VisitPage />
            <LumaCalendar />
          </>} />
          <Route path='/visits' element={!user && <Root />} />
          <Route path='/visits/:id' element={<>
            {user ? <VisitPage /> : <Navigate to={window.location.href.split('/visits')[1]} />}
          </>}/>
          <Route path='/users' element={user?.isAdmin ? <UserList /> : <Root />} />
          <Route path="/events" element={user ? <EventList /> : <Root />} />
          <Route path="/groups" element={user ? <GroupList /> : <Root />} />
          <Route path="/configs" element={user ? <Configs></Configs> : <Root />} />
          <Route path="/configs/:page" element={user ? <Configs /> : <Root />} />
          <Route path="/extras" element={user ? <ExtraList /> : <Root />} />
          <Route path="/forms" element={user ? <FormList /> : <Root />} />
          <Route path="/visit" element={<>
            <Visit>
              {user && !event?.disabled && !event?.booked &&
                <>
                  <Button onClick={() => disable(event.id)}>{t('disable')}</Button>
                  <Button onClick={() => {
                    setShowEvent(true)
                    navigate('/')
                  }}>{t('modify-event')}</Button>
                </>
              }
              {user && event?.disabled &&
                <Button onClick={() => enable(event.id)}>{t('enable')}</Button>
              }
            </Visit>
            <LumaCalendar />
          </>} />
        </Routes>
        {!user &&
          <FcKey className='login-icon' onClick={() => setShowLogin(true)} />
        }
      </Container>
    </>
  )
}

export default App