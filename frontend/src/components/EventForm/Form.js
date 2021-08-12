import React, { useEffect, useState } from 'react'
import { Field, Formik } from 'formik'
import { useQuery } from '@apollo/client'
import { EXTRAS, GET_ALL_FORMS } from '../../graphql/queries'
import LumaTagInput from '../LumaTagInput/LumaTagInput'
import { TextArea, TextField } from '../VisitForm/FormFields'
import { AdditionalServices, DatePick, EventType, Grades, Platforms, ScienceClasses, TimePick, SelectField } from './FormComponents'
import { useTranslation } from 'react-i18next'
import { eventInitialValues, createGradeList, createPlatformList, createResourceList } from '../../helpers/form'

const EventForm = ({ newEventTimeRange = null, closeEventForm, validate, onSubmit, event, tags }) => {
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
      initialValues= {event ? {
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
        duration: event.duration,
        waitingTime: event.waitingTime,
        date: new Date(event.eventStart)
      } : eventInitialValues(newEventTimeRange)}
      validate={validate}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, setFieldValue, touched, errors, values }) => {
        return (
          <div className="modal-card" style={{ width: 'fit-content' }}>
            <header className="modal-card-head">
              <p className="modal-card-title">{t('create-new-event')}</p>
              <button className="delete" aria-label="close" onClick={closeEventForm}></button>
            </header>
            <section className="modal-card-body">
              <Field
                label={t('visit-name')}
                fieldName='title'
                component={TextField}
                required={true}
              />

              <Field
                label={t('event-length-minutes')}
                fieldName='duration'
                type='number'
                component={TextField}
                required={true}
              />

              <LumaTagInput
                label={t('tags')}
                tags={values.tags}
                setTags={tags => setFieldValue('tags', tags)}
                prompt={t('tag')}
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

              <div className="field is-grouped luma">

                <Field component={DatePick} />

                <Field
                  label={t('start-time')}
                  fieldName='startTime'
                  component={TimePick}
                />

                <Field
                  label={t('end-time')}
                  fieldName='endTime'
                  component={TimePick}
                  disabledHours={() => [0,1,2,3,4,5,6,7,18,19,20,21,22,23]}
                />

                <Field
                  label={t('waiting-time')}
                  fieldName='waitingTime'
                  type='number'
                  className={`input ${touched.waitingTime
                    ? errors.waitingTime
                      ? 'is-danger'
                      : 'is-success'
                    : ''
                  }`}
                  component={TextField}
                  required={true}
                />

              </div>

              <Field
                label={t('description')}
                fieldName='desc'
                className={`textarea ${touched.desc
                  ? errors.desc
                    ? 'is-danger'
                    : 'is-success'
                  : ''
                }`}
                placeholder={t('description-placeholder')}
                component={TextArea}
              />

              {touched.desc && errors.desc ? (
                <p className="help is-danger">{errors.desc}</p>
              ) : null}

              <Field
                label={t('custom-form')}
                fieldName='customForm'
                options={suggestedForms}
                component={SelectField}
              />
            </section>
            <footer className="modal-card-foot">
              <button className="button luma" type='submit' onClick={handleSubmit}>{t('create')}</button>
              <button className="button" onClick={closeEventForm}>{t('close')}</button>
            </footer>
          </div>
        )

      }}
    </Formik>
  )

}

export default EventForm