import React from 'react'
import { useTranslation } from 'react-i18next'

const FilterByVisitType = ({ inPerson, remote, setType }) => {
  const { t } = useTranslation('common')
  const style = { marginRight: 5 }

  const setAll = (value) => {
    if (value) setType(true, true)
    else setType(false, false)
  }

  return (
    <>
      <p className="label">{t('filter-by-visit-type')}</p>
      <div className="field is-grouped">
        <button
          style={style}
          className={`button luma ${inPerson ? 'active' : ''}`}
          onClick={() => setType(remote, !inPerson)}
        >
          {t('inperson')}
        </button>
        <button
          style={style}
          className={`button luma ${remote ? 'active' : ''}`}
          onClick={() => setType(!remote, inPerson)}
        >
          {t('remote')}
        </button>
        <div className="field">
          {remote && inPerson ?
            <button className="button luma" onClick={() => setAll(false)}>{t('remove-all')}</button>
            :
            <button className="button luma" onClick={() => setAll(true)}>{t('show-all')}</button>}
        </div>
      </div>
    </>
  )
}

export default FilterByVisitType