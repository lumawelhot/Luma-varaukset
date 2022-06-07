import React, { useContext, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './Components/Modals/Login'
import './App.css'
import LumaCalendar from './Components/LumaCalendar'
import { Container } from 'react-bootstrap'
import { FcKey } from 'react-icons/fc'
import { UserContext, EventContext } from './services/contexts'
import Menu from './Components/Menu'
import EventList from './Components/Pages/EventList'
import GroupList from './Components/Pages/GroupList'
import UserList from './Components/Pages/UserList'
import VisitList from './Components/Pages/VisitList'
import { default as VisitPage } from './Components/Pages/Visit'
import Visit from './Components/Modals/Visit'
import Configs from './Components/Pages/Configs'
import ExtraList from './Components/Pages/ExtraList'
import { useTranslation } from 'react-i18next'
import { Button } from './Embeds/Button'
import Event from './Components/Modals/Event'
import { eventInitWithValues } from './helpers/initialvalues'
import { useNavigate } from 'react-router-dom'
import FormList from './Components/Pages/FormList'
import Root from './Root'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showEvent, setShowEvent] = useState(false)
  const { current: user } = useContext(UserContext)
  const { current: event, enable, disable } = useContext(EventContext)
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