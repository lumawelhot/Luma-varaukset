import React from 'react'
import { useTranslation } from 'react-i18next'

const FilterByGrades = ({ grades, setGrades }) => {
  const { t } = useTranslation('common')

  const muuta = (item) => {
    const newValues = grades.includes(item) ? grades.filter(v => v !== item) : grades.concat(item)
    setGrades(newValues)
  }

  return (
    <>
      <p className="label">{t('filter-by-grade')}</p>
      <div className="field is-grouped">
        <div className="field">
          <button
            className={`button luma ${grades.includes(1) ? 'active' : ''}`}
            onClick={() => muuta(1)}
          >
            {t('early-education')}
          </button>
        </div>
        <div className="field">
          <button
            className={`button luma ${grades.includes(2) ? 'active' : ''}`}
            onClick={() => muuta(2)}
          >
            {t('1-2')}
          </button>
        </div>
        <div className="field">

          <button
            className={`button luma ${grades.includes(3) ? 'active' : ''}`}
            onClick={() => muuta(3)}
          >
            {t('3-6')}
          </button>
        </div>
        <div className="field">

          <button
            className={`button luma ${grades.includes(4) ? 'active' : ''}`}
            onClick={() => muuta(4)}
          >
            {t('7-9')}
          </button>
        </div>
        <div className="field">

          <button
            className={`button luma ${grades.includes(5) ? 'active' : ''}`}
            onClick={() => muuta(5)}
          >
            {t('second-degree')}
          </button>
        </div>
      </div>
    </>
  )
}

export default FilterByGrades