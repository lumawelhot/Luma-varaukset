import { useQuery } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EXTRAS, GET_ALL_FORMS } from '../../graphql/queries'
import { createGradeList, createPlatformList, createResourceList } from '../../helpers/form'
import { AdditionalServices, EventType, Grades, Platforms, ScienceClasses, TimePick, SelectField } from '../EventForm/FormComponents'
import LumaTagInput from '../LumaTagInput/LumaTagInput'
import { TextArea, TextField } from '../VisitForm/FormFields'

const Form = ({ event, close, save, validate, tags }) => {
  const { t } = useTranslation('event')
  const [suggestedTags, setSuggestedTags] = useState([])
  const [suggestedForms, setSuggestedForms] = useState([])
  const extras = useQuery(EXTRAS)
  const forms = useQuery(GET_ALL_FORMS)

  useEffect(() => {
    if (tags) setSuggestedTags(tags)
  }, [tags])

  useEffect(() => {
    if (forms.data) setSuggestedForms(forms.data.getForms.map(form => Object({ id: form.id, name: form.name })))
  }, [forms.data])

  return (
    <Formik
      initialValues={{
        title: event.titleText,
        scienceClass: createResourceList(event),
        grades: createGradeList(event),
        remotePlatforms: createPlatformList(event),
        otherRemotePlatformOption: event.otherRemotePlatformOption,
        desc: event.desc ? event.desc : '',
        inPersonVisit: event.inPersonVisit,
        remoteVisit: event.remoteVisit,
        extras: event.extras.map(extra => extra.id),
        tags: event.tags.map(tag => tag.name),
        startTime: new Date(event.eventStart),
        endTime: new Date(event.eventEnd),
        customForm: event.customForm
      }}
      validate={validate}
      onSubmit={save}
    >
      {({ handleSubmit, values, setFieldValue, touched, errors }) => {
        return (
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">{values.title}</p>
              <button className="delete" aria-label="close" onClick={close}></button>
            </header>
            <section className="modal-card-body">
              <Field
                label={t('visit-name')}
                fieldName='title'
                component={TextField}
                required={true}
              />
              <Field
                label={t('description')}
                fieldName='desc'
                component={TextArea}
              />
              <LumaTagInput
                label={t('tags')}
                tags={values.tags}
                setTags={tags => setFieldValue('tags', tags)}
                suggestedTags={suggestedTags}
                tagCount={10}
              />
              <EventType />
              {touched.inPersonVisit && touched.remoteVisit && errors.location ?
                <p className="help is-danger">{errors.location}</p> : null
              }
              {values.remoteVisit ?
                <Platforms
                  values={values}
                  setFieldValue={setFieldValue}
                  touched={touched}
                  errors={errors}
                /> : null
              }
              <Grades
                values={values}
                setFieldValue={setFieldValue}
                touched={touched}
                errors={errors}
              />
              <ScienceClasses
                values={values}
                setFieldValue={setFieldValue}
                touched={touched}
                errors={errors}
              />
              <AdditionalServices
                extras={extras}
                values={values}
                setFieldValue={setFieldValue}
              />
              <Field
                label={t('start-time')}
                fieldName='startTime'
                component={TimePick}
                disabledHours={() => [0,1,2,3,4,5,6,7,17,18,19,20,21,22,23]}
                required={true}
              />

              <Field
                label={t('end-time')}
                fieldName='endTime'
                component={TimePick}
                disabledHours={() => [0,1,2,3,4,5,6,7,8,18,19,20,21,22,23]}
                required={true}
              />

              <Field
                label={t('custom-form')}
                fieldName='customForm'
                options={suggestedForms}
                component={SelectField}
              />

            </section>
            <footer className="modal-card-foot">
              <button className="button luma" type='submit' onClick={handleSubmit}>{t('save')}</button>
              <button className="button" onClick={close}>{t('close')}</button>
            </footer>
          </div>
        )
      }}
    </Formik>
  )
}

export default Form