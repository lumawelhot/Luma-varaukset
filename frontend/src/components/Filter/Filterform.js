import React from 'react'
import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { classes } from '../../helpers/classes'

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
        {classes.map((cls,idx) =>
          <Tooltip key={cls.value} title={t(cls.i18n)}>
            <div className="field">
              <button
                style={style}
                className={`button luma ${values.includes(idx+1) ? 'active' : ''}`}
                onClick={() => change(idx+1)}
              >
                {cls.label}
              </button>
            </div>
          </Tooltip>
        )}
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