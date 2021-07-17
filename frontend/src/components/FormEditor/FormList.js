import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { GET_ALL_FORMS, DELETE_FORM } from '../../graphql/queries'

import FormEditor from './FormEditor'

const FormList = ({ sendMessage }) => {
  const { t } = useTranslation('user')
  const forms = useQuery(GET_ALL_FORMS)
  const history = useHistory()
  const [form, setForm] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [deleteForm,] = useMutation(DELETE_FORM, {
    refetchQueries: [{ query: GET_ALL_FORMS }],
    onCompleted: () => {
      sendMessage(t('form-removed'), 'success')
    },
    onError: (error) => {
      sendMessage(error.message, 'danger')
    }
  })

  if (forms.loading) return <></>

  const create = () => {
    setShowEditor(true)
  }

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  const handleEdit = (id) => {
    setForm(forms.data.getForms.find(f => f.id === id))
    setShowEditor(true)
  }

  const handleRemove = (id) => {
    deleteForm({
      variables: {
        id
      }
    })
  }

  if (showEditor) return (
    <FormEditor form={form} sendMessage={sendMessage} back={() => setShowEditor(false)}/>
  )

  return (
    <div className="section">
      <h1 className="title">{t('forms')}</h1>
      <table className="table">
        <thead>
          <tr>
            <th>{t('form-name')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {forms.data.getForms.map(form => (
            <tr key={form.id}>
              <td>{form.name}</td>
              <td>
                <button className='button luma' onClick={() => handleEdit(form.id)}>{t('edit')}</button>
                <button className='button luma' onClick={() => handleRemove(form.id)}>{t('remove')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="field is-grouped">
        <div className="control">
          <button className="button luma primary" onClick={() => create()}>{t('create-form')}</button>
        </div>
        <div className="control">
          <button className="button luma" onClick={cancel}>{t('back')}</button>
        </div>
      </div>
    </div>
  )
}

export default FormList