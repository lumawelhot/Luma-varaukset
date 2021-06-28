import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useHistory } from 'react-router'
import { VISITS } from '../graphql/queries'
import Filterform from './Filterform'
import VisitListSortable from './VisitListSortable'

const VisitList = ({ notify }) => {

  const result = useQuery(VISITS)
  const [filters, setFilters] = useState([])

  const history = useHistory()

  if (result.loading) return <></>

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  const copyURL = (visit) => {
    const element = document.getElementById('value-' + visit.id)
    element.select()
    element.setSelectionRange(0, 99999)
    document.execCommand('copy')
    notify('URL kopioitu leikepöydälle!', 'success')
  }

  const renderedVisits = result.data.getVisits.filter(visit => {
    return filters.length ? visit.event.resourceids.some(r => filters.includes(r)) : true
  })

  return (
    <div className="section">
      <h1 className="title luma">Varaukset</h1>
      <Filterform values={filters} setValues={setFilters} />
      <VisitListSortable visits={renderedVisits} copyURL={copyURL}/>
      <div className="section">
        <button className="button luma primary" onClick={(e) => cancel(e)}>Poistu</button>
      </div>
    </div>
  )
}

export default VisitList