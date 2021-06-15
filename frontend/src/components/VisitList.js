import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { useHistory } from 'react-router'
import { VISITS } from '../graphql/queries'
import Filterform from './Filterform'

const VisitList = () => {

  const result = useQuery(VISITS)
  const [filters, setFilters] = useState([])
  const [renderedVisits, setRenderedVisits] = useState([])

  const history = useHistory()

  useEffect(() => {
    if (result.data?.getVisits) {
      const filteredVisits = result.data.getVisits
        .filter(v => {
          return filters.length ? filters.includes(Number(v.event.resourceId)) : true
        })
      return () => { setRenderedVisits(filteredVisits) }
    }
  }, [filters, result])

  if (result.loading) return <></>

  const filter = (filteredResources) => {
    setFilters(filteredResources)
  }

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  const copyURL = (visit) => {
    const element = document.getElementById('value-' + visit.id)
    element.select()
    element.setSelectionRange(0, 99999)
    document.execCommand('copy')
    console.log(element.value)
  }

  return (
    <div className="section">
      <h1 className="title luma">Varaukset</h1>
      <table className="table">
        <thead>
          <tr>
            <th>otsikko</th>
            <th>resurssi-id</th>
            <th>luokka-aste</th>
            <th>extrat</th>
            <th>asiakkaan nimi</th>
            <th>asiakkaan sähköpostisoite</th>
            <th>asiakkaan puhelinnumero</th>
            <th>tila</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {renderedVisits.map(visit => {
            const copiedURL = process.env.PUBLIC_URL || 'http://localhost:3000' + '/' + visit.id
            return (
              <tr key={visit.id}>
                <td>{visit.event.title}</td>
                <td>{visit.event.resourceId}</td>
                <td>{visit.grade}</td>
                <td>{visit.extra}</td>
                <td>{visit.clientName}</td>
                <td>{visit.clientEmail}</td>
                <td>{visit.clientPhone}</td>
                <td>{visit.status ? 'VOIMASSA' : 'PERUTTU'}</td>
                <td>
                  <button className="button luma" onClick={() => copyURL(visit)}>Kopioi URL</button>
                  <input readOnly className="hidden" type="text" id={'value-' + visit.id} value={copiedURL} />
                </td>
              </tr>
            )
          }
          )}
          {(renderedVisits.length === 0) && <tr><td colSpan="8"><span className="subtitle luma">Varauksia ei löytynyt.</span></td></tr>}
        </tbody>
      </table>
      <div className="section">
        <button className="button luma primary" onClick={(e) => cancel(e)}>Poistu</button>
      </div>
      <div >
        <Filterform filter={(resources) => filter(resources)} />
      </div>
    </div>
  )
}

export default VisitList