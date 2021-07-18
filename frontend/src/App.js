import React, { useState, useEffect } from 'react'
import './App.css'
import 'antd/dist/antd.css'
import LoginForm from './components/LoginForm'
import MyCalendar from './MyCalendar'
import { Switch, Route, useHistory } from 'react-router-dom'
import { EVENTS } from './graphql/queries'
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client'
import UserForm from './components/UserForm'
import { CURRENT_USER } from './graphql/queries'
import UserList from './components/UserList'
import { EventForm } from './components/EventForm'
import { VisitForm } from './components/VisitForm'
import { FcKey } from 'react-icons/fc'
import Banner from './components/Banner'
import UserPage from './components/UserPage'
import EventPage from './components/EventPage'
import Toasts from './components/Toasts'
import { v4 as uuidv4 } from 'uuid'
import VisitPage from './components/VisitPage'
import VisitList from './components/VisitList'
import ExtrasAdmin from './components/EventExtras/ExtrasAdmin'
import FormList from './components/FormEditor/FormList'
import { useTranslation } from 'react-i18next'

const App = () => {
  const { t } = useTranslation('common')
  const history = useHistory()
  const [currentDate, setCurrentDate] = useState(null)
  const [currentView, setCurrentView] = useState('work_week')
  const [events, setEvents] = useState([])
  const client = useApolloClient()
  const result = useQuery(EVENTS)
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEventTimeRange, setNewEventTimeRange] = useState(undefined)
  const [getUser, { loading, data }] = useLazyQuery(CURRENT_USER, {
    fetchPolicy: 'cache-and-network'
  })
  const [clickedEvent, setClickedEvent] = useState(null)

  const [currentUser, setUser] = useState(null)

  const parseEvent = (event) => {
    const sortedVisitTimes = event.visits.slice().sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    let invalidTimeSlot
    if (sortedVisitTimes.length) {
      invalidTimeSlot = {
        start: new Date(sortedVisitTimes[0].startTime),
        end: new Date(sortedVisitTimes[sortedVisitTimes.length - 1].endTime)
      }
    }

    const details = {
      id: event.id,
      title: event.title,
      resourceids: event.resourceids,
      grades: event.grades,
      inPersonVisit: event.inPersonVisit,
      remoteVisit: event.remoteVisit,
      tags: event.tags,
      extras: event.extras,
      duration: event.duration,
      desc: event.desc,
      remotePlatforms: event.remotePlatforms,
      otherRemotePlatformOption: event.otherRemotePlatformOption,
      eventStart: new Date(event.start),
      eventEnd: new Date(event.end),
      invalidTimeSlot,
      customForm: event.customForm
    }
    delete details.availableTimes
    delete details.visits
    let events = event.availableTimes.map(timeSlot => Object({
      ...details,
      start: new Date(timeSlot.startTime),
      end: new Date(timeSlot.endTime),
      booked: event.booked,
    }))
    events = events.concat(event.visits.map(visit => Object({
      ...details,
      start: new Date(visit.startTime),
      end: new Date(visit.endTime),
      booked: true,
    })))

    return events
  }

  useEffect(() => {
    if (result.data) {
      const events = result.data.getEvents.map(event => parseEvent(event)).flat() // Lisätty flat(), mikäli parseEvent palauttaa taulukon
      setEvents(events)
    }
  }, [result])

  useEffect(() => {
    if (localStorage.getItem('app-token')) getUser()
  }, [])

  useEffect(() => {
    if (data) setUser(data.me)
  }, [data])

  const login = (event) => {
    event.preventDefault()
    history.push('/admin')
  }

  const logout = (event) => {
    event.preventDefault()
    setUser(null)
    localStorage.removeItem('app-token')
    client.resetStore()
    history.push('/')
  }

  const addEvent = (event) => {
    setEvents(events.concat(parseEvent(event)))
    setShowEventForm(false)
  }

  const showEventFormHandler = (start, end) => {
    setNewEventTimeRange([start, end])
    setShowEventForm(true)
  }

  const closeEventForm = (event) => {
    event.preventDefault()
    setNewEventTimeRange(undefined)
    setShowEventForm(false)
    history.push('/')
  }

  const handleEventClick = (event) => {
    //const selectedEvent = events.find(e => e.id === event.id)
    setClickedEvent(event) // <- event tulee suoraan klikatusta, ei tarvitse hakea eventseistä
    history.push('/event-page')
  }

  const handleBookingButtonClick = () => {
    history.push('/book')
  }

  const [toasts, setToasts] = useState([])

  const notify = (message, type) => {
    const toastID = uuidv4()
    const newToasts = toasts.concat({ id: toastID, message, type })
    setToasts(newToasts)
  }

  useEffect(() => {
    if (toasts.length) {
      const timeoutID = setTimeout(() => {
        const toastID = toasts.pop().id
        const filteredToasts = toasts.filter(t => t.id !== toastID)
        setToasts(filteredToasts)
      }, toasts.length > 2 ? 1000 : 4000)

      return () => clearTimeout(timeoutID)
    }
  }, [toasts])

  if (loading) return <div></div>

  return (
    <div className="App container">
      <Banner/>
      <Toasts toasts={toasts} />
      <Switch>

        <Route path='/event-page'>
          <EventPage
            currentUser={currentUser}
            handleBookingButtonClick={handleBookingButtonClick}
            event={clickedEvent}
            setEvent={setClickedEvent}
            sendMessage={notify}
          />
        </Route>
        <Route path='/book'>
          <VisitForm currentUser={currentUser} event={clickedEvent} sendMessage={notify} />
        </Route>
        <Route path='/admin'>
          {!currentUser &&
            <LoginForm getUser={getUser} sendMessage={notify} />
          }
          {currentUser &&
            <div>{t('already-logged-in')}</div>
          }
        </Route>
        <Route path='/event'>
          {currentUser &&
            <EventForm sendMessage={notify} addEvent={addEvent} closeEventForm={closeEventForm} />
          }
          {!(currentUser && currentUser.isAdmin) && <p>{t('not-logged-in')}</p>}
        </Route>
        <Route path='/extras'>
          {currentUser &&
            <ExtrasAdmin sendMessage={notify} />
          }
          {!currentUser && <p>{t('not-logged-in')}</p>}
        </Route>
        <Route path='/forms'>
          {currentUser &&
            <FormList sendMessage={notify} />
          }
          {!currentUser && <p>{t('not-logged-in')}</p>}
        </Route>
        <Route path='/users/create'>
          {currentUser && currentUser.isAdmin &&
            <UserForm sendMessage={notify} />
          }
          {!(currentUser && currentUser.isAdmin) &&
            <div>{t('access-denied')}</div>
          }
          {!(currentUser && currentUser.isAdmin) && <p>{t('not-admin')}</p>}
        </Route>
        <Route path='/users'>
          {currentUser && currentUser.isAdmin &&
            <UserList sendMessage={notify} currentUser={currentUser} />
          }
          {!(currentUser && currentUser.isAdmin) && <p>{t('not-admin')}</p>}
        </Route>
        <Route path='/visits'>
          {currentUser &&
            <VisitList notify={notify} />
          }
          {!currentUser && <p>{t('not-logged-in')}</p>}
        </Route>
        <Route path='/:id'>
          <VisitPage sendMessage={notify} />
        </Route>
        <Route path='/'>
          {currentUser &&
            <div className="level">
              <button className="button luma" onClick={logout}>{t('logout')}</button>
              <div className="is-pulled-right">
                {t('logged-in-as')} {currentUser.username}
              </div>
            </div>
          }
          {showEventForm &&
            <div className="modal is-active">
              <div className="modal-background"></div>
              <EventForm
                sendMessage={notify}
                addEvent={addEvent}
                newEventTimeRange={newEventTimeRange}
                closeEventForm={closeEventForm}
              />
            </div>
          }
          <MyCalendar
            events={events}
            currentUser={currentUser}
            showNewEventForm={showEventFormHandler}
            handleEventClick={handleEventClick}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
          <UserPage currentUser={currentUser} setShowEventForm={setShowEventForm} />
          {!currentUser &&
            <span className='icon is-pulled-right'><FcKey onClick={login} className='admin-button' /></span>
          }
        </Route>
      </Switch>
    </div>
  )
}

export default App