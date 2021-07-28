import React from 'react'
import { useTranslation } from 'react-i18next'

const FilterByVisitType = ({ inPerson, remote, setInPerson, setRemote }) => {
  const { t } = useTranslation('common')
  const style = { marginRight: 5 }

  const setAll = (value) => {
    if (value) {
      setInPerson(true)
      setRemote(true)
    }
    else {
      setInPerson(false)
      setRemote(false)
    }
  }

  return (
    <>
      <p className="label">{t('filter-by-visit-type')}</p>
      <div className="field is-grouped">
        <button
          style={style}
          className={`button luma ${inPerson ? 'active' : ''}`}
          onClick={() => setInPerson(!inPerson)}
        >
          {t('inperson')}
        </button>
        <button
          style={style}
          className={`button luma ${remote ? 'active' : ''}`}
          onClick={() => setRemote(!remote)}
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