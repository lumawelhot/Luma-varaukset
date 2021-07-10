import React from 'react'
import { Formik, Field } from 'formik'
import format from 'date-fns/format'
import { Tooltip } from 'antd'
import TimePicker from '../Pickers/TimePicker'
import { add } from 'date-fns'
import { CheckBox, RadioButton, TextField } from './FormFields'
import InfoBox from './InfoBox'
import { useHistory } from 'react-router-dom'

let selectedEvent
let eventPlatforms

const Form = ({ event, calculateVisitEndTime, validate, onSubmit }) => {
  const history = useHistory()
  selectedEvent = event

  const grades = [
    { value: 1, label: 'Varhaiskasvatus' },
    { value: 2, label: '1.-2. luokka' },
    { value: 3, label: '3.-6. luokka' },
    { value: 4, label: '7.-9 luokka' },
    { value: 5, label: 'toinen aste' }
  ]

  const filterEventGrades = (eventGrades) => {
    const gradesArrays = eventGrades.map(g => grades[g-1].label)
    return gradesArrays.join(', ')
  }

  const classes = [
    { value: 1, label: 'SUMMAMUTIKKA', description: 'Matematiikka' },
    { value: 2, label: 'FOTONI', description: 'Fysiikka' },
    { value: 3, label: 'LINKKI', description: 'Tietojenkäsittelytiede' },
    { value: 4, label: 'GEOPISTE', description: 'Maantiede' },
    { value: 5, label: 'GADOLIN', description: 'Kemia' }
  ]

  const filterEventClass = (eventClasses) => {
    return eventClasses.map(c =>
      <Tooltip key={c} color={'geekblue'} title={classes[c-1].description}>
        <span className='tag is-small'>{classes[c-1].label}</span>
      </Tooltip>)
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
                  <h1 className="title">Syötä varauksen tiedot</h1>

                  <form onSubmit={handleSubmit} className="box luma">

                    {event.inPersonVisit && event.remoteVisit ? (
                      <>
                        <label className="label">Valitse etä- tai lähiopetus</label>
                        <Field
                          label='Etävierailu'
                          id='visitMode'
                          onChange={() => setFieldValue('visitMode', '1')}
                          component={RadioButton}
                        />
                        <Field
                          label='Lähivierailu'
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
                        <label className="label" id="radio-group">Valitse haluamasi etäyhteysalusta</label>
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
                            label='Muu, mikä?'
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

                    <Field component={TextField} label='Varaajan nimi' fieldName='clientName' />

                    <Field component={TextField} label='Oppimisyhteisön nimi' fieldName='schoolName' />

                    <Field component={TextField} label='Oppimisyhteisön paikkakunta' fieldName='schoolLocation' />

                    <Field component={TextField} label='Varaajan sähköpostiosoite' fieldName='clientEmail' />

                    <Field component={TextField} label='Sähköpostiosoite uudestaan' fieldName='verifyEmail' />

                    <Field component={TextField} label='Varaajan puhelinnumero' fieldName='clientPhone' />

                    <hr></hr>
                    <div className="field is-grouped" style={{ justifyContent: 'space-between' }}>

                      <Field component={TextField} style={{ width: 360 }} label='Luokka-aste/kurssi' fieldName='visitGrade' />

                      <Field component={TextField} type='number' label='Osallistujamäärä ' fieldName='participants' />

                    </div>

                    {!!event.extras.length && (
                      <div className="field">
                        <label className="label" htmlFor="extras">Valitse haluamasi lisäpalvelut </label>

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
                            label={` ${extra.name}, pituus lähi: ${extra.inPersonLength} min / etä: ${extra.remoteLength} min`}
                          />
                        )}
                      </div>
                    )}

                    {touched.extras && errors.startTime ? (
                      <p className="help is-danger">Tarkista että varaus lisäpalveluineen mahtuu annettuihin aikarajoihin!</p>
                    ) : null}
                    <label htmlFor="startTime" className="label">
                  Syötä varauksen alkamisaika (aikaikkuna: {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')})
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
                           Hyväksyn, että tietoni tallennetaan ja käsitellään <a href="https://www2.helsinki.fi/fi/tiedekasvatus/tietosuojailmoitus-opintokaynnit" target="_blank" rel="noopener noreferrer">tietosuojailmoituksen</a> mukaisesti.
                        </label>
                      }
                      className='privacyPolicy'
                      fieldName='privacyPolicy'
                      style={{ marginBottom: 7 }}
                      component={CheckBox}
                    />
                    <Field
                      label='Hyväksyn, että antamiani tietoja voidaan hyödyntää tutkimuskäytössä.'
                      fieldName='dataUseAgreement'
                      style={{ marginBottom: 7 }}
                      component={CheckBox}
                    />
                    <Field
                      label={
                        <label>
                          Olen lukenut <a href="https://www2.helsinki.fi/fi/tiedekasvatus/opettajille-ja-oppimisyhteisoille/varaa-opintokaynti">opintokäyntien ohjeistuksen</a> ja hyväksyn käytänteet.
                        </label>
                      }
                      style={{ marginBottom: 7 }}
                      className='remoteVisitGuidelines'
                      fieldName='remoteVisitGuidelines'
                      component={CheckBox}
                    />

                    <button id="create" className="button luma primary" type='submit'>Tallenna</button>
                    <button className="button luma" onClick={cancel}>Poistu</button>

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
