import React, { useState, useEffect } from 'react'
import './App.css'
import MyCalendar from './MyCalendar'
import apiService from './services/apiService'
/*
** GRAPHQL CLIENT
** Remove comments when ready to implement

import {
  useQuery,
  useApolloClient,
  useMutation,
  useSubscription,
} from '@apollo/client'
import { LOGIN } from './graphql/queries'
*/

const App = () => {

  const [events, setEvents] = useState([])
  // GraphQL Client variables
  // const client = useApolloClient()
  // const [token, setToken] = useState(null)
  // END GraphQL Client variables

  useEffect(() => {
    apiService.getEvents().then(data => setEvents(data))
  }, [])

  /* USE TOKEN IF EXISTS
  useEffect(() => {
    const token = localStorage.getItem('libraryapp-token')
    if (token) {
      setToken(token)
    }
  }, [])

  */

  return (
    <div className="App">
      <MyCalendar events={events}/>
    </div>
  )
}

export default App