import React from 'react'
import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

const Filterform = ({ values, setValues }) => {
  const { t } = useTranslation('common')
  const style = { marginRight: 5 }

  const change = (item) => {
    const newValues = values.includes(item) ? values.filter(v => v !== item) : values.concat(item)
    setValues(newValues)
  }

  const setAll = (value) => {
    if (value) setValues([1, 2, 3, 4, 5])
    else setValues([])
  }

  return (
    <div>
      <p className="label">{t('filter-by-resource')} </p>
      <div className="field is-grouped">
        <Tooltip title={t('mathematic')} color={'geekblue'}>
          <div className="field">
            <button
              style={style}
              className={`button luma ${values.includes(1) ? 'active' : ''}`}
              onClick={() => change(1)}
            >
              SUMMAMUTIKKA
            </button>
          </div>
        </Tooltip>
        <Tooltip title={t('physics')} color={'geekblue'}>
          <div className="field">
            <button
              style={style}
              className={`button luma ${values.includes(2) ? 'active' : ''}`}
              onClick={() => change(2)}
            >
              FOTONI
            </button>
          </div>
        </Tooltip>
        <Tooltip title={t('computer-science')} color={'geekblue'}>
          <div className="field">
            <button
              style={style}
              className={`button luma ${values.includes(3) ? 'active' : ''}`}
              onClick={() => change(3)}
            >
              LINKKI
            </button>
          </div>
        </Tooltip>
        <Tooltip title={t('geography')} color={'geekblue'}>
          <div className="field">
            <button
              style={style}
              className={`button luma ${values.includes(4) ? 'active' : ''}`}
              onClick={() => change(4)}
            >
              GEOPISTE
            </button>
          </div>
        </Tooltip>
        <Tooltip title={t('chemistry')} color={'geekblue'}>
          <div className="field">
            <button
              style={style}
              className={`button luma ${values.includes(5) ? 'active' : ''}`}
              onClick={() => change(5)}
            >
              GADOLIN
            </button>
          </div>
        </Tooltip>
        <div className="field">
          {values.length === 5 ?
            <button className="button luma" onClick={() => setAll(false)}>{t('remove-all')}</button>
            :
            <button className="button luma" onClick={() => setAll(true)}>{t('show-all')}</button>}
        </div>
      </div>
    </div>
  )
}
export default Filterform