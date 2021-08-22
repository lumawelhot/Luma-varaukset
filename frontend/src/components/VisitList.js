import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useHistory } from 'react-router'
import { VISITS } from '../graphql/queries'
import Filterform from './Filter/Filterform'
import VisitListSortable from './VisitListSortable'
import { useTranslation } from 'react-i18next'

const VisitList = ({ notify }) => {
  const { t } = useTranslation('visit')

  const result = useQuery(VISITS)
  const [filters, setFilters] = useState([1, 2, 3, 4, 5])

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
    notify(t('url-copied'), 'success')
  }

  const renderedVisits = result.data.getVisits.filter(visit => {
    return filters.length ? visit.event.resourceids.some(r => filters.includes(r)) : true
  })

  return (
    <div className="section">
      <h1 className="title luma">{t('visits')}</h1>
      <Filterform values={filters} setValues={setFilters} />
      <VisitListSortable visits={renderedVisits} copyURL={copyURL}/>
      <div className="section">
        <button className="button luma primary" onClick={(e) => cancel(e)}>{t('back')}</button>
      </div>
    </div>
  )
}

export default VisitList