import React from 'react'
import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

const Filterform = ({ values, setValues }) => {
  const { t } = useTranslation('common')

  const muuta = (item) => {
    const newValues = values.includes(item) ? values.filter(v => v !== item) : values.concat(item)
    setValues(newValues)
  }

  return (
    <div>
      <p className="label">{t('filter-by-resource')} </p>
      <div className="field is-grouped">
        <Tooltip title={t('mathematic')} color={'geekblue'}>
          <button
            className={`button luma ${values.includes(1) ? 'active' : ''}`}
            onClick={() => muuta(1)}
          >
            SUMMAMUTIKKA
          </button>
        </Tooltip>
        <Tooltip title={t('physics')} color={'geekblue'}>
          <button
            className={`button luma ${values.includes(2) ? 'active' : ''}`}
            onClick={() => muuta(2)}
          >
            FOTONI
          </button>
        </Tooltip>
        <Tooltip title={t('computer-science')} color={'geekblue'}>
          <button
            className={`button luma ${values.includes(3) ? 'active' : ''}`}
            onClick={() => muuta(3)}
          >
            LINKKI
          </button>
        </Tooltip>
        <Tooltip title={t('geography')} color={'geekblue'}>
          <button
            className={`button luma ${values.includes(4) ? 'active' : ''}`}
            onClick={() => muuta(4)}
          >
            GEOPISTE
          </button>
        </Tooltip>
        <Tooltip title={t('chemistry')} color={'geekblue'}>
          <button
            className={`button luma ${values.includes(5) ? 'active' : ''}`}
            onClick={() => muuta(5)}
          >
            GADOLIN
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
export default Filterform