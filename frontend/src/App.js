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
import Message from './components/Message'

const App = () => {
  const history = useHistory()
  const [events, setEvents] = useState([])
  const [message, setMessage] = useState('')
  const client = useApolloClient()
  const result = useQuery(EVENTS)
  const [getUser, { loading, data }] = useLazyQuery(CURRENT_USER, {
    fetchPolicy: 'cache-and-network'
  })

  const [currentUser, setUser] = useState(null)

  useEffect(() => {
    if (result.data) {
      const events = result.data.getEvents.map(event => {
        return {
          title: event.title,
          resourceId: event.resourceId,
          start: new Date(event.start),
          end: new Date(event.end)
        }
      })
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

  const createEvent = (event) => {
    event.preventDefault()
    history.push('/event')
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
    setTimeout(()  => setMessage(''), 5000)
  }

  if (loading) return <div></div>

  return (
    <div className="App">
      <Message message={message} />
      <Switch>
        <Route path='/admin'>
          {!currentUser &&
            <LoginForm getUser={getUser} />
          }
        </Route>
        <Route path='/event'>
          {currentUser && currentUser.isAdmin &&
              <EventForm sendMessage={updateMessage}/>
          }
          {!(currentUser && currentUser.isAdmin) && <p>Et ole kirjautunut sisään.</p>}
        </Route>
        <Route path='/users/create'>
          {currentUser && currentUser.isAdmin &&
            <UserForm sendMessage={updateMessage} />
          }
          {!(currentUser && currentUser.isAdmin) && <p>Et ole kirjautunut sisään.</p>}
        </Route>
        <Route path='/users'>
          {currentUser && currentUser.isAdmin &&
            <UserList />
          }
          {!(currentUser && currentUser.isAdmin) && <p>Et ole kirjautunut sisään.</p>}
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
              <button className="button is-link is-light" onClick={createEvent}>Luo uusi vierailu</button>
            </div>
          }
          <MyCalendar events={events} />
        </Route>
      </Switch>
    </div>
  )
}

export default App