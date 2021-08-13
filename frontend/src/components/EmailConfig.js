import { useMutation, useQuery } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { GET_EMAIL_TEMPLATES, UPDATE_EMAIL } from '../graphql/queries'
import { TextArea, TextField } from './VisitForm/FormFields'

const EmailConfig = ({ sendMessage }) => {
  const history = useHistory()
  const { t } = useTranslation('common')
  const [showModal, setShowModal] = useState(false)
  const [selectedTemlate, setSelectedTemplate] = useState(null)
  const templates = useQuery(GET_EMAIL_TEMPLATES)
  const [updateEmail] = useMutation(UPDATE_EMAIL,  {
    refetchQueries: GET_EMAIL_TEMPLATES,
    onError: () => sendMessage(t('failed-to-update-email'), 'danger'),
    onCompleted: () => {
      templates.refetch()
      sendMessage(t('email-updated-successfully'), 'success')
    }
  })
  if (templates.loading) return <></>

  const handleBack = (event) => {
    event.preventDefault()
    history.push('/')
  }

  const openConfigurationModal = (template) => {
    setShowModal(true)
    setSelectedTemplate(template)
  }

  const handleChangeData = (values) => {
    updateEmail({
      variables: {
        name: selectedTemlate.name,
        html: values.html,
        text: values.text,
        subject: values.subject,
        ad: values.ad,
        adSubject: values.adSubject,
        adText: values.adText
      }
    })
    setShowModal(false)
    setSelectedTemplate(null)
  }

  return (
    <div className="section">
      {showModal &&
        <div className={`modal ${showModal ? 'is-active': ''}`}>
          <div className="modal-background"></div>
          <Formik
            initialValues={{
              html: selectedTemlate.html,
              text: selectedTemlate.text,
              subject: selectedTemlate.subject,
              address: '',
              ad: selectedTemlate.ad,
              adSubject: selectedTemlate.adSubject,
              adText: selectedTemlate.adText
            }}
            onSubmit={handleChangeData}
          >
            {({ setFieldValue, handleSubmit, handleChange, values }) => {
              return (
                <div className="modal-card">
                  <header className="modal-card-head">
                    <p className="modal-card-title">{t('configure-email-message')}</p>
                  </header>
                  <section className="modal-card-body">
                    <Field
                      label={t('subject')}
                      fieldName='subject'
                      component={TextField}
                    />
                    <Field
                      label={t('text')}
                      fieldName='text'
                      component={TextArea}
                    />
                    <Field
                      label={t('html')}
                      fieldName='html'
                      component={TextArea}
                    />
                    <div className="label">{t('notification-to')}</div>
                    <ul>
                      {values.ad.map(ad =>
                        <li key={ad}>
                          {ad}
                          <button onClick={() => {
                            setFieldValue('ad', values.ad.filter(email => email !== ad))
                          }} style={{ marginLeft: 10 }}>{t('remove')}</button>
                        </li>
                      )}
                    </ul>
                    <div className="field-is-grouped" style={{ marginBottom: 10 }}>
                      <input value={values.address} name="address" className="input" style={{ width: '70%' }} onChange={handleChange} />
                      <button className="button luma" style={{ float: 'right' }} onClick={() => {
                        setFieldValue('ad', values.ad.includes(values.address) ? values.ad : values.ad.concat(values.address))
                        setFieldValue('address', '')
                      }} >{t('add-address')}</button>
                    </div>
                    <Field
                      label={t('ad-subject')}
                      fieldName='adSubject'
                      component={TextField}
                    />
                    <Field
                      label={t('ad-text')}
                      fieldName='adText'
                      component={TextArea}
                    />
                  </section>
                  <footer className="modal-card-foot">
                    <button className="button luma" onClick={handleSubmit} type='submit'>{t('update-details')}</button>
                    <button className="button" onClick={() => setShowModal(false)}>{t('close')}</button>
                  </footer>
                </div>
              )}}
          </Formik>
        </div>
      }
      <h1 className="title">{t('email-configurations')}</h1>
      <table className="table" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>{t('type')}</th>
            <th>{t('subject')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {templates.data.getEmailTemplates.map(template => {
            return (
              <tr key={template.name}>
                <td>{template.name}</td>
                <td>{template.subject}</td>
                <td>
                  <button className="button luma" onClick={() => openConfigurationModal(template)}>{t('configure')}</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="field is-grouped">
        <button className="button luma" onClick={handleBack} >{t('back')}</button>
      </div>
    </div>
  )
}

export default EmailConfig