import React, { useState, useEffect } from 'react'
import { FIND_VISIT, CANCEL_VISIT } from '../graphql/queries'
import { useMutation, useQuery } from '@apollo/client'
import { useParams } from 'react-router'
import moment from 'moment'
import { useHistory } from 'react-router'

/* const grades = [
  { value: 1, label:'Varhaiskasvatus' },
  { value: 2, label: '1.-2. luokka' },
  { value: 3, label: '3.-6. luokka' },
  { value: 4, label:'7.-9 luokka' },
  { value: 5, label:  'toinen aste' }
] */

/* const filterEventGrades = (eventGrades) => {
  const returnArray = []
  eventGrades.forEach(availableGrade => {
    grades.forEach(grade => {
      if (availableGrade === grade.value) {
        returnArray.push({ value: grade.value, label: grade.label })
      }
    })
  })
  return returnArray
} */

/* const filterEventClass = (eventClass) => {
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
} */

const VisitPage = ({ sendMessage }) => {
  const history = useHistory()

  const id = useParams().id
  const [visit, setVisit] = useState(null)

  const result = useQuery(FIND_VISIT, {
    onError: (error) => console.log('virheviesti: ', error, result),
    variables: { id: id }
  })

  const [cancelVisit, resultOfCancel] = useMutation(CANCEL_VISIT, {
    onError: (error) => console.log(error),
    variables: { id: id }
  })

  useEffect(() => {
    if (resultOfCancel.data) {
      console.log(resultOfCancel.data)
      sendMessage('Vierailu peruttu', 'success')
      history.push('/')
    }
  }, [resultOfCancel.data])

  useEffect(() => {
    if (result.data) {
      console.log(result.data)
      setVisit(result.data.findVisit)
    }
  }, [result.data])

  if (result.loading || visit === null) {
    return (
      <div>
        <p>Varausta haetaan...</p>
      </div>
    )
  }

  const handelCancel = () => {
    const givenPin = window.prompt('Anna pin-koodi:')
    if (String(visit.pin) === givenPin) {
      cancelVisit({
        variables: { pin: visit.pin }
      })
    } else {
      alert('Virheellinen pin-koodi!')
    }
  }


  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <div className="title">{visit.event.title}</div>
          {!visit.event.booked && <p className="subtitle">Peruttu</p>}
          {visit.event.booked &&
            <div>
              <p>Kuvaus: [Tähän tapahtuman kuvaus]</p>
              <p>Tiedeluokka: </p>
              <p>Valittavissa olevat lisäpalvelut: [Tähän ekstrat]</p>
              <div>Tarjolla seuraaville luokka-asteille:</div>
              <p>Tapahtuma alkaa: {moment(visit.event.start).format('DD.MM.YYYY, HH:mm')}</p>
              <button className="button is-danger" onClick={handelCancel}>Peru</button>
            </div>}
        </div>
      </div>
    </div>
  )
}

export default VisitPage