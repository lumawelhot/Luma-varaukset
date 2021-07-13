import React, { useEffect, useState } from 'react'
import { Field, Formik } from 'formik'
import { useQuery } from '@apollo/client'
import { TAGS, EXTRAS } from '../../graphql/queries'
import LumaTagInput from '../LumaTagInput/LumaTagInput'
import addDays from 'date-fns/addDays'
import set from 'date-fns/set'
import { TextArea, TextField } from '../VisitForm/FormFields'
import { AdditionalServices, DatePick, EventType, Grades, Platforms, ScienceClasses, TimePick } from './FormComponents'

const EventForm = ({ newEventTimeRange = null, closeEventForm, validate, onSubmit }) => {
  const [suggestedTags, setSuggestedTags] = useState([])
  const tags = useQuery(TAGS)
  const extras = useQuery(EXTRAS)

  useEffect(() => {
    if (tags.data) setSuggestedTags(tags.data.getTags.map(tag => tag.name))
  }, [tags.data])

  const defaultDateTime = set(addDays(new Date(), 14), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 })

  return (
    <Formik
      initialValues= {{
        grades: [false, false, false, false, false],
        remoteVisit: true,
        inPersonVisit: true,
        title: '',
        scienceClass: [false, false, false, false, false],
        desc: '',
        remotePlatforms: [true, true, true, false],
        otherRemotePlatformOption: '',
        date: newEventTimeRange ? newEventTimeRange[0] : defaultDateTime,
        startTime: newEventTimeRange ? newEventTimeRange[0] : set(defaultDateTime, { hours: 8 }),
        endTime: newEventTimeRange ? newEventTimeRange[1] : set(defaultDateTime, { hours: 16 }),
        tags: [],
        waitingTime: 15,
        extras: [],
        duration: 60
      }}
      validate={validate}
      onSubmit={(values) => onSubmit(values, tags)}
    >
      {({ handleSubmit, setFieldValue, touched, errors, values }) => {
        return (
          <div className="columns is-centered">
            <div className="box luma-eventform">
              <div className="box">
                <div className="title">Luo uusi vierailu</div>
                <form onSubmit={handleSubmit}>
                  <Field
                    label='Vierailun nimi'
                    fieldName='title'
                    component={TextField}
                  />

                  <Field
                    label='Vierailun kesto minuutteina'
                    fieldName='duration'
                    type='number'
                    component={TextField}
                  />

                  <LumaTagInput
                    label="Tagit"
                    tags={values.tags}
                    setTags={tags => setFieldValue('tags', tags)}
                    suggestedTags={suggestedTags}
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
                      label='Aloituskellonaika'
                      fieldName='startTime'
                      component={TimePick}
                    />

                    <Field
                      label='Lopetuskellonaika'
                      fieldName='endTime'
                      component={TimePick}
                      disabledHours={() => [0,1,2,3,4,5,6,7,18,19,20,21,22,23]}
                    />

                    <Field
                      label='Minimiaika varausten välillä'
                      fieldName='waitingTime'
                      type='number'
                      className={`input ${touched.waitingTime
                        ? errors.waitingTime
                          ? 'is-danger'
                          : 'is-success'
                        : ''
                      }`}
                      component={TextField}
                    />

                  </div>

                  <Field
                    label='Kuvaus'
                    fieldName='desc'
                    className={`textarea ${touched.desc
                      ? errors.desc
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                    }`}
                    placeholder='Kirjoita tähän lyhyt kuvaus vierailusta.'
                    component={TextArea}
                  />

                  {touched.desc && errors.desc ? (
                    <p className="help is-danger">{errors.desc}</p>
                  ) : null}

                  <button id="create" className="button luma primary" type="submit">
                    Tallenna
                  </button>
                  <button className="button luma" onClick={closeEventForm} >
                    Poistu
                  </button>
                </form>
              </div>
            </div>
          </div>
        )

      }}
    </Formik>
  )

}

export default EventForm