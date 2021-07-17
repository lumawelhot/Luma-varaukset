/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { CREATE_FORM } from '../../graphql/queries'

import FieldItem from './FieldItem'
import AddField from './AddField'

const FormEditor = ({ save, back }) => {
  const { t } = useTranslation('user')
  const [name, setName] = useState('New Form')
  const [fields, setFields]  = useState([])

  const handleAdd = (data) => {
    setFields(fields.concat(data))
  }

  const handleRemove = (index) => {
    fields.splice(index,1)
    setFields([...fields])
  }

  const moveUp = (index) => {
    if (index === 0) return
    const item = fields[index]
    fields[index] = fields[index-1]
    fields[index-1] = item
    setFields([...fields])
  }

  const moveDown = (index) => {
    if (index === fields.length-1) return
    const item = fields[index]
    fields[index] = fields[index+1]
    fields[index+1] = item
    setFields([...fields])
  }

  return (
    <div className="section">
      <div className="field">
        <label className="label">{t('form-name')}</label>
      </div>
      {fields.map((f,index) =>
        <FieldItem
          key={index}
          item={f}
          down={index === fields.length-1 ? null : () => moveDown(index)}
          up={index === 0 ? null : () => moveUp(index)}
          remove={() => handleRemove(index)}/>)}
      <AddField add={handleAdd}/>
      <button className="button luma primary" onClick={() => save()}>{t('save')}</button>
      <button className="button luma primary" onClick={back}>{t('back')}</button>
    </div>
  )
}

export default FormEditor