import React, { useState, useEffect } from 'react'
import { FIND_VISIT, CANCEL_VISIT } from '../graphql/queries'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router'
//import moment from 'moment'
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

  const [findVisit, { loading, data }] = useLazyQuery(FIND_VISIT, {
    onError: (error) => console.log('virheviesti: ', error),
  })

  const [cancelVisit, resultOfCancel] = useMutation(CANCEL_VISIT, {
    // tarkista backendin error
    onError: () => {
      sendMessage('Virheellinen pin', 'danger')
    },
    //fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    console.log(data, loading)
    if (!data) {
      const pin = window.prompt('Anna pin-koodi:')
      findVisit({ variables: { pin: Number(pin), id } })
    }
    else if (data) {
      console.log(data)
      setVisit(data.findVisit)
    }
  }, [data])

  useEffect(() => {
    if (resultOfCancel.data) {
      console.log(resultOfCancel.data)
      sendMessage('Vierailu peruttu', 'success')
      history.push('/')
    }
  }, [resultOfCancel.data])

  if (loading || visit === null) {
    return (
      <div>
        <p>Varausta haetaan...</p>
      </div>
    )
  }

  const handelCancel = (event) => {
    event.preventDefault()
    const pin = window.prompt('Anna pin-koodi:')
    cancelVisit({
      variables: { pin: Number(pin), id }
    })
  }

  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <div className="title">{/* {visit.event.title} */}</div>
          {/* {!visit.event.booked && <p className="subtitle">Peruttu</p>}
          {visit.event.booked && */}
          <div>
            <p>Kuvaus: [Tähän tapahtuman kuvaus]</p>
            <p>Tiedeluokka: </p>
            <p>Valittavissa olevat lisäpalvelut: [Tähän ekstrat]</p>
            <div>Tarjolla seuraaville luokka-asteille:</div>
            {/* <p>Tapahtuma alkaa: {moment(visit.event.start).format('DD.MM.YYYY, HH:mm')}</p> */}
            <button className="button is-danger" onClick={handelCancel}>Peru</button>
          </div>{/* } */}
        </div>
      </div>
    </div>
  )
}

export default VisitPage