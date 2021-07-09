import React from 'react'
import { Formik } from 'formik'
import format from 'date-fns/format'
import { Tooltip } from 'antd'
import TimePicker from '../Pickers/TimePicker'
import { add } from 'date-fns'

let selectedEvent
let eventPlatforms

const Form = ({ event, calculateVisitEndTime, validate, onSubmit }) => {
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
      onSubmit={(values) => onSubmit(values)}
    >
      {({ handleSubmit, handleChange, handleBlur, setFieldValue, touched, errors, values }) => {
        return (
          <>
            <div className="container">
              <div className="columns is-centered">
                <div className="section">
                  <div className="title">Varaa vierailu </div>
                  <div className="box">
                    <p className="subtitle"><strong>Vierailun tiedot</strong></p>
                    <p><strong>Nimi:</strong> {event.title}</p>
                    <p><strong>Kuvaus:</strong> {event.desc || 'Ei kuvausta'}</p>
                    <p><strong>Tiedeluokka:</strong> {eventClass}</p>
                    <div><strong>Tarjolla seuraaville luokka-asteille:</strong> {eventGrades}
                    </div>
                    <div><strong>Vierailu tarjolla: </strong>
                      {event.inPersonVisit ? 'Lähiopetuksena' : <></>}
                      {event.inPersonVisit && event.remoteVisit && ' ja etäopetuksena'}
                      {event.remoteVisit && !event.inPersonVisit? 'Etäopetuksena' : <></>}
                    </div>
                    <p><strong>Vierailun kesto:</strong> {event.duration} min</p>
                    <p><strong>Vierailun aikaisin alkamisaika:</strong> {format(event.start, 'd.M.yyyy, HH:mm')}</p>
                    <p><strong>Vierailun myöhäisin päättymisaika:</strong> {format(event.end, 'd.M.yyyy, HH:mm')}</p>
                  </div>

                  <br />
                  <h1 className="title">Syötä varauksen tiedot</h1>

                  <form onSubmit={handleSubmit} className="box luma">

                    {event.inPersonVisit && event.remoteVisit ? (
                      <div className="field">
                        <label className="label" id="radio-group">Valitse etä- tai lähiopetus</label>
                        <div className="control">
                          <label>
                            <input
                              type="radio" name="visitMode" value="1"
                              onChange={() => {
                                touched.visitMode = true
                                setFieldValue('visitMode', '1')
                              }} /> Etävierailu
                          </label>
                        </div>
                        <div className="control">
                          <label>
                            <input type="radio" name="visitMode" value="2"
                              onChange={() => {
                                touched.visitMode = true
                                setFieldValue('visitMode', '2')
                              }} /> Lähivierailu
                          </label>
                        </div>
                      </div>
                    ) : null}
                    {touched.clientName && errors.location ? (
                      <p className="help is-danger">{errors.location}</p>
                    ) : null}

                    {values.visitMode === '1' || (values.visitMode === '0' && event.remoteVisit && !event.inPersonVisit)
                      ?
                      <div className="field">
                        <label className="label" id="radio-group">Valitse haluamasi etäyhteysalusta</label>
                        {eventPlatforms.map((platform, index) => {
                          return (
                            <div key={index} className="control">
                              <label>
                                <input
                                  type="radio" name="remotePlatform" value={index}
                                  onChange={() => {
                                    touched.remotePlatform = true
                                    setFieldValue('remotePlatform', index.toString())
                                  }} /> {platform}
                              </label>
                            </div>
                          )
                        })}

                        <div className="control">
                          <label>
                            <input type="radio" name="remotePlatform" value={parseInt(eventPlatforms.length+1)}
                              onChange={() => {
                                touched.remotePlatform = true
                                setFieldValue('remotePlatform', parseInt(eventPlatforms.length+1))
                              }} /> Muu, mikä?
                            {values.remotePlatform === parseInt(eventPlatforms.length+1)
                              ?

                              <div className="field">

                                <div className="control">
                                  <input
                                    className="input"
                                    id="otherRemotePlatformOption"
                                    name="otherRemotePlatformOption"
                                    type="input"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.otherRemotePlatformOption}
                                  />
                                </div>

                                {touched.otherRemotePlatformOption && errors.otherRemotePlatformOption ? (
                                  <p className="help is-danger">{errors.otherRemotePlatformOption}</p>
                                ) : null}

                              </div>
                              : null}

                          </label>
                        </div>
                      </div>
                      :null }

                    <div className="field">
                      <label className="label" htmlFor="clientName">Varaajan nimi </label>
                      <div className="control">

                        <input
                          id="clientName"
                          name="clientName"
                          type="input"
                          className="input"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.clientName}
                        />
                      </div>
                    </div>
                    {touched.clientName && errors.clientName ? (
                      <p className="help is-danger">{errors.clientName}</p>
                    ) : null}

                    <div className="field">
                      <label className="label" htmlFor="schoolName">Oppimisyhteisön nimi </label>
                      <div className="control">
                        <input
                          id="schoolName"
                          name="schoolName"
                          type="input"
                          className="input"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.schoolName}
                        />
                      </div>
                    </div>
                    {touched.schoolName && errors.schoolName ? (
                      <p className="help is-danger">{errors.schoolName}</p>
                    ) : null}

                    <div className="field">
                      <label htmlFor="schoolLocation" className="label">Oppimisyhteisön paikkakunta </label>
                      <div className="control">
                        <input
                          id="schoolLocation"
                          name="schoolLocation"
                          type="input"
                          className="input"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.schoolLocation}
                        />
                      </div>
                    </div>
                    {touched.schoolLocation && errors.schoolLocation ? (
                      <p className="help is-danger">{errors.schoolLocation}</p>
                    ) : null}

                    <div className="field">
                      <label htmlFor="clientEmail" className="label">Varaajan sähköpostiosoite </label>
                      <div className="control">
                        <input
                          id="clientEmail"
                          name="clientEmail"
                          type="email"
                          className="input"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.clientEmail}
                        />
                      </div>
                      {touched.clientEmail && errors.clientEmail ? (
                        <p className="help is-danger">{errors.clientEmail}</p>
                      ) : null}
                    </div>

                    <div className="field">
                      <label htmlFor="verifyEmail" className="label">Sähköpostiosoite uudestaan </label>
                      <div className="control">
                        <input
                          id="verifyEmail"
                          name="verifyEmail"
                          type="email"
                          className="input"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.verifyEmail}
                        />
                      </div>
                      {touched.verifyEmail && errors.verifyEmail ? (
                        <p className="help is-danger">{errors.verifyEmail}</p>
                      ) : null}
                    </div>

                    <div className="field">
                      <label htmlFor="clientPhone" className="label">Varaajan puhelinnumero </label>
                      <div className="control">

                        <input
                          id="clientPhone"
                          name="clientPhone"
                          type="input"
                          className="input"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.clientPhone}
                        />
                      </div>
                    </div>
                    {touched.clientPhone && errors.clientPhone ? (
                      <p className="help is-danger">{errors.clientPhone}</p>
                    ) : null}
                    <hr></hr>
                    <div className="field is-grouped" style={{ justifyContent: 'space-between' }}>
                      <div className="field" style={{ width: 360 }}>
                        <label htmlFor="visitGrade" className="label">Luokka-aste/kurssi </label>
                        <div className="control">
                          <input
                            id="visitGrade"
                            name="visitGrade"
                            type="input"
                            className="input"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.visitGrade}
                          />
                        </div>
                      </div>
                      {touched.visitGrade && errors.visitGrade ? (
                        <p className="help is-danger">{errors.visitGrade}</p>
                      ) : null}

                      <div className="field">
                        <label htmlFor="participants" className="label">Osallistujamäärä </label>
                        <div className="control">
                          <input
                            id="participants"
                            name="participants"
                            type="number"
                            className="input"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.participants}
                          />
                        </div>
                      </div>
                      {touched.participants && errors.participants ? (
                        <p className="help is-danger">{errors.participants}</p>
                      ) : null}
                    </div>
                    {!!event.extras.length && (
                      <div className="field">
                        <label className="label" htmlFor="extras">Valitse haluamasi lisäpalvelut </label>

                        {event.extras.map(extra =>
                          <div className="control" key={extra.id}>
                            <label className="privacyPolicy" >
                              <input
                                type="checkbox"
                                checked={values.extras.includes(extra.id)}
                                onChange={() => {
                                  let newValueForExtras = values.extras
                                  if (values.extras.includes(extra.id)) {
                                    newValueForExtras = values.extras.filter(e => e !== extra.id)
                                    setFieldValue('extras', newValueForExtras)

                                  } else {
                                    newValueForExtras = values.extras.concat(extra.id)
                                    setFieldValue('extras', newValueForExtras)
                                  }
                                  const startTimeAsDate = (typeof values.startTime === 'object') ? values.startTime : new Date(selectedEvent.start)
                                  if (typeof values.startTime === 'string') {
                                    startTimeAsDate.setHours(values.startTime.slice(0,2))
                                    startTimeAsDate.setMinutes(values.startTime.slice(3,5))
                                  }
                                  const endTime = calculateVisitEndTime(startTimeAsDate, values, selectedEvent, newValueForExtras)
                                  setFieldValue('finalEndTime', endTime)
                                }}
                              />
                              {` ${extra.name}`}, pituus lähi: {extra.inPersonLength} min / etä: {extra.remoteLength} min
                            </label>
                          </div>
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

                    <div className="field">
                      <div id="checkbox-group"></div>
                      <div className="control">
                        <label className="privacyPolicy">
                          <input
                            type="checkbox" name="privacyPolicy" checked = {values.privacyPolicy}
                            onChange={() => {
                              touched.privacyPolicy = !values.privacyPolicy
                              setFieldValue('privacyPolicy', !values.privacyPolicy)
                            }} /> Hyväksyn, että tietoni tallennetaan ja käsitellään <a href="https://www2.helsinki.fi/fi/tiedekasvatus/tietosuojailmoitus-opintokaynnit" target="_blank" rel="noopener noreferrer">tietosuojailmoituksen</a> mukaisesti.
                        </label>
                      </div>
                    </div>
                    {touched.privacyPolicy && errors.privacyPolicy ? (
                      <p className="help is-danger">{errors.privacyPolicy}</p>
                    ) : null}

                    <div className="field">
                      <div id="checkbox-group"></div>
                      <div className="control">
                        <label className="dataUseAgreement">
                          <input
                            type="checkbox" name="dataUseAgreement" checked = {values.dataUseAgreement}
                            onChange={() => {
                              touched.dataUseAgreement = !values.dataUseAgreement
                              setFieldValue('dataUseAgreement', !values.dataUseAgreement)
                            }} /> Hyväksyn, että antamiani tietoja voidaan hyödyntää tutkimuskäytössä.
                        </label>
                      </div>
                    </div>

                    <div className="field">
                      <div id="checkbox-group"></div>
                      <div className="control">
                        <label className="remoteVisitGuidelines">
                          <input
                            type="checkbox" name="remoteVisitGuidelines" checked = {values.remoteVisitGuidelines}
                            onChange={() => {
                              touched.remoteVisitGuidelines = !values.remoteVisitGuidelines
                              setFieldValue('remoteVisitGuidelines', !values.remoteVisitGuidelines)
                            }} /> Olen lukenut <a href="https://www2.helsinki.fi/fi/tiedekasvatus/opettajille-ja-oppimisyhteisoille/varaa-opintokaynti">opintokäyntien ohjeistuksen</a> ja hyväksyn käytänteet.
                        </label>
                      </div>
                    </div>
                    {touched.remoteVisitGuidelines && errors.remoteVisitGuidelines ? (
                      <p className="help is-danger">{errors.remoteVisitGuidelines}</p>
                    ) : null}

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
