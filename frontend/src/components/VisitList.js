import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useHistory } from 'react-router'
import { VISITS } from '../graphql/queries'
import Filterform from './Filter/Filterform'
import VisitListSortable from './VisitListSortable'
import { useTranslation } from 'react-i18next'

const VisitList = () => {
  const { t } = useTranslation('visit')

  const result = useQuery(VISITS)
  const [filters, setFilters] = useState([1, 2, 3, 4, 5])

  const history = useHistory()

  if (result.loading) return <></>

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  const renderedVisits = result.data.getVisits.filter(visit => {
    return visit.event ? visit.event.resourceids.some(r => filters.includes(r)) : null
  })

  return (
    <div className="section">
      <h1 className="title luma">{t('visits')}</h1>
      <Filterform values={filters} setValues={setFilters} />
      <VisitListSortable visits={renderedVisits}/>
      <div className="section">
        <button className="button luma" onClick={(e) => cancel(e)}>{t('back')}</button>
      </div>
    </div>
  )
}

export default VisitList