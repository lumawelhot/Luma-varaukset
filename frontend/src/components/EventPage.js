import React from 'react'
import moment from 'moment'
import { useHistory } from 'react-router'
import { useMutation } from '@apollo/client'
import { DELETE_EVENT, EVENTS } from '../graphql/queries'

const EventPage = ({ event, handleBookingButtonClick, currentUser, sendMessage }) => {
  const history = useHistory()

  const [deleteEvent, result] = useMutation(DELETE_EVENT, {
    refetchQueries: [{ query: EVENTS }],
    onError: (error) => {
      console.log('virheviesti: ', error, result)
    }
  })

  if (!event) {
    history.push('/')
  }

  const classes = [
    { value: 1, label: 'SUMMAMUTIKKA' },
    { value: 2, label: 'FOTONI' },
    { value: 3, label: 'LINKKI' },
    { value: 4, label: 'GEOPISTE' },
    { value: 5, label: 'GADOLIN' }
  ]

  const filterEventClass = (eventClasses) => {
    const classesArray = eventClasses.map(c => classes[c-1].label)
    return classesArray.join(', ')
  }

  const handleRemoveEventClick = () => {
    if (confirm('Haluatko varmasti poistaa tapahtuman?')) {
      deleteEvent({
        variables: {
          id: event.id
        }
      })
        .then(() => {
          sendMessage('Tapahtuma poistettu.', 'success')
          history.push('/')
        })
        .catch(() => sendMessage('Palvelinvirhe', 'danger'))
    }
  }

  const filterEventGrades = (eventGrades) => {
    const returnArray = []
    eventGrades.forEach(availableGrade => {
      grades.forEach(grade => {
        if (availableGrade === grade.value) {
          returnArray.push({ value: grade.value, label: grade.label })
        }
      })
    })
    return returnArray
  }

  const grades = [
    { value: 1, label: 'Varhaiskasvatus' },
    { value: 2, label: '1.-2. luokka' },
    { value: 3, label: '3.-6. luokka' },
    { value: 4, label: '7.-9 luokka' },
    { value: 5, label: 'toinen aste' }
  ]

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  if (event) {
    const eventClass = filterEventClass(event.resourceids)
    const eventGrades = filterEventGrades(event.grades)

    const startsAfter14Days = moment(event.start).diff(new Date(), 'days') >= 14
    const startsWithin1Hour = moment(event.start).diff(new Date(), 'hours') > 0

    return (
      <div className="container">
        <div className="columns is-centered">
          <div className="section">
            <div className="title">{event.title}</div>
            <div>
              <p>Kuvaus: [Tähän tapahtuman kuvaus]</p>
              <p>Tiedeluokka: {eventClass}</p>
              <p>Valittavissa olevat lisäpalvelut: [Tähän ekstrat]</p>
              <div>Tarjolla seuraaville luokka-asteille: {eventGrades.map(g =>
                <div key={g.value}>{g.label}</div>)}
              </div>
              <div>Tapahtuma tarjolla:
                {event.inPersonVisit ? <p>Lähiopetuksena</p> : <></>}
                {event.remoteVisit ? <p>Etäopetuksena</p> : <></>}
              </div>
              <p>Tapahtuma alkaa: {moment(event.start).format('DD.MM.YYYY, HH:mm')}</p>
              <p>Tapahtuma päättyy: {moment(event.end).format('DD.MM.YYYY, HH:mm')}</p>
              <div className="field is-grouped">
                {event.booked || (currentUser && !startsWithin1Hour) || (!currentUser && !startsAfter14Days)
                  ? <p><b>Valitettavasti tämä tapahtuma ei ole varattavissa.</b></p>
                  : <button id="booking-button" className="button luma primary" onClick={() => handleBookingButtonClick()}>Varaa tapahtuma</button>}
                {currentUser &&
                <div className="control">
                  <button className="button luma" onClick={() => handleRemoveEventClick()}>Poista tapahtuma</button>
                </div>
                }
                <div className="control">
                  <button className="button luma" onClick={cancel}>Poistu</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div>Tapahtumaa haetaan...</div>
  )
}

export default EventPage