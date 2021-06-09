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
import Message from './components/Message'
import LumaTagInput from './components/LumaTagInput/LumaTagInput'
import EventPage from './components/EventPage'

const App = () => {
  const history = useHistory()
  const [events, setEvents] = useState([])
  const [message, setMessage] = useState('')
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
    return {
      id: event.id,
      title: event.title,
      resourceId: event.resourceId,
      start: new Date(event.start),
      end: new Date(event.end),
      grades: event.grades,
      booked: event.booked
    }
  }

  useEffect(() => {
    if (result.data) {
      const events = result.data.getEvents.map(event => parseEvent(event))
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

  const updateMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 5000)
  }

  const addEvent = (event) => {
    setEvents(events.concat(parseEvent(event)))
    setShowEventForm(false)
  }

  const showEventFormHandler = (start, end) => {
    setNewEventTimeRange([start,end])
    setShowEventForm(true)
  }

  const closeEventForm = (event) => {
    event.preventDefault()
    setShowEventForm(false)
    history.push('/')
  }

  const handleEventClick = (event) => {
    const selectedEvent = events.find(e => e.id === event.id)
    setClickedEvent(selectedEvent)
    history.push('/event-page')
  }

  const handleBookingButtonClick = () => {
    history.push('/book')
  }

  const [tags, setTags] = useState([])

  if (loading) return <div></div>

  return (
    <div className="App">
      <Message message={message} />
      <Switch>
        <Route path='/event-page'>
          <EventPage handleBookingButtonClick={handleBookingButtonClick} event={clickedEvent} sendMessage={updateMessage}/>
        </Route>
        <Route path='/book'>
          <VisitForm event={clickedEvent} sendMessage={updateMessage}/>
        </Route>
        <Route path='/taginput'>
          <LumaTagInput
            label='Tagit'
            suggestedTags={['Matikka', 'Fysiikka']}
            tags={tags}
            setTags={setTags}/>
        </Route>
        <Route path='/admin'>
          {!currentUser &&
            <LoginForm getUser={getUser} />
          }
          {currentUser &&
            <div>You are already logged in</div>
          }
        </Route>
        <Route path='/event'>
          {currentUser &&
            <EventForm sendMessage={updateMessage} addEvent={addEvent} closeEventForm={closeEventForm}/>
          }
          {!(currentUser && currentUser.isAdmin) && <p>Et ole kirjautunut sisään.</p>}
        </Route>
        <Route path='/users/create'>
          {currentUser && currentUser.isAdmin &&
            <UserForm sendMessage={updateMessage} />
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
        <Route path='/'>
          {!currentUser &&
            <div className="control">
              <button className="button is-link is-light" onClick={login}>Kirjaudu sisään</button>
            </div>
          }
          {currentUser &&
            <div className="control">
              <button className="button is-link is-light" onClick={logout}>Kirjaudu ulos</button>
              <div style={{ position: 'absolute', top: 0, right: 0 }}>
                Olet kirjautunut käyttäjänä: {currentUser.username}
              </div>
            </div>
          }
          {showEventForm &&
          <div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-content">
              <EventForm
                sendMessage={updateMessage}
                addEvent={addEvent}
                newEventTimeRange={newEventTimeRange}
                closeEventForm={closeEventForm}
              />
            </div>
          </div>}
          <MyCalendar events={events} currentUser={currentUser} showNewEventForm={showEventFormHandler} handleEventClick={handleEventClick}/>
          {!currentUser &&
            <FcKey onClick={login} className="admin-button" />
          }
          <UserPage currentUser={currentUser} />
        </Route>
      </Switch>
    </div>
  )
}

export default App