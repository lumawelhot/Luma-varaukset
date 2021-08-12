import { useQuery } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { GET_EMAIL_TEMPLATES } from '../graphql/queries'
import { TextArea, TextField } from './VisitForm/FormFields'

const EmailConfig = () => {
  const history = useHistory()
  const { t } = useTranslation('common')
  const [showModal, setShowModal] = useState(false)
  const [selectedTemlate, setSelectedTemplate] = useState(null)
  const templates = useQuery(GET_EMAIL_TEMPLATES)
  if (templates.loading) return <></>
  console.log(templates.data.getEmailTemplates)

  const handleBack = (event) => {
    event.preventDefault()
    history.push('/')
  }

  const openConfigurationModal = (template) => {
    setShowModal(true)
    setSelectedTemplate(template)
  }

  const handleChangeData = () => {
    console.log('change')
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
              subject: selectedTemlate.subject
            }}
            onSubmit={handleChangeData}
          >
            {({ handleSubmit }) => {
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
                      placeholder={t('description-placeholder')}
                      component={TextArea}
                    />
                    <Field
                      label={t('html')}
                      fieldName='html'
                      placeholder={t('description-placeholder')}
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