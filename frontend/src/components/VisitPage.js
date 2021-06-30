import React, { useState, useEffect } from 'react'
import { FIND_VISIT, CANCEL_VISIT, EVENTS } from '../graphql/queries'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router'
import { format, parseISO }  from 'date-fns'
import { useHistory } from 'react-router'

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

const VisitPage = ({ sendMessage }) => {
  const history = useHistory()

  const id = useParams().id
  const [visit, setVisit] = useState(null)

  const [findVisit, { loading, data }] = useLazyQuery(FIND_VISIT, {
    onError: (error) => console.log('virheviesti: ', error),
  })

  const [cancelVisit, resultOfCancel] = useMutation(CANCEL_VISIT, {
    refetchQueries: [{ query: EVENTS }],
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
    else if (data.findVisit) {
      let parsedVisit = { ...data.findVisit }
      if (typeof parsedVisit.startTime === 'string') {
        parsedVisit.startTime=parseISO(data.findVisit.startTime)
        parsedVisit.endTime=parseISO(data.findVisit.endTime)
      }
      setVisit(parsedVisit)
    }
  }, [data])

  useEffect(() => {
    if (resultOfCancel.data) {
      sendMessage('Vierailu peruttu', 'success')
      history.push('/')
    }
  }, [resultOfCancel.data])

  if (loading) {
    return (
      <div>
        <p>Varausta haetaan...</p>
      </div>
    )
  }
  if (!visit || visit.status === false) {
    return (
      <div>
        <p>Varausta ei löytynyt.</p>
      </div>
    )
  }

  const handleCancel = (event) => {
    event.preventDefault()
    confirm('Haluatko varmasti perua varauksesi?') && cancelVisit({
      variables: { id }
    })
  }

  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <div className="title">Olet varannut seuraavan vierailun:</div>
          <div className="box">
            <div className="content luma">
              <p className="title">{visit.event.title}</p>
              <p><strong>Kuvaus:</strong> {visit.event.desc}</p>
              <p><strong>Tiedeluokka</strong>: {filterEventClass(visit.event.resourceids)}</p>
              {visit.extras.length
                ? <p><strong>Lisäpalvelut:</strong> {visit.extras.map(extra => <span key={extra.name}>{extra.name}</span>) }</p>
                : null}
              <p><strong>Opetusmuoto:</strong>
                {visit.inPersonVisit ? ' Lähiopetus' : <></>}
                {visit.remoteVisit ? ' Etäopetus' : <></>}
              </p>
              <p><strong>Vierailun päivämäärä:</strong> {format(visit.startTime, 'd.M.yyyy')}</p>
              <p><strong>Vierailu alkaa:</strong> {format(visit.startTime, 'HH:mm')}</p>
              <p><strong>Vierailu päättyy:</strong> {format(visit.endTime, 'HH:mm')}</p>
              <hr></hr>
              <p className='subtitle'><b>Antamasi tiedot:</b></p>
              <p><strong>Varaajan nimi:</strong> {visit.clientName}</p>
              <p><strong>Varaajan sähköpostiosoite:</strong> {visit.clientEmail}</p>
              <p><strong>Varaajan puhelinnumero:</strong> {visit.clientPhone}</p>
              <p><strong>Ilmoitettu oppimisyhteisön nimi:</strong> {visit.schoolName}</p>
              <p><strong>Ilmoitettu oppimisyhteisön paikkakunta:</strong> {visit.schoolLocation}</p>
              <p><strong>Valittu luokka-aste:</strong> {visit.grade}</p>
              <p><strong>Ilmoitettu osallistujamäärä:</strong> {visit.participants}</p>

              {visit.remoteVisit &&
              <p><strong>Käytettävä etäyhteysalusta:</strong> {visit.remotePlatform}</p>
              }
            </div>

            <div className="field is-grouped">
              <div className="control">
                <button className="button is-danger luma" onClick={handleCancel}>Peru</button>
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