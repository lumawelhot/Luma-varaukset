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
        <Routes>
          <Route path='/' element={<LumaCalendar />} />
          <Route path='/:id' element={<>
            <VisitPage />
            <LumaCalendar />
          </>} />
          <Route path='/visits' element={user ? <VisitList /> : <Navigate to='/' />} />
          <Route path='/visits/:id' element={<>
            {user ? <>
              <VisitList />
              <VisitPage />
            </> : <Navigate to={window.location.href.split('/visits')[1]} />}
          </>}/>
          <Route path='/users' element={user ? <UserList /> : <></>} />
          <Route path="/events" element={user ? <EventList /> : <></>} />
          <Route path="/groups" element={user ? <GroupList /> : <></>} />
          <Route path="/configs" element={user ? <Configs /> : <></>} />
          <Route path="/extras" element={user ? <ExtraList /> : <></>} />
          <Route path="/forms" element={user ? <FormList /> : <></>} />
          <Route path="/visit" element={<>
            <Visit event={event}>
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