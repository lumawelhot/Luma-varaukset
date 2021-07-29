import React from 'react'
import { useTranslation } from 'react-i18next'

const FilterByGrades = ({ grades, setGrades }) => {
  const { t } = useTranslation('common')
  const style = { marginRight: 5 }

  const change = (item) => {
    const newValues = grades.includes(item) ? grades.filter(v => v !== item) : grades.concat(item)
    setGrades(newValues)
  }

  const setAll = (value) => {
    if (value) setGrades([1, 2, 3, 4, 5])
    else setGrades([])
  }

  return (
    <>
      <p className="label">{t('filter-by-grade')}</p>
      <div className="field is-grouped">
        <div className="field">
          <button
            style={style}
            className={`button luma ${grades.includes(1) ? 'active' : ''}`}
            onClick={() => change(1)}
          >
            {t('early-education')}
          </button>
        </div>
        <div className="field">
          <button
            style={style}
            className={`button luma ${grades.includes(2) ? 'active' : ''}`}
            onClick={() => change(2)}
          >
            {t('1-2')}
          </button>
        </div>
        <div className="field">
          <button
            style={style}
            className={`button luma ${grades.includes(3) ? 'active' : ''}`}
            onClick={() => change(3)}
          >
            {t('3-6')}
          </button>
        </div>
        <div className="field">
          <button
            style={style}
            className={`button luma ${grades.includes(4) ? 'active' : ''}`}
            onClick={() => change(4)}
          >
            {t('7-9')}
          </button>
        </div>
        <div className="field">
          <button
            style={style}
            className={`button luma ${grades.includes(5) ? 'active' : ''}`}
            onClick={() => change(5)}
          >
            {t('second-degree')}
          </button>
        </div>
        <div className="field">
          {grades.length === 5 ?
            <button className="button luma" onClick={() => setAll(false)}>{t('remove-all')}</button>
            :
            <button className="button luma" onClick={() => setAll(true)}>{t('show-all')}</button>}
        </div>
      </div>
    </>
  )
}

export default FilterByGrades