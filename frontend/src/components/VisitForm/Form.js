import React from 'react'
import { Formik, Field } from 'formik'
import format from 'date-fns/format'
import { Space, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import TimePicker from '../Pickers/TimePicker'
import { add } from 'date-fns'
import { CheckBox, RadioButton, TextField } from './FormFields'
import InfoBox from './InfoBox'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CustomForm from './CustomForm'
import CountDown from '../CountDown'
import { useMutation } from '@apollo/client'
import { UNLOCK_EVENT } from '../../graphql/queries'
import { classes } from '../../helpers/classes'

let selectedEvent
let eventPlatforms

const Form = ({ event, calculateVisitEndTime, validate, onSubmit, customFormFields }) => {
  const { t } = useTranslation(['visit', 'common'])
  const history = useHistory()
  const [unlockEvent] = useMutation(UNLOCK_EVENT, {
    onError: (error) => console.log(error)
  })
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

  const filterEventClass = (eventClasses) => {
    return eventClasses.map(c =>
      <Tooltip key={c} title={t('common:' + classes[c-1].i18n) }>
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

  const cancel = (e) => {
    e.preventDefault()
    unlockEvent({
      variables: {
        event: event.id
      }
    })
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
        finalEndTime: new Date(add(event.start, { minutes: event.duration })),
        language: event.languages[0]
      }}
      validate={(values) => validate(values, selectedEvent, eventPlatforms)}
      onSubmit={(values) => {
        onSubmit(values, eventPlatforms)
      }
      }
    >
      {({ handleSubmit, handleBlur, setFieldValue, touched, errors, values }) => {

        return (
          <>
            <div className="container">
              <div className="columns is-centered">
                <div className="section">
                  <CountDown />
                  <InfoBox event={event} eventClass={eventClass} eventGrades={eventGrades} />
                  <h1 className="title">{t('give-info')}</h1>

                  <form onSubmit={handleSubmit} className="box luma">

                    {event.languages.length > 1 && (
                      <>
                        <label className="label">{t('choose-language')}</label>
                        {event.languages.map(lang =>
                          <Field
                            key={lang}
                            id='language'
                            label={t(lang)}
                            onChange={() => setFieldValue('language', lang)}
                            checked={values.language === lang}
                            component={RadioButton}
                          />
                        )}
                      </>
                    )}

                    {event.inPersonVisit && event.remoteVisit ? (
                      <>
                        <label className="label">{t('choose-type')}<span style={{ color: 'red' }}> *</span></label>
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
                        <label className="label" id="radio-group">{t('choose-remote-platform')}<span style={{ color: 'red' }}> *</span></label>
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

                    <Field component={TextField} label={t('client-name')} fieldName='clientName' required={true}/>

                    <Field component={TextField} label={t('community-name')} fieldName='schoolName' required={true}/>

                    <Field component={TextField} label={t('community-location')} fieldName='schoolLocation' required={true}/>

                    <Field component={TextField} label={t('client-email')} fieldName='clientEmail' required={true}/>

                    <Field component={TextField} label={t('email-confirm')} fieldName='verifyEmail' required={true}/>

                    <Field component={TextField} label={t('client-phone')} fieldName='clientPhone' required={true}/>

                    <hr></hr>
                    <div className="field is-grouped" style={{ justifyContent: 'space-between' }}>

                      <Field component={TextField} style={{ width: 360 }} label={t('grade')} fieldName='visitGrade' required={true}/>

                      <Field component={TextField} type='number' label={t('participants')} fieldName='participants' required={true}/>

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
                      <span style={{ color: 'red' }}> *</span>
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
                      <Space direction="horizontal">
                        <span>- {format(new Date(values.finalEndTime), 'HH:mm')}</span>
                        <Tooltip title={t('endtime-calculation-info')}>
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    </div>
                    {touched.startTime && errors.startTime ? (
                      <p className="help is-danger">{errors.startTime}</p>
                    ) : null}
                    {!!customFormFields &&
                    <>
                      <hr></hr>
                      <CustomForm customFormFields={customFormFields}/>
                    </>}
                    <hr></hr>

                    <Field
                      label={
                        <label>
                          {t('accept-privacy-policy1')} <a href="https://www.helsinki.fi/fi/tiedekasvatus/tietoa-meista" target="_blank" rel="noreferrer">{t('privacy-policy')}</a> {t('accept-privacy-policy2')}.
                          <span style={{ color: 'red' }}> *</span>
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
                      inject={
                        <Tooltip title={t('data-agreement-info')}>
                          <InfoCircleOutlined />
                        </Tooltip>
                      }
                    />
                    <Field
                      label={
                        <label>
                          {t('accept-instructions1')} <a href="https://www.helsinki.fi/fi/tiedekasvatus/opettajille-ja-opetuksen-tueksi/opintokaynnit-ja-lainattavat-tarvikkeet" target="_blank" rel="noreferrer">{t('instructions')}</a> {t('accept-instructions2')}.
                          <span style={{ color: 'red' }}> *</span>
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
