import React, { useState, useEffect } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import MyCalendar from './MyCalendar'
import { Switch, Route, useHistory } from 'react-router-dom'
import { useApolloClient, useQuery } from '@apollo/client'
import ListUsers from './components/ListUsers'
import { EVENTS } from './graphql/queries'

const App = () => {
  const history = useHistory()
  const [events, setEvents] = useState([])
  const client = useApolloClient()
  const result = useQuery(EVENTS)

  const [token, setToken] = useState(null)

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
    const token = localStorage.getItem('app-token')
    if (token) {
      setToken(token)
    }
  }, [])

  const login = (event) => {
    event.preventDefault()
    history.push('/admin')
  }

  const logout = (event) => {
    event.preventDefault()
    setToken(null)
    localStorage.clear()
    client.resetStore()
    history.push('/')
  }

  return (
    <div className="App">
      <Switch>
        <Route path='/admin'>
          {!token &&
            <LoginForm setToken={setToken} />
          }
        </Route>
        <Route path='/users'>
          {token &&
            <ListUsers />
          }
          {!token && <p>Et ole kirjautunut sisään.</p>}
        </Route>
        <Route path='/'>
          {!token &&
            <div className="control">
              <button className="button is-link is-light" onClick={login}>Kirjaudu sisään</button>
            </div>
          }
          {token &&
            <div className="control">
              <button className="button is-link is-light" onClick={logout}>Kirjaudu ulos</button>
            </div>
          }
          <MyCalendar events={events} />
        </Route>
      </Switch>
    </div>
  )
}

export default App