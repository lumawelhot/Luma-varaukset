import React from 'react'
import moment from 'moment'
import { useHistory } from 'react-router'

const EventPage = ({ event, handleBookingButtonClick }) => {
  const history = useHistory()
  if (!event) {
    history.push('/')
  }

  const filterEventClass = (eventClass) => {
    switch (eventClass) {
      case 1:
        return 'SUMMAMUTIKKA'
      case 2:
        return 'FOTONI'
      case 3:
        return 'LINKKI'
      case 4:
        return 'GEOPISTE'
      case 5:
        return 'GADOLIN'
      default:
        console.log('Error!')
        break
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
    const eventClass = filterEventClass(event.resourceId)
    const eventGrades = filterEventGrades(event.grades)

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
              <p>Tapahtuma alkaa: {moment(event.start).format('DD.MM.YYYY, HH:mm')}</p>
              <p>Tapahtuma päättyy: {moment(event.end).format('DD.MM.YYYY, HH:mm')}</p>
              {moment(event.start).diff(moment(new Date()), 'days') < 14
                ? <p><b>Valitettavasti tämä tapahtuma ei ole varattavissa.</b></p>
                : <button id="booking-button" className="button luma primary" onClick={() => handleBookingButtonClick()}>Varaa tapahtuma</button>}
              <button className="button luma" onClick={cancel}>Poistu</button>
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