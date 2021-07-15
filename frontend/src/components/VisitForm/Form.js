import React from 'react'
import { Formik, Field } from 'formik'
import format from 'date-fns/format'
import { Tooltip } from 'antd'
import TimePicker from '../Pickers/TimePicker'
import { add } from 'date-fns'
import { CheckBox, RadioButton, TextField } from './FormFields'
import InfoBox from './InfoBox'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

let selectedEvent
let eventPlatforms

const Form = ({ event, calculateVisitEndTime, validate, onSubmit }) => {
  const { t } = useTranslation(['visit', 'common'])
  const history = useHistory()
  selectedEvent = event

  const grades = [
    { value: 1, label: t('common:early-education') },
    { value: 2, label: t('common:1-2') },
    { value: 3, label: t('common:3-6') },
    { value: 4, label: t('common:7-9') },
    { value: 5, label: t('common:second-degree') }
  ]

  const filterEventGrades = (eventGrades) => {
    const gradesArrays = eventGrades.map(g => grades[g-1].label)
    return gradesArrays.join(', ')
  }

  const classes = [
    { value: 1, label: 'SUMMAMUTIKKA', description: t('common:mathematic') },
    { value: 2, label: 'FOTONI', description: t('common:physics') },
    { value: 3, label: 'LINKKI', description: t('common:computer-science') },
    { value: 4, label: 'GEOPISTE', description: t('common:geography') },
    { value: 5, label: 'GADOLIN', description: t('common:chemistry') }
  ]

  const filterEventClass = (eventClasses) => {
    return eventClasses.map(c =>
      <Tooltip key={c} color={'geekblue'} title={classes[c-1].description}>
        <span className='tag is-small'>{classes[c-1].label}</span>
      </Tooltip>
    )
  }

  const platformList = [
    { value: 1, label: 'Zoom' },
    { value: 2, label: 'Google Meet' },
    { value: 3, label: 'Microsoft Teams' },
    { value: 4, label: '' }
  ]

  const filterEventPlatforms = (platforms, otherOption) => {
    if (otherOption) platformList[3].label = otherOption
    const platformArray = platforms.map(c => platformList[c-1].label)
    return platformArray
  }

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  const eventGrades = filterEventGrades(event.grades)
  const eventClass = filterEventClass(event.resourceids)
  eventPlatforms = filterEventPlatforms(event.remotePlatforms, event.otherRemotePlatformOption)
  return (
    <Formik
      initialValues={{
        clientName: '',
        schoolName: '',
        visitMode: '0',
        startTime: new Date(event.start),
        endTime: event.end,
        schoolLocation: '',
        clientEmail: '',
        verifyEmail: '',
        clientPhone: '',
        visitGrade: '',
        participants: '',
        privacyPolicy: false,
        remoteVisitGuidelines: false,
        dataUseAgreement: false,
        extras: [],
        remotePlatform: '0',
        otherRemotePlatformOption: '',
        finalEndTime: new Date(add(event.start, { minutes: event.duration }))
      }}
      validate={(values) => validate(values, selectedEvent, eventPlatforms)}
      onSubmit={(values) => onSubmit(values, eventPlatforms)}
    >
      {({ handleSubmit, handleBlur, setFieldValue, touched, errors, values }) => {

        return (
          <>
            <div className="container">
              <div className="columns is-centered">
                <div className="section">
                  <InfoBox event={event} eventClass={eventClass} eventGrades={eventGrades} />
                  <h1 className="title">{t('give-info')}</h1>

                  <form onSubmit={handleSubmit} className="box luma">

                    {event.inPersonVisit && event.remoteVisit ? (
                      <>
                        <label className="label">{t('choose-type')}</label>
                        <Field
                          label={t('remote')}
                          id='visitMode'
                          onChange={() => setFieldValue('visitMode', '1')}
                          component={RadioButton}
                        />
                        <Field
                          label={t('inperson')}
                          id='visitMode'
                          onChange={() => setFieldValue('visitMode', '2')}
                          component={RadioButton}
                        />
                      </>
                    ) : null}
                    {touched.clientName && errors.location ? (
                      <p className="help is-danger">{errors.location}</p>
                    ) : null}

                    {values.visitMode === '1' || (values.visitMode === '0' && event.remoteVisit && !event.inPersonVisit) ?
                      <>
                        <label className="label" id="radio-group">{t('choose-remote-platform')}</label>
                        {eventPlatforms.map((platform, index) => {
                          return (
                            <Field
                              key={index}
                              id='remotePlatform'
                              label={platform}
                              onChange={() => setFieldValue('remotePlatform', index.toString())}
                              component={RadioButton}
                            />
                          )
                        })}

                        <div className="control">
                          <Field
                            id='remotePlatform'
                            label={t('other-what')}
                            onChange={() => setFieldValue('remotePlatform', parseInt(eventPlatforms.length+1))}
                            component={RadioButton}
                          />

                          {values.remotePlatform === parseInt(eventPlatforms.length + 1) ?
                            <Field
                              component={TextField}
                              fieldName='otherRemotePlatformOption'
                            /> : null
                          }
                        </div>
                      </>
                      :null
                    }

                    <Field component={TextField} label={t('client-name')} fieldName='clientName' />

                    <Field component={TextField} label={t('community-name')} fieldName='schoolName' />

                    <Field component={TextField} label={t('community-location')} fieldName='schoolLocation' />

                    <Field component={TextField} label={t('client-email')} fieldName='clientEmail' />

                    <Field component={TextField} label={t('email-confirm')} fieldName='verifyEmail' />

                    <Field component={TextField} label={t('client-phone')} fieldName='clientPhone' />

                    <hr></hr>
                    <div className="field is-grouped" style={{ justifyContent: 'space-between' }}>

                      <Field component={TextField} style={{ width: 360 }} label={t('grade')} fieldName='visitGrade' />

                      <Field component={TextField} type='number' label={t('participants')} fieldName='participants' />

                    </div>

                    {!!event.extras.length && (
                      <div className="field">
                        <label className="label" htmlFor="extras">{t('choose-extras')}</label>

                        {event.extras.map(extra =>
                          <Field
                            key={extra.id}
                            component={CheckBox}
                            onChange={() => {
                              let newValueForExtras = values.extras
                              if (values.extras.includes(extra.id)) newValueForExtras = values.extras.filter(e => e !== extra.id)
                              else newValueForExtras = values.extras.concat(extra.id)
                              setFieldValue('extras', newValueForExtras)
                              const startTimeAsDate = (typeof values.startTime === 'object') ? values.startTime : new Date(selectedEvent.start)
                              if (typeof values.startTime === 'string') {
                                startTimeAsDate.setHours(values.startTime.slice(0,2))
                                startTimeAsDate.setMinutes(values.startTime.slice(3,5))
                              }
                              const endTime = calculateVisitEndTime(startTimeAsDate, values, selectedEvent, newValueForExtras)
                              setFieldValue('finalEndTime', endTime)
                            }}
                            label={` ${extra.name}, ${t('length-inperson')} ${extra.inPersonLength} ${t('minutes-remote')} ${extra.remoteLength} ${t('minutes')}`}
                          />
                        )}
                      </div>
                    )}

                    {touched.extras && errors.startTime ? (
                      <p className="help is-danger">{t('check-timeslot')}</p>
                    ) : null}
                    <label htmlFor="startTime" className="label">
                      {t('start-and-timeslot')} {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')})
                    </label>
                    <div className="field is-grouped level">
                      <div className="control">
                        <TimePicker
                          className={`input ${touched.startTime
                            ? errors.startTime
                              ? 'is-danger'
                              : 'is-success'
                            : ''
                          }`}
                          value={values.startTime}
                          onChange={value => {
                            setFieldValue('startTime', value)
                            const endTime = calculateVisitEndTime(value, values, selectedEvent, values.extras)
                            setFieldValue('finalEndTime', endTime)
                          }}
                          onBlur={handleBlur}/>
                      </div>
                      <span>- {format(new Date(values.finalEndTime), 'HH:mm')}</span>
                    </div>
                    {touched.startTime && errors.startTime ? (
                      <p className="help is-danger">{errors.startTime}</p>
                    ) : null}

                    <hr></hr>

                    <Field
                      label={
                        <label>
                          {t('accept-privacy-policy1')} <a href="https://www2.helsinki.fi/fi/tiedekasvatus/tietosuojailmoitus-opintokaynnit" target="_blank" rel="noopener noreferrer">{t('privacy-policy')}</a> {t('accept-privacy-policy2')}.
                        </label>
                      }
                      className='privacyPolicy'
                      fieldName='privacyPolicy'
                      style={{ marginBottom: 7 }}
                      component={CheckBox}
                    />
                    <Field
                      label={t('accept-data-use')}
                      fieldName='dataUseAgreement'
                      style={{ marginBottom: 7 }}
                      component={CheckBox}
                    />
                    <Field
                      label={
                        <label>
                          {t('accept-instructions1')} <a href="https://www2.helsinki.fi/fi/tiedekasvatus/opettajille-ja-oppimisyhteisoille/varaa-opintokaynti">{t('instructions')}</a> {t('accept-instructions2')}.
                        </label>
                      }
                      style={{ marginBottom: 7 }}
                      className='remoteVisitGuidelines'
                      fieldName='remoteVisitGuidelines'
                      component={CheckBox}
                    />

                    <button id="create" className="button luma primary" type='submit'>{t('book-event')}</button>
                    <button className="button luma" onClick={cancel}>{t('to-calendar')}</button>

                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      }

    </Formik>
  )
}


export default Form
