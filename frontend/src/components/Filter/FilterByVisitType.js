import React from 'react'
import { useTranslation } from 'react-i18next'

const FilterByVisitType = (props) => {
  const { t } = useTranslation('common')

  return (
    <>
      <p className="label">{t('filter-by-visit-type')}</p>
      <div className="field is-grouped">
        <div className="field">
          <button
            className={`button luma ${props.inPerson ? 'active' : ''}`}
            onClick={() => props.setInPerson(!props.inPerson)}
          >
            {t('inperson')}
          </button>
        </div>
        <div className="field">
          <button
            className={`button luma ${props.remote ? 'active' : ''}`}
            onClick={() => props.setRemote(!props.remote)}
          >
            {t('remote')}
          </button>
        </div>
      </div>
    </>
  )
}

export default FilterByVisitType