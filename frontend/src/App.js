import React, { useState, useEffect } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import MyCalendar from './MyCalendar'
import apiService from './services/apiService'
import { Switch, Route, useHistory } from 'react-router-dom'
import { useApolloClient, useLazyQuery } from '@apollo/client'
import UserForm from './components/UserForm'
import { CURRENT_USER } from './graphql/queries'

const App = () => {
  const history = useHistory()
  const [events, setEvents] = useState([])
  const client = useApolloClient()
  const [getUser, { loading, data }] = useLazyQuery(CURRENT_USER, {
    fetchPolicy: 'cache-and-network'
  })

  const [currentUser, setUser] = useState(null)

  useEffect(() => {
    apiService.getEvents().then(data => setEvents(data))
  }, [])

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

  if (loading) return <div></div>

  return (
    <div className="App">
      <Switch>
        <Route path='/admin'>
          {!currentUser &&
            <LoginForm getUser={getUser} />
          }
        </Route>
        <Route path='/users/create'>
          {currentUser && currentUser.isAdmin &&
            <UserForm setUser={setUser} />
          }
        </Route>
        <Route path='/users'>
          <div></div>
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
            </div>
          }
          <MyCalendar events={events} />
        </Route>
      </Switch>
    </div>
  )
}

export default App