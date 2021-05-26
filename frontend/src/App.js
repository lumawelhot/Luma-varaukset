import React, { useState, useEffect } from 'react'
import './App.css'
import MyCalendar from './MyCalendar'
import apiService from './services/apiService'

const App = () => {
  const [events, setEvents] = useState([])


  useEffect(() => {
    apiService.getEvents().then(data => setEvents(data))
  }, [])

  return (
    <div className="App">
      <MyCalendar events={events}/>
    </div>
  )
}

// MUN FEATURE

export default App