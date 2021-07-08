import React, { useEffect, useState } from 'react'
import { useFormik, FormikProvider } from 'formik'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_EVENT, TAGS, EXTRAS } from '../graphql/queries'
import { useHistory } from 'react-router'
import LumaTagInput from './LumaTagInput/LumaTagInput'
import DatePicker from './Pickers/DatePicker'
import addDays from 'date-fns/addDays'
import set from 'date-fns/set'
import TimePicker from './Pickers/TimePicker'

const validate = (values) => {
  const defErrorMessage = 'Täytä tämä kenttä.'
  const errors = {}

  if (!values.title) {
    errors.title = defErrorMessage
  }

  if (!values.grades.includes(true)) {
    errors.grades = 'Valitse vähintään yksi luokka-aste.'
  }

  if (!values.scienceClass.includes(true)) {
    errors.scienceClass = 'Valitse vähintään yksi tiedeluokka.'
  }

  if(!values.remotePlatforms.includes(true) && values.remoteVisit){
    errors.remotePlatforms = 'Valitse vähintään yksi etäyhteysalusta.'
  }
  if(!values.otherRemotePlatformOption && values.remotePlatforms[3] && values.remoteVisit){
    errors.otherRemotePlatformOption = 'Kirjoita muun etäyhteysalustan nimi.'
  }

  if (!(values.remoteVisit || values.inPersonVisit)) {
    errors.location = 'Valitse joko etä- tai lähivierailu.'
  }

  if (!values.startTime) {
    errors.startTime = defErrorMessage
  } else if (values.startTime.getHours() < 8 || values.startTime.getHours() > 16) {
    errors.startTime = 'Aloitusajan pitää olla klo 08:00 ja 16:00 välillä.'
  }

  if (!values.endTime) {
    errors.endTime = defErrorMessage
  } else if (values.startTime > values.endTime) {
    errors.endTime = 'Lopetusajan pitää olla aloitusajan jälkeen.'
  } else if (values.endTime.getHours() > 16 && values.endTime.getMinutes() !== 0) {
    errors.endTime = 'Lopetusaika saa olla korkeintaan 17.00.'
  }

  return errors
}

const EventForm = ({
  sendMessage,
  addEvent,
  newEventTimeRange = null,
  closeEventForm,
}) => {
  const history = useHistory()
  const [suggestedTags, setSuggestedTags] = useState([])
  const [create] = useMutation(CREATE_EVENT, {
    onError: () => { sendMessage('Vierailun luonti epäonnistui! Tarkista tiedot!', 'danger')},
    onCompleted: (data) => {
      data.createEvent.booked = false
      addEvent(data.createEvent)
      sendMessage('Vierailu luotu.', 'success')
      history.push('/')
    }
  })
  const tags = useQuery(TAGS)
  const extras = useQuery(EXTRAS)

  useEffect(() => {
    if (tags.data) {
      setSuggestedTags(tags.data.getTags.map((tag) => tag.name))
    }
  }, [tags.data])

  useEffect(() => { }, [extras.data])

  const defaultDateTime = set(addDays(new Date(), 14), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 })

  const formik = useFormik({
    initialValues: {
      grades: [false, false, false, false, false],
      remoteVisit: true,
      inPersonVisit: true,
      title: '',
      scienceClass: [false, false, false, false, false],
      desc: '',
      remotePlatforms: [true,true,true,false],
      otherRemotePlatformOption: '',
      date: newEventTimeRange ? newEventTimeRange[0] : defaultDateTime,
      startTime: newEventTimeRange ? newEventTimeRange[0] : set(defaultDateTime, { hours: 8 }),
      endTime: newEventTimeRange ? newEventTimeRange[1] : set(defaultDateTime, { hours: 16 }),
      tags: [],
      waitingTime: 15,
      extras: [],
      duration: 60
    },
    validate,
    onSubmit: (values) => {
      const gradelist = []
      values.grades.forEach((element, index) => {
        if (element) {
          gradelist.push(index + 1)
        }
      })
      const scienceClassList = []
      values.scienceClass.forEach((element, index) => {
        if (element) {
          scienceClassList.push(index + 1)
        }
      })

      const remotePlatformList = []
      values.remotePlatforms.forEach((element,index) => {
        if(element){
          remotePlatformList.push(index + 1)
        }
      })

      create({
        variables: {
          grades: gradelist,
          remoteVisit: values.remoteVisit,
          inPersonVisit: values.inPersonVisit,
          title: values.title,
          start: values.startTime.toISOString(),
          end: values.endTime.toISOString(),
          remotePlatforms: remotePlatformList,
          otherRemotePlatformOption: values.otherRemotePlatformOption,
          scienceClass: scienceClassList,
          desc: values.desc,
          tags: values.tags.map((tag) =>
            Object({
              id: tags.data.getTags.find((t) => t.name === tag)?.id || null,
              name: tag,
            })
          ),
          waitingTime: values.waitingTime,
          extras: values.extras,
          duration: values.duration
        },
      })
    },
  })

  return (
    <div className="columns is-centered">
      <div className="box luma-eventform">
        <div className="box">
          <div className="title">Luo uusi vierailu</div>
          <form onSubmit={formik.handleSubmit}>
            <div className="field">
              <label className="label" htmlFor="title">
                Vierailun nimi{' '}
              </label>
              <div className="control">
                <input
                  className="input"
                  id="title"
                  name="title"
                  type="title"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.title}
                />
              </div>
            </div>
            {formik.touched.title && formik.errors.title ? (
              <p className="help is-danger">{formik.errors.title}</p>
            ) : null}

            <div className="field">
              <label className="label" htmlFor="duration">
                Vierailun kesto minuutteina
              </label>
              <div className="control">
                <input
                  className="input"
                  id="duration"
                  name="duration"
                  type="number"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.duration}
                />
              </div>
            </div>
            {formik.touched.duration && formik.errors.duration ? (
              <p className="help is-danger">{formik.errors.duration}</p>
            ) : null}

            <FormikProvider value={formik}>
              <LumaTagInput
                label="Tagit"
                tags={formik.values.tags}
                setTags={(tags) => {
                  formik.setFieldValue('tags', tags)
                }}
                suggestedTags={suggestedTags}
              />
            </FormikProvider>

            <div className="block">
              <label className="label" id="checkbox-group">
                Valitse etä- ja/tai lähivierailu
              </label>
              <div className="control">
                <label className="checkbox">
                  <input
                    type="checkbox" name="remoteVisit" checked={formik.values.remoteVisit}
                    onChange={() => {
                      formik.touched.remoteVisit = true

                      formik.setFieldValue('remoteVisit', !formik.values.remoteVisit)
                    }} /> Etävierailu
                </label>
              </div>
              <div className="control">
                <label className="checkbox">
                  <input type="checkbox" name="inPersonVisit" checked={formik.values.inPersonVisit}
                    onChange={() => {
                      formik.touched.inPersonVisit = true

                      formik.setFieldValue('inPersonVisit', !formik.values.inPersonVisit)
                    }
                    } /> Lähivierailu
                </label>
              </div>
            </div>
            {formik.touched.inPersonVisit && formik.touched.remoteVisit && formik.errors.location
              ?
              <p className="help is-danger">{formik.errors.location}</p>
              : null}

            {formik.values.remoteVisit
              ?
              <div className="field">
                <div  className="label" id="checkbox-group">Valitse etäyhteysalusta(t)</div>
                <div className="control">
                  <label className="checkbox">
                    <input
                      type="checkbox"  value="0" checked = {formik.values.remotePlatforms[0]}
                      onChange={() => {
                        formik.touched.remotePlatforms = true
                        formik.values.remotePlatforms[0] = !formik.values.remotePlatforms[0]
                        formik.setFieldValue('remotePlatforms', [formik.values.remotePlatforms[0],formik.values.remotePlatforms[1],formik.values.remotePlatforms[2],formik.values.remotePlatforms[3]])

                      }} /> Zoom
                  </label>
                </div>
                <div className="control">
                  <label className="checkbox">
                    <input type="checkbox" value="1" checked = {formik.values.remotePlatforms[1]}
                      onChange={() => {
                        formik.touched.remotePlatforms = true

                        formik.values.remotePlatforms[1] = !formik.values.remotePlatforms[1]
                        formik.setFieldValue('remotePlatforms', [formik.values.remotePlatforms[0],formik.values.remotePlatforms[1],formik.values.remotePlatforms[2],formik.values.remotePlatforms[3]])

                      }} /> Google Meet
                  </label>
                </div>
                <div className="control">
                  <label className="checkbox">
                    <input type="checkbox" value="2" checked = {formik.values.remotePlatforms[2]}
                      onChange={() => {
                        formik.touched.remotePlatforms = true

                        formik.values.remotePlatforms[2] = !formik.values.remotePlatforms[2]
                        formik.setFieldValue('remotePlatforms', [formik.values.remotePlatforms[0],formik.values.remotePlatforms[1],formik.values.remotePlatforms[2],formik.values.remotePlatforms[3]])

                      }} /> Microsoft Teams
                  </label>
                </div>
                <div className="control">
                  <label className="checkbox">
                    <input type="checkbox" value="3" checked = {formik.values.remotePlatforms[3]}
                      onChange={() => {
                        formik.touched.remotePlatforms = true
                        formik.values.remotePlatforms[3] = !formik.values.remotePlatforms[3]
                        formik.setFieldValue('remotePlatforms', [formik.values.remotePlatforms[0],formik.values.remotePlatforms[1],formik.values.remotePlatforms[2],formik.values.remotePlatforms[3]])
                      }} /> Muu, mikä?
                    {formik.values.remotePlatforms[3]
                      ?

                      <div className="field">

                        <div className="control">
                          <input
                            className="input"
                            id="otherRemotePlatformOption"
                            name="otherRemotePlatformOption"
                            type="otherRemotePlatformOption"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.otherRemotePlatformOption}
                          />
                        </div>
                      </div>
                      : null}
                    {formik.values.remotePlatforms[3] && formik.touched.otherRemotePlatformOption && formik.errors.otherRemotePlatformOption ? (
                      <p className="help is-danger">{formik.errors.otherRemotePlatformOption}</p>
                    ) : null}

                  </label>
                </div>


                {formik.touched.remotePlatforms && formik.errors.remotePlatforms
                  ?
                  <p className="help is-danger">{formik.errors.remotePlatforms}</p>
                  : null}

              </div>


              : null}


            <div className="field">
              <label className="label" id="checkbox-group">
                Valitse vierailulle sopivat luokka-asteet
              </label>
              <div className="control">
                <label className="checkbox2">
                  <input
                    type="checkbox" value="0"
                    onChange={() => {
                      formik.touched.grades = true

                      formik.values.grades[0] = !formik.values.grades[0]
                    }} /> Varhaiskasvatus
                </label>
              </div>
              <div className="control">
                <label className="checkbox2">
                  <input type="checkbox" value="1"
                    onChange={() => {
                      formik.touched.grades = true

                      formik.values.grades[1] = !formik.values.grades[1]
                    }
                    } /> 1.-2. luokka
                </label>
              </div>
              <div className="control">
                <label className="checkbox2">
                  <input type="checkbox" value="2"
                    onChange={() => {
                      formik.touched.grades = true

                      formik.values.grades[2] = !formik.values.grades[2]
                    }
                    } /> 3.-6. luokka
                </label>
              </div>

              <div className="control">
                <label className="checkbox2">
                  <input type="checkbox" value="3"
                    onChange={() => {
                      formik.touched.grades = true

                      formik.values.grades[3] = !formik.values.grades[3]
                    }
                    } /> 7.-9. luokka
                </label>
              </div>

              <div className="control">
                <label className="checkbox2">
                  <input type="checkbox" value="4"
                    onChange={() => {
                      formik.touched.grades = true

                      formik.values.grades[4] = !formik.values.grades[4]
                    }
                    } /> toinen aste
                </label>
              </div>

            </div>

            {formik.touched.grades && formik.errors.grades
              ?
              <p className="help is-danger">{formik.errors.grades}</p>
              : null}

            <div className="field">
              <label className="label" id="checkbox-group">
                Valitse vierailulle sopivat tiedeluokat
              </label>
              <div className="control">
                <label className="checkbox3">
                  <input
                    type="checkbox" value="0"
                    onChange={() => {
                      formik.touched.scienceClass = true

                      formik.values.scienceClass[0] = !formik.values.scienceClass[0]
                    }} /> SUMMAMUTIKKA
                </label>
              </div>
              <div className="control">
                <label className="checkbox3">
                  <input type="checkbox" value="1"
                    onChange={() => {
                      formik.touched.scienceClass = true

                      formik.values.scienceClass[1] = !formik.values.scienceClass[1]
                    }
                    } /> FOTONI
                </label>
              </div>
              <div className="control">
                <label className="checkbox3">
                  <input type="checkbox" value="2"
                    onChange={() => {
                      formik.touched.scienceClass = true

                      formik.values.scienceClass[2] = !formik.values.scienceClass[2]
                    }
                    } /> LINKKI
                </label>
              </div>

              <div className="control">
                <label className="checkbox3">
                  <input type="checkbox" value="3"
                    onChange={() => {
                      formik.touched.scienceClass = true

                      formik.values.scienceClass[3] = !formik.values.scienceClass[3]
                    }
                    } /> GEOPISTE
                </label>
              </div>

              <div className="control">
                <label className="checkbox3">
                  <input type="checkbox" value="4"
                    onChange={() => {
                      formik.touched.scienceClass = true

                      formik.values.scienceClass[4] = !formik.values.scienceClass[4]
                    }
                    } /> GADOLIN
                </label>
              </div>
            </div>

            {formik.touched.scienceClass && formik.errors.scienceClass
              ?
              <p className="help is-danger">{formik.errors.scienceClass}</p>
              : null}

            <div className="field" >
              <label className="label">
                Valitse vierailulle sopivat lisäpalvelut
              </label>
              {extras.data && extras.data.getExtras

                .map(extra => <div key={extra.id}><div className="control">
                  <label className="checkbox4">
                    <input type="checkbox" value="extras"
                      onChange={() => {
                        if (formik.values.extras.includes(extra.id)) {
                          const index = formik.values.extras.indexOf(extra.id)
                          formik.values.extras.splice(index, 1)
                        } else {
                          formik.values.extras.push(extra.id)
                        }
                      }
                      } /> {extra.name}, pituus lähi: {extra.inPersonLength} min / etä: {extra.remoteLength} min
                    {/* {(extra.remoteLength > 0) ? <p>(tarjolla etävierailuihin, kesto {extra.remoteLength} minuuttia)</p> : null}
                    {(extra.inPersonLength > 0) ? <p>(tarjolla lähivierailuihin, kesto {extra.inPersonLength} minuuttia)</p> : null} */}
                  </label>
                </div></div>)}
            </div>
            <div className="field is-grouped luma">
              <div className="field">
                <label className="label" htmlFor="date">
                Päivämäärä
                </label>
                <div className="control">
                  <DatePicker
                    className={`input ${formik.touched.date
                      ? formik.errors.date
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                    }`}
                    format={'d.M.yyyy'}
                    value={formik.values.date}
                    onChange={value => {
                      const date = value.getDate()
                      const month = value.getMonth()
                      const year = value.getFullYear()
                      const newStartTime = set(formik.values.startTime, { year, month, date })
                      const newEndTime = set(formik.values.endTime, { year, month, date })
                      formik.setFieldValue('startTime', newStartTime)
                      formik.setFieldValue('endTime', newEndTime)
                      formik.setFieldValue('date', value)
                    }}
                    onBlur={formik.handleBlur}/>
                </div>
                {formik.touched.date && formik.errors.date ? (
                  <p className="help is-danger">{formik.errors.date}</p>
                ) : null}
              </div>

              <div className="field">
                <label className="label" htmlFor="startTime">
                Aloituskellonaika
                </label>
                <div className="control">
                  <TimePicker
                    className={`input ${formik.touched.startTime
                      ? formik.errors.startTime
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                    }`}
                    value={formik.values.startTime}
                    onChange={value => formik.setFieldValue('startTime', value)}
                    onBlur={formik.handleBlur}/>
                </div>
                {formik.touched.startTime && formik.errors.startTime ? (
                  <p className="help is-danger">{formik.errors.startTime}</p>
                ) : null}
              </div>

              <div className="field">
                <label className="label" htmlFor="endTime">
                Lopetuskellonaika
                </label>
                <div className="control">
                  <TimePicker
                    className={`input ${formik.touched.endTime
                      ? formik.errors.endTime
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                    }`}
                    disabledHours={() => [0,1,2,3,4,5,6,7,18,19,20,21,22,23]}
                    value={formik.values.endTime}
                    onChange={value => formik.setFieldValue('endTime', value)}
                    onBlur={formik.handleBlur}/>
                </div>
                {formik.touched.endTime && formik.errors.endTime ? (
                  <p className="help is-danger">{formik.errors.endTime}</p>
                ) : null}
              </div>

              <div className="field">
                <label className="label" htmlFor="endTime">
                Minimiaika varausten välillä
                </label>
                <div className="control">
                  <input
                    className={`input ${formik.touched.waitingTime
                      ? formik.errors.waitingTime
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                    }`}
                    id="waitingTime"
                    name="waitingTime"
                    type="number"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.waitingTime}
                  />
                </div>
                {formik.touched.waitingTime && formik.errors.waitingTime ? (
                  <p className="help is-danger">{formik.errors.waitingTime}</p>
                ) : null}
              </div>

            </div>
            <div className="field">
              <label className="label" htmlFor="desc">
                Kuvaus
              </label>
              <div className="control">
                <textarea
                  className={`textarea ${formik.touched.desc
                    ? formik.errors.desc
                      ? 'is-danger'
                      : 'is-success'
                    : ''
                  }`}
                  id="desc"
                  name="desc"
                  placeholder="Kirjoita tähän lyhyt kuvaus vierailusta."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.desc}
                ></textarea>
              </div>
            </div>
            {formik.touched.desc && formik.errors.desc ? (
              <p className="help is-danger">{formik.errors.desc}</p>
            ) : null}

            <button id="create" className="button luma primary" type="submit">
              Tallenna
            </button>
            <button
              className="button luma"
              onClick={closeEventForm}
            >
              Poistu
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default EventForm