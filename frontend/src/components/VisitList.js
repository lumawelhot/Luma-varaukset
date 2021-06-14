import React from 'react'
import { useQuery } from '@apollo/client'
import { useHistory } from 'react-router'
import { VISITS } from '../graphql/queries'

const VisitList = () => {
  const result = useQuery(VISITS)
  const history = useHistory()

  if (result.loading) return <></>

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  const copyURL = (visit) => {
    const element = document.getElementById('value-' + visit.id)
    element.select()
    element.setSelectionRange(0,99999)
    document.execCommand('copy')
    console.log(element.value)
  }

  return (
    <div className="section">
      <h1 className="title luma">Varaukset</h1>
      <table className="table">
        <thead>
          <tr>
            <th>event.title</th>
            <th>event.resourceId</th>
            <th>grade</th>
            <th>extra</th>
            <th>clientName</th>
            <th>clientEmail</th>
            <th>clientPhone</th>
            <th>status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {result.data?.getVisits?.map(visit => {
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
                <td>{visit.status}</td>
                <td>
                  <button className="button luma" onClick={() => copyURL(visit)}>Kopioi URL</button>
                  <input readOnly className="hidden" type="text" id={'value-' + visit.id} value={copiedURL}/>
                </td>
              </tr>
            )}
          )}
          {!result.data?.getVisits.length && <tr><td colSpan="8"><span className="subtitle luma">Varauksia ei löytynyt.</span></td></tr>}
        </tbody>
      </table>
      <div className="section">
        <button className="button luma primary" onClick={(e) => cancel(e)}>Poistu</button>
      </div>
    </div>
  )
}

export default VisitList