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
  console.log(fields)
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
          {fields.map((f, index) =>
            <tr key={index}>
              <td>
                <FieldItem
                  item={f}
                  down={index === fields.length-1 ? null : () => moveDown(index)}
                  up={index === 0 ? null : () => moveUp(index)}
                  remove={() => handleRemove(index)}
                  update={(data) => handleUpdateField(index,data)}
                />
              </td>
              <td>
                {f.validation.required ? t('yes') : t('no') }
              </td>
              <td>
                {t(f.type)}
              </td>
              <td>
                <div className="media-right">
                  <button className="button is-small" onClick={() => handleRemove(index)}>{t('form-field-remove')}</button>
                  {index === fields.length-1 ?
                    <button className="button is-small" disabled>{t('form-field-move-down')}</button>
                    :
                    <button className="button is-small" onClick={() => moveDown(index)}>{t('form-field-move-down')}</button>}
                  {index === 0 ?
                    <button className="button is-small" disabled>{t('form-field-move-up')}</button>
                    :
                    <button className="button is-small" onClick={() => moveUp(index)}>{t('form-field-move-up')}</button>}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="content">
        <AddField add={handleAdd}/>
      </div>
      <div className="control">
        <button className="button luma primary" onClick={() => handleSave()}>{t('save')}</button>
        <button className="button luma " onClick={back}>{t('back')}</button>
      </div>
    </div>
  )
}

/*<table className="table" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th></th>
              <th>{t('event')}</th>
              <th>{t('resource')}</th>
              <th>{t('date')}</th>
              <th>{t('time')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tableEvents.map(event => {
              const resourceNames = event.resourceids.map(id => { return { name: classes[id-1]?.label || null, color: resourceColorsLUMA[id - 1] }})
              return (
                <tr key={event.id}>
                  <td>
                    <input
                      type="checkbox" checked={checkedEvents.includes(event.id) ? 'checked' : ''}
                      onChange={(e) => handleCheckEvent(e, event.id)} />
                  </td>
                  <td>{event.title}</td>
                  <td>
                    {!!resourceNames.length && <div className="tags">
                      {resourceNames.map(r =>
                        <span key={r.name} className='tag is-small is-link' style={{ backgroundColor: r.color }}>{r.name}</span>)}
                    </div>}
                  </td>
                  <td>{`${format(new Date(event.start), 'dd.MM.yyyy')}`}</td>
                  <td>{`${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')}`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>*/

export default FormEditor