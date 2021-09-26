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
  const [editing, setEditing] = useState(false)

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
    setEditing(true)
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
    if (!fields.length) {
      sendMessage(t('cannot-save-empty-form'), 'danger')
    } else if (editingExistingForm) {
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

  const handleBack = () => {
    if (editing) {
      if (window.confirm(t('do-you-want-to-exit-without-save'))) {
        back()
      }
    } else {
      back()
    }
  }

  return (
    <div className="section">
      <div className="field">
        <label className="label">{t('form-name')}</label>
        <div className="control">
          <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      {fields.length ?
        <label className="label">{t('form-fields')}</label> : null
      }
      <table className="table">
        <thead>
          <tr>
            <th>{t('field')}</th>
            <th>{t('form-field-input-required')}</th>
            <th>{t('field-type')}</th>
            <th>{t('options')}</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) =>
            <FieldItem
              key={index}
              item={field}
              index={index}
              update={handleUpdateField}
              remove={handleRemove}
              down={index === fields.length - 1 ? null : () => moveDown(index)}
              up={index === 0 ? null : () => moveUp(index)}
            />
          )}
        </tbody>
      </table>
      <div className="content">
        <AddField add={handleAdd} setEditing={setEditing}/>
      </div>
      <div className="control">
        <button className="button luma primary" onClick={() => handleSave()}>{t('save')}</button>
        <button className="button luma " onClick={handleBack}>{t('back')}</button>
      </div>
    </div>
  )
}

export default FormEditor