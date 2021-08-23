import React, { useState, useEffect } from 'react'
import './App.css'
import 'antd/dist/antd.css'
import LoginForm from './components/LoginForm'
import MyCalendar from './MyCalendar'
import { Switch, Route, useHistory } from 'react-router-dom'
import { EVENTS, EVENTS_DELETED, EVENT_STATUS, LOCK_EVENT, TAGS } from './graphql/queries'
import { useApolloClient, useLazyQuery, useMutation, useQuery, useSubscription } from '@apollo/client'
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
import EventList from './components/EventList'
import EmailConfig from './components/EmailConfig'
import { FaLock, FaEyeSlash } from 'react-icons/fa'
import GroupList from './components/GroupList'

const App = () => {
  const { t } = useTranslation('common')
  const history = useHistory()
  const allTags = useQuery(TAGS)
  const [currentDate, setCurrentDate] = useState(null)
  const [currentView, setCurrentView] = useState('work_week')
  const [events, setEvents] = useState([])
  const [tags, setTags] = useState([])
  const client = useApolloClient()
  const result = useQuery(EVENTS)
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEventTimeRange, setNewEventTimeRange] = useState(undefined)
  const [showFull, setShowFull] = useState(false)
  const [getUser, { loading, data }] = useLazyQuery(CURRENT_USER, {
    fetchPolicy: 'cache-and-network'
  })
  const [sessionToken, setSessionToken] = useState(null)

  const [lockEvent] = useMutation(LOCK_EVENT, {
    onCompleted: ({ lockEvent }) => {
      history.push('/book')
      setSessionToken(lockEvent.token)
    },
    onError: (error) => console.log(error)
  })

  useSubscription(EVENT_STATUS, {
    refetchQueries: EVENTS,
    onSubscriptionData: () => result.refetch(),
    onError: (error) => console.log(error)
  })

  useSubscription(EVENTS_DELETED, {
    refetchQueries: EVENTS,
    onSubscriptionData: () => result.refetch(),
    onError: (error) => console.log(error)
  })

  const [clickedEvent, setClickedEvent] = useState(null)

  const [currentUser, setUser] = useState(null)

  useEffect(() => { result.refetch() }, [currentUser])

  const parseEvent = (event) => {
    const sortedVisitTimes = event.visits.slice().sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    let invalidTimeSlot
    if (sortedVisitTimes.length) {
      invalidTimeSlot = {
        start: new Date(sortedVisitTimes[0].startTime),
        end: new Date(sortedVisitTimes[sortedVisitTimes.length - 1].endTime)
      }
    }

    const createTitle = () => {
      const unAvailable = <>
        <label style={{ color: 'black', margin: 5 }}>
          <FaEyeSlash />
        </label>
        {event.title}
      </>

      if (event.group && event.group.disabled) return unAvailable
      if (event.publishDate) {
        const publish = new Date(event.publishDate)
        if (new Date() < publish) {
          return unAvailable
        }
      }
      return (
        <>
          {!event.booked && event.locked &&
            <label style={{ color: `${event.resourceids.includes(1) ? 'yellow' : 'red'}`, margin: 5 }}>
              <FaLock />
            </label>
          }
          {event.title}
        </>
      )
    }

    const details = {
      id: event.id,
      titleText: event.title,
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
      customForm: event.customForm,
      waitingTime: event.waitingTime,
      hasVisits: event.visits.length ? true : false,
      locked: event.locked,
    }
    delete details.availableTimes
    delete details.visits
    let events = event.availableTimes.map(timeSlot => Object({
      ...details,
      title: createTitle(),
      start: new Date(timeSlot.startTime),
      end: new Date(timeSlot.endTime),
      booked: event.booked,
      disabled: event.disabled,
      group: event.group
    }))
    events = events.concat(event.visits.map(visit => Object({
      ...details,
      title: event.title,
      start: new Date(visit.startTime),
      end: new Date(visit.endTime),
      booked: true,
      disabled: false,
      group: null
    })))

    return events
  }

  useEffect(() => {
    if (result.data && allTags.data) {
      setTags([])
      const events = result.data.getEvents.map(event => parseEvent(event)).flat() // Lisätty flat(), mikäli parseEvent palauttaa taulukon
      const tags = []
      allTags.data.getTags.forEach(tag => tags[tag.name] = 0)
      events.forEach(event => {
        event.tags.forEach(tag => {
          if (!tags[tag.name]) {
            tags[tag.name] = 1
          } else tags[tag.name] += 1
        })
      })
      const tagList = []
      for (let key in tags) tagList.push({
        name: key,
        count: tags[key]
      })
      setTags(tagList)
      setEvents(events)
    }
  }, [result, allTags])

  useEffect(() => {
    if (clickedEvent) {
      const event = events.find(e => e.id === clickedEvent.id)
      if (event) setClickedEvent(event)
    }
  }, [events])

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
    lockEvent({
      variables: {
        event: clickedEvent.id
      }
    })
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
      {!toasts.length && <div id="timer"></div>}
      <Banner/>
      <Toasts toasts={toasts} />
      <Switch>
        <Route path='/email-config'>
          {currentUser && currentUser.isAdmin &&
            <EmailConfig sendMessage={notify} />
          }
        </Route>
        <Route path='/event-page'>
          <EventPage
            currentUser={currentUser}
            handleBookingButtonClick={handleBookingButtonClick}
            event={clickedEvent}
            setEvent={setClickedEvent}
            sendMessage={notify}
            tags={tags}
          />
        </Route>
        <Route path='/group-list'>
          {currentUser &&
            <GroupList sendMessage={notify} />
          }
        </Route>
        <Route path='/book'>
          <VisitForm currentUser={currentUser} event={clickedEvent} sendMessage={notify} token={sessionToken} />
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
            <EventForm sendMessage={notify} addEvent={addEvent} closeEventForm={closeEventForm} tags={tags} />
          }
          {!(currentUser && currentUser.isAdmin) && <p>{t('not-logged-in')}</p>}
        </Route>
        <Route path='/events'>
          {currentUser && result.data &&
            <EventList events={result.data.getEvents} sendMessage={notify} currentUser={currentUser} />
          }
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
                tags={tags}
              />
            </div>
          }
          <MyCalendar
            sendMessage={notify}
            events={events}
            currentUser={currentUser}
            showNewEventForm={showEventFormHandler}
            handleEventClick={handleEventClick}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            currentView={currentView}
            setCurrentView={setCurrentView}
            addEvent={addEvent}
            tags={tags}
            showFull={showFull}
            setShowFull={setShowFull}
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