import React, { useEffect, useState } from 'react'
import { Field, Formik } from 'formik'
import { useQuery } from '@apollo/client'
import { TAGS, EXTRAS } from '../../graphql/queries'
import LumaTagInput from '../LumaTagInput/LumaTagInput'
import DatePicker from '../Pickers/DatePicker'
import addDays from 'date-fns/addDays'
import set from 'date-fns/set'
import TimePicker from '../Pickers/TimePicker'
import { CheckBox, TextArea, TextField } from '../VisitForm/FormFields'

const EventForm = ({ newEventTimeRange = null, closeEventForm, validate, onSubmit }) => {
  const [suggestedTags, setSuggestedTags] = useState([])
  const tags = useQuery(TAGS)
  const extras = useQuery(EXTRAS)

  useEffect(() => {
    if (tags.data) {
      setSuggestedTags(tags.data.getTags.map((tag) => tag.name))
    }
  }, [tags.data])

  const defaultDateTime = set(addDays(new Date(), 14), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 })

  const platformList = [
    { id: 0, label: 'Zoom' },
    { id: 1, label: 'Google Meet' },
    { id: 2, label: 'Microsoft Teams' },
    { id: 3, label: 'Muu, mikä?' }
  ]

  const gradesList = [
    { id: 0, label: 'Varhaiskasvatus' },
    { id: 1, label: '1.-2. luokka' },
    { id: 2, label: '3.-6. luokka' },
    { id: 3, label: '7.-9. luokka' },
    { id: 4, label: 'toinen aste' }
  ]

  const resourceList = [
    { id: 0, label: 'SUMMAMUTIKKA' },
    { id: 1, label: 'FOTONI' },
    { id: 2, label: 'LINKKI' },
    { id: 3, label: 'GEOPISTE' },
    { id: 4, label: 'GADOLIN' }
  ]

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
      {({ handleSubmit, handleBlur, setFieldValue, touched, errors, values }) => {
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
                    setTags={(tags) => {
                      setFieldValue('tags', tags)
                    }}
                    suggestedTags={suggestedTags}
                  />

                  <label className="label" id="checkbox-group">
                      Valitse etä- ja/tai lähivierailu
                  </label>
                  <Field
                    label='Etävierailu'
                    fieldName='remoteVisit'
                    component={CheckBox}
                  />
                  <Field
                    label='Lähivierailu'
                    fieldName='inPersonVisit'
                    component={CheckBox}
                  />

                  {touched.inPersonVisit && touched.remoteVisit && errors.location ?
                    <p className="help is-danger">{errors.location}</p> : null
                  }

                  {values.remoteVisit ?
                    <>
                      <div className="label" id="checkbox-group">Valitse etäyhteysalusta(t)</div>
                      {platformList.map(platform => (
                        <Field
                          key={platform.label}
                          label={platform.label}
                          fieldName='remotePlatforms'
                          index={platform.id}
                          onChange={() => {
                            touched.remotePlatforms = true
                            values.remotePlatforms[platform.id] = !values.remotePlatforms[platform.id]
                            setFieldValue('remotePlatforms', values.remotePlatforms)
                          }}
                          component={CheckBox}
                        />
                      ))}

                      {values.remotePlatforms[3] ?
                        <Field
                          fieldName='otherRemotePlatformOption'
                          component={TextField}
                        /> : null
                      }

                      {touched.remotePlatforms && errors.remoteError ?
                        <p className="help is-danger">{errors.remoteError}</p> : null
                      }

                    </> : null
                  }

                  <label className="label" id="checkbox-group">
                    Valitse vierailulle sopivat luokka-asteet
                  </label>

                  {gradesList.map(grade => (
                    <Field
                      className='checkbox2'
                      key={grade.label}
                      label={grade.label}
                      fieldName='grades'
                      index={grade.id}
                      onChange={() => {
                        touched.grades = true
                        values.grades[grade.id] = !values.grades[grade.id]
                        setFieldValue('grades', values.grades)
                      }}
                      component={CheckBox}
                    />
                  ))}

                  {touched.grades && errors.gradesError ?
                    <p className="help is-danger">{errors.gradesError}</p> : null
                  }

                  <label className="label" id="checkbox-group">
                    Valitse vierailulle sopivat tiedeluokat
                  </label>

                  {resourceList.map(resource => (
                    <Field
                      key={resource.label}
                      label={resource.label}
                      fieldName='scienceClass'
                      index={resource.id}
                      onChange={() => {
                        touched.scienceClass = true
                        values.scienceClass[resource.id] = !values.scienceClass[resource.id]
                        setFieldValue('scienceClass', values.scienceClass)
                      }}
                      component={CheckBox}
                    />
                  ))}

                  {touched.scienceClass && errors.scienceClassError ?
                    <p className="help is-danger">{errors.scienceClassError}</p> : null
                  }

                  <label className="label">
                      Valitse vierailulle sopivat lisäpalvelut
                  </label>
                  {extras.data && extras.data.getExtras
                    .map(extra => (
                      <Field
                        key={extra.id}
                        label={`${extra.name}, pituus lähi: ${extra.inPersonLength} min / etä: ${extra.remoteLength} min`}
                        onChange={() => {
                          if (values.extras.includes(extra.id)) {
                            const index = values.extras.indexOf(extra.id)
                            values.extras.splice(index, 1)
                          } else {
                            values.extras.push(extra.id)
                          }
                        }}
                        component={CheckBox}
                      />
                    ))
                  }

                  <div className="field is-grouped luma">
                    <div className="field">
                      <label className="label" htmlFor="date">
                        Päivämäärä
                      </label>
                      <div className="control">
                        <DatePicker
                          className={`input ${touched.date
                            ? errors.date
                              ? 'is-danger'
                              : 'is-success'
                            : ''
                          }`}
                          format={'d.M.yyyy'}
                          value={values.date}
                          onChange={value => {
                            const date = value.getDate()
                            const month = value.getMonth()
                            const year = value.getFullYear()
                            const newStartTime = set(values.startTime, { year, month, date })
                            const newEndTime = set(values.endTime, { year, month, date })
                            setFieldValue('startTime', newStartTime)
                            setFieldValue('endTime', newEndTime)
                            setFieldValue('date', value)
                          }}
                          onBlur={handleBlur}
                        />
                      </div>
                      {touched.date && errors.date ? (
                        <p className="help is-danger">{errors.date}</p>
                      ) : null}
                    </div>

                    <div className="field">
                      <label className="label" htmlFor="startTime">
                        Aloituskellonaika
                      </label>
                      <div className="control">
                        <TimePicker
                          className={`input ${touched.startTime
                            ? errors.startTime
                              ? 'is-danger'
                              : 'is-success'
                            : ''
                          }`}
                          value={values.startTime}
                          onChange={value => setFieldValue('startTime', value)}
                          onBlur={handleBlur}/>
                      </div>
                      {touched.startTime && errors.startTime ? (
                        <p className="help is-danger">{errors.startTime}</p>
                      ) : null}
                    </div>

                    <div className="field">
                      <label className="label" htmlFor="endTime">
                        Lopetuskellonaika
                      </label>
                      <div className="control">
                        <TimePicker
                          className={`input ${touched.endTime
                            ? errors.endTime
                              ? 'is-danger'
                              : 'is-success'
                            : ''
                          }`}
                          disabledHours={() => [0,1,2,3,4,5,6,7,18,19,20,21,22,23]}
                          value={values.endTime}
                          onChange={value => setFieldValue('endTime', value)}
                          onBlur={handleBlur}/>
                      </div>
                      {touched.endTime && errors.endTime ? (
                        <p className="help is-danger">{errors.endTime}</p>
                      ) : null}
                    </div>

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