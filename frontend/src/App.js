import React, { useState, useEffect } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import MyCalendar from './MyCalendar'
import { Switch, Route, useHistory } from 'react-router-dom'
import { EVENTS } from './graphql/queries'
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client'
import UserForm from './components/UserForm'
import { CURRENT_USER } from './graphql/queries'
import UserList from './components/UserList'
import EventForm from './components/EventForm'
import VisitForm from './components/VisitForm'
import { FcKey } from 'react-icons/fc'
import UserPage from './components/UserPage'
import EventPage from './components/EventPage'
import Toasts from './components/Toasts'
import { v4 as uuidv4 } from 'uuid'
import VisitPage from './components/VisitPage'
import VisitList from './components/VisitList'
//mport fromUnixTime from 'date-fns/fromUnixTime'

const App = () => {
  const history = useHistory()
  const [events, setEvents] = useState([])
  const client = useApolloClient()
  const result = useQuery(EVENTS)
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEventTimeRange, setNewEventTimeRange] = useState([])
  const [getUser, { loading, data }] = useLazyQuery(CURRENT_USER, {
    fetchPolicy: 'cache-and-network'
  })
  const [clickedEvent, setClickedEvent] = useState(null)

  const [currentUser, setUser] = useState(null)

  const parseEvent = (event) => {
    //console.log(event.title, event.availableTimes, event.start)
    //console.log(event, '<--------------------------------------------------------------')
    const details = {
      id: event.id,
      title: event.title,
      resourceId: event.resourceId,
      grades: event.grades,
      tags: event.tags,
    }
    let events = event.availableTimes.map(timeSlot => Object({
      start: new Date(timeSlot.startTime),
      end: new Date(timeSlot.endTime),
      booked: false,
      ...details
    }))
    events = events.concat(event.visits.map(visit => Object({
      start: new Date(visit.startTime),
      end: new Date(visit.endTime),
      booked: true,
      ...details
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
      <Toasts toasts={toasts} />
      <Switch>

        <Route path='/event-page'>
          <EventPage handleBookingButtonClick={handleBookingButtonClick} event={clickedEvent} sendMessage={notify} />
        </Route>
        <Route path='/book'>
          <VisitForm event={clickedEvent} sendMessage={notify} />
        </Route>
        <Route path='/admin'>
          {!currentUser &&
            <LoginForm getUser={getUser} sendMessage={notify} />
          }
          {currentUser &&
            <div>You are already logged in</div>
          }
        </Route>
        <Route path='/event'>
          {currentUser &&
            <EventForm sendMessage={notify} addEvent={addEvent} closeEventForm={closeEventForm} />
          }
          {!(currentUser && currentUser.isAdmin) && <p>Et ole kirjautunut sisään.</p>}
        </Route>
        <Route path='/users/create'>
          {currentUser && currentUser.isAdmin &&
            <UserForm sendMessage={notify} />
          }
          {!(currentUser && currentUser.isAdmin) &&
            <div>Access denied</div>
          }
          {!(currentUser && currentUser.isAdmin) && <p>Sinulla ei ole tarvittavia oikeuksia.</p>}
        </Route>
        <Route path='/users'>
          {currentUser && currentUser.isAdmin &&
            <UserList />
          }
          {!(currentUser && currentUser.isAdmin) && <p>Sinulla ei ole tarvittavia oikeuksia.</p>}
        </Route>
        <Route path='/visits'>
          {currentUser &&
            <VisitList notify={notify} />
          }
          {!currentUser && <p>Et ole kirjautunut sisään.</p>}
        </Route>
        <Route path='/:id'>
          <VisitPage sendMessage={notify} />
        </Route>
        <Route path='/'>
          {currentUser &&
            <div className="level">
              <button className="button luma" onClick={logout}>Kirjaudu ulos</button>
              <div className="is-pulled-right">
                Olet kirjautunut käyttäjänä: {currentUser.username}
              </div>
            </div>
          }
          {showEventForm &&
            <div className="modal is-active">
              <div className="modal-background"></div>
              <div className="modal-content">
                <EventForm
                  sendMessage={notify}
                  addEvent={addEvent}
                  newEventTimeRange={newEventTimeRange}
                  closeEventForm={closeEventForm}
                />
              </div>
            </div>}
          <MyCalendar events={events} currentUser={currentUser} showNewEventForm={showEventFormHandler} handleEventClick={handleEventClick} />
          <UserPage currentUser={currentUser} />
          {!currentUser &&
            <span className='icon is-pulled-right'><FcKey onClick={login} className='admin-button' /></span>
          }
        </Route>
      </Switch>
    </div>
  )
}

export default App