import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client'
import { CREATE_FORM, GET_ALL_FORMS, UPDATE_FORM } from '../../graphql/queries'

import FieldItem from './FieldItem'
import AddField from './AddField'

const FormEditor = ({ form, back, sendMessage }) => {
  const editingExistingForm = !!form
  const { t } = useTranslation('user')
  const [name, setName] = useState(form?.name || t('new-form'))
  const [fields, setFields]  = useState(form ? JSON.parse(form.fields) : [])
  const [createForm, result] = useMutation(CREATE_FORM, {
    refetchQueries: [{ query: GET_ALL_FORMS }],
    onError: (error) => sendMessage(error.graphQLErrors[0].message, 'danger')
  })

  const [updateForm, resultFromUpdate] = useMutation(UPDATE_FORM, {
    refetchQueries: [{ query: GET_ALL_FORMS }],
    onError: (error) => sendMessage(error.graphQLErrors[0].message, 'danger')
  })

  useEffect(() => {
    if (result.data) {
      sendMessage(`${t('form')} '${result.data.createForm.name}' ${t('created')}.`, 'success')
      back()
    }
  }, [result])

  useEffect(() => {
    if (resultFromUpdate.data) {
      sendMessage(`${t('form')} '${resultFromUpdate.data.updateForm.name}' ${t('updated')}.`, 'success')
      back()
    }
  }, [resultFromUpdate])

  const handleAdd = (data) => {
    setFields(fields.concat(data))
  }

  const handleUpdateField = (index, data) => {
    fields[index] = data
    setFields([...fields])
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

  const handleSave = () => {
    if (editingExistingForm) {
      updateForm({
        variables: {
          id: form.id,
          name,
          fields: JSON.stringify(fields)
        }
      }).catch(() => sendMessage(t('invalid-input'), 'danger'))
    } else {
      createForm({
        variables: {
          name,
          fields: JSON.stringify(fields)
        }
      }).catch(() => sendMessage(t('invalid-input'), 'danger'))
    }
  }

  return (
    <div className="section">
      <div className="field">
        <label className="label">{t('form-name')}</label>
        <div className="control">
          <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        </div>
      </div>
      <div className="content">
        <label className="label">{t('form-fields')}</label>
        {fields.map((f,index) =>
          <FieldItem
            key={index}
            item={f}
            down={index === fields.length-1 ? null : () => moveDown(index)}
            up={index === 0 ? null : () => moveUp(index)}
            remove={() => handleRemove(index)}
            update={(data) => handleUpdateField(index,data)}/>)}
      </div>
      <div className="control">
        <AddField add={handleAdd}/>
      </div>
      <p className="control">
        <button className="button luma primary" onClick={() => handleSave()}>{t('save')}</button>
        <button className="button luma primary" onClick={back}>{t('back')}</button>
      </p>
    </div>
  )
}

export default FormEditor