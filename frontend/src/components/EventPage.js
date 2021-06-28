import React from 'react'
import differenceInDays from 'date-fns/differenceInDays'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import format from 'date-fns/format'
import { useHistory } from 'react-router'
import { useMutation } from '@apollo/client'
import { DELETE_EVENT, EVENTS } from '../graphql/queries'

const EventPage = ({ event, handleBookingButtonClick, currentUser, sendMessage }) => {
  const history = useHistory()

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    refetchQueries: [{ query: EVENTS }],
    onError: () => {
      sendMessage('Tapahtumaa ei voi poistaa! (Onko tapahtumalla varauksia?)', 'danger')
    },
    onCompleted: () => {
      sendMessage('Tapahtuma poistettu.', 'success')
      history.push('/')
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

    const startsAfter14Days = differenceInDays(event.start, new Date()) >= 14
    const startsAfter1Hour = differenceInMinutes(event.start, new Date()) >= 60
    const description = event.desc ? event.desc : null

    return (
      <div className="container">
        <div className="columns is-centered">
          <div className="section">
            <div className="title">{event.title}</div>
            <div>
              {description
                ? <p>Kuvaus: {description} </p>
                : null}
              <p>Tiedeluokka: {eventClass}</p>
              {event.extras.length
                ? <div>Valittavissa olevat lisäpalvelut: {event.extras.map(extra => <div key={extra.name}>{extra.name}</div>) }</div>
                : null}

              <div>Tarjolla seuraaville luokka-asteille: {eventGrades.map(g =>
                <div key={g.value}>{g.label}</div>)}
              </div>
              <div><strong>Tapahtuma tarjolla: </strong>
                {event.inPersonVisit ? 'Lähiopetuksena' : <></>}
                {event.inPersonVisit && event.remoteVisit && ' ja etäopetuksena'}
                {event.remoteVisit && !event.inPersonVisit? 'Etäopetuksena' : <></>}
              </div>
              <p>Tapahtuma alkaa: {format(event.start, 'd.M.yyyy, HH:mm')}</p>
              <p>Tapahtuma päättyy: {format(event.end, 'd.M.yyyy, HH:mm')}</p>
              <p>Toiminnan kesto: {event.duration} minuuttia</p>
              {event.booked || (currentUser && !startsAfter1Hour) || (!currentUser && !startsAfter14Days) ?
                <p><b>Valitettavasti tämä tapahtuma ei ole varattavissa.</b></p> : null}
              <div className="field is-grouped">
                {event.booked || (currentUser && !startsAfter1Hour) || (!currentUser && !startsAfter14Days)
                  ? null
                  : <button id="booking-button" className="button luma primary" onClick={() => handleBookingButtonClick()}>Varaa tapahtuma</button>}
                {!!currentUser && (
                  <div className="control">
                    <button className="button luma" onClick={() => handleRemoveEventClick()}>Poista tapahtuma</button>
                  </div>)
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