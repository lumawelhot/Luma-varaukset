import React, { useState, useEffect } from 'react'
import { FIND_VISIT, CANCEL_VISIT } from '../graphql/queries'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router'
import moment from 'moment'
import { useHistory } from 'react-router'

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

/* const filterEventGrades = (visitGrade) => {
  switch (visitGrade) {
    case 1:
      return 'Varhaiskasvatus'
    case 2:
      return '1.-2. luokka'
    case 3:
      return '3.-6. luokka'
    case 4:
      return '7.-9. luokka'
    case 5:
      return 'Toinen aste'
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
    onError: (e) => {
      sendMessage('Virhe!', 'danger')
      console.log(e)
    },
    //fetchPolicy: 'cache-and-network'
  })

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  useEffect(() => {
    if (!data) {
      findVisit({ variables: { id } })
    }
    else if (data) {
      //console.log(data)
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
    cancelVisit({
      variables: { id }
    })
  }

  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <div className="title">Olet varannut seuraavan tapahtuman:</div>
          <div>
            <p><b>{visit.event.title}</b></p>
            <p>Kuvaus: [Tähän tapahtuman kuvaus]</p>
            <p>Tiedeluokka: {filterEventClass(visit.event.resourceId)}</p>
            <p>Valitut lisäpalvelut: [Tähän ekstrat]</p>
            <p>Valittu luokka-aste: {visit.grade}</p>
            <p>Ilmoitettu osallistujamäärä: {visit.participants}</p>
            <p>Vierailu alkaa: {moment(visit.event.start).format('DD.MM.YYYY, HH:mm')}</p>
            <p>Vierailu päättyy: {moment(visit.event.end).format('DD.MM.YYYY, HH:mm')}</p>

            <div className="field is-grouped">
              <div className="control">
                <button className="button is-danger" onClick={handelCancel}>Peru</button>
              </div>
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

export default VisitPage