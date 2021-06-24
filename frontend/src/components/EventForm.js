import React, { useEffect, useState } from 'react'
import { useFormik, FormikProvider } from 'formik'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_EVENT, TAGS } from '../graphql/queries'
import { useHistory } from 'react-router'
import LumaTagInput from './LumaTagInput/LumaTagInput'
import moment from 'moment'

const validate = (values) => {
  const defErrorMessage = 'Vaaditaan!'
  const errors = {}
  const startTime = new Date(`${values.date}T${values.startTime}`)
  const endTime = new Date(`${values.date}T${values.endTime}`)

  if (!values.title) {
    errors.title = defErrorMessage
  }

  if (!values.grades.includes(true)) {
    errors.grades = 'Valitse vähintään yksi luokka-aste'
  }

  if (!values.scienceClass.includes(true)) {
    errors.scienceClass = 'Valitse vähintään yksi tiedeluokka'
  }

  if(!values.remotePlatforms.includes(true)){
    errors.remotePlatforms = 'Valitse vähintään yksi etäyhteysalusta'
  }
  if(!values.otherRemotePlatformOption){
    errors.otherRemotePlatformOption = 'Kirjoita muun etäyhteysalustan nimi'
  }

  if (!(values.remoteVisit || values.inPersonVisit)) {
    errors.location = 'Valitse joko etä- tai lähivierailu'
  }

  if (String(values.date) === 'Invalid date') {
    errors.date = defErrorMessage
  }

  if (String(startTime) === 'Invalid Date') {
    errors.startTime = 'Päivämäärä ja kellonaika vaaditaan'
  } else if (!values.startTime) {
    errors.startTime = defErrorMessage
  } else if (startTime.getHours() < 8 || startTime.getHours() > 16) {
    errors.startTime = 'Aloitusajan pitää olla klo 08:00 ja 16:00 välillä'
  }

  if (String(endTime) === 'Invalid Date') {
    errors.endTime = 'Päivämäärä ja kellonaika vaaditaan'
  } else if (!values.endTime) {
    errors.endTime = defErrorMessage
  } else if (startTime > endTime) {
    errors.endTime = 'Lopetusajan pitää olla aloitusajan jälkeen'
  } else if (endTime.getHours() > 16 && endTime.getMinutes() !== 0) {
    errors.endTime = 'Lopetusaika saa olla korkeintaan 17.00'
  }

  return errors
}

const EventForm = ({
  sendMessage,
  addEvent,
  newEventTimeRange = [null, null],
  closeEventForm,
}) => {
  const history = useHistory()
  const [suggestedTags, setSuggestedTags] = useState([])
  const [create, result] = useMutation(CREATE_EVENT, {
    onError: (error) => console.log(error),
  })
  const tags = useQuery(TAGS)

  useEffect(() => {
    if (tags.data) {
      setSuggestedTags(tags.data.getTags.map((tag) => tag.name))
    }
  }, [tags.data])

  useEffect(() => {
    if (result.data) {

      result.data.booked = false
      addEvent(result.data.createEvent)
      sendMessage('Vierailu luotu', 'success')
      history.push('/')
    }
  }, [result.data])




  const formik = useFormik({
    initialValues: {
      grades: [false,false,false,false,false],
      remoteVisit: true,
      inPersonVisit: true,
      remotePlatforms: [true,true,true,false],
      otherRemotePlatformOption: '',
      title: '',
      scienceClass: [false,false,false,false,false],
      desc: '',
      date: moment(newEventTimeRange[0]).format('YYYY-MM-DD'),
      startTime: moment(newEventTimeRange[0]).format('HH:mm'),
      endTime: moment(newEventTimeRange[1]).format('HH:mm'),
      tags: [],
      waitingTime: 15
    },
    validate,
    onSubmit: (values) => {
      const start = new Date(`${values.date}T${values.startTime}`)
      const end = new Date(`${values.date}T${values.endTime}`)
      const gradelist = []
      values.grades.forEach((element,index) => {
        if(element){
          gradelist.push(index + 1)
        }
      } )
      const scienceClassList = []
      values.grades.forEach((element,index) => {
        if(element){
          scienceClassList.push(index + 1)
        }
      } )

      const remotePlatformList = []
      values.remotePlatforms.forEach((element,index) => {
        if(element){
          remotePlatformList.push(index + 1)
        }
      } )


      create({


        variables: {
          grades: gradelist,
          remoteVisit: values.remoteVisit,
          inPersonVisit: values.inPersonVisit,
          title: values.title,
          start,
          end,
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
          waitingTime: values.waitingTime
        },
      })


      alert(JSON.stringify(values, null, 2))
    },
  })

  const style = { width: 500 }

  return (
    <div className="section">
      <div className="columns is-centered">
        <div className="section luma-eventform">
          <div className="title">Luo uusi vierailu</div>
          <form onSubmit={formik.handleSubmit}>
            <div className="field">
              <label className="label" htmlFor="title">
                Tapahtuman nimi{' '}
              </label>
              <div className="control">
                <input
                  className="input"
                  style={style}
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

            <FormikProvider value={formik}>
              <LumaTagInput
                label="Tagit"
                tags={formik.values.tags}
                setTags={(tags) => {
                  formik.setFieldValue('tags', tags)
                }}
                suggestedTags={suggestedTags}
                style={style}
              />
            </FormikProvider>

            <div className="field">
              <div id="checkbox-group">Valitse etä- ja/tai lähivierailu</div>
              <div className="control">
                <label className="checkbox1">
                  <input
                    type="checkbox" name="remoteVisit" checked = {formik.values.remoteVisit}
                    onChange={() => {
                      formik.touched.remoteVisit = true
                      formik.setFieldValue('remoteVisit', !formik.values.remoteVisit)
                    }} />
                  Etävierailu
                </label>
              </div>
              <div className="control">
                <label className="checkbox1">
                  <input type="checkbox" name="inPersonVisit" checked={formik.values.inPersonVisit}
                    onChange={() => {
                      formik.touched.inPersonVisit = true
                      formik.setFieldValue('inPersonVisit', !formik.values.inPersonVisit)
                    }
                    } />
                  Lähivierailu
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
                <div id="checkbox-group">Valitse etäyhteysalusta(t)</div>
                <div className="control">
                  <label className="remotePlatforms">
                    <input
                      type="checkbox"  value="0" checked = {formik.values.remotePlatforms[0]}
                      onChange={() => {
                        formik.touched.remotePlatforms = true
                        formik.values.remotePlatforms[0] = !formik.values.remotePlatforms[0]
                        formik.setFieldValue('remotePlatforms', [formik.values.remotePlatforms[0],formik.values.remotePlatforms[1],formik.values.remotePlatforms[2],formik.values.remotePlatforms[3]])

                      }} />
                  Zoom
                  </label>
                </div>
                <div className="control">
                  <label className="remotePlatforms">
                    <input type="checkbox" value="1" checked = {formik.values.remotePlatforms[1]}
                      onChange={() => {
                        formik.touched.remotePlatforms = true

                        formik.values.remotePlatforms[1] = !formik.values.remotePlatforms[1]
                        formik.setFieldValue('remotePlatforms', [formik.values.remotePlatforms[0],formik.values.remotePlatforms[1],formik.values.remotePlatforms[2],formik.values.remotePlatforms[3]])



                      }
                      } />
                  Google Meet
                  </label>
                </div>
                <div className="control">
                  <label className="remotePlatforms">
                    <input type="checkbox" value="2" checked = {formik.values.remotePlatforms[2]}
                      onChange={() => {
                        formik.touched.remotePlatforms = true

                        formik.values.remotePlatforms[2] = !formik.values.remotePlatforms[2]
                        formik.setFieldValue('remotePlatforms', [formik.values.remotePlatforms[0],formik.values.remotePlatforms[1],formik.values.remotePlatforms[2],formik.values.remotePlatforms[3]])



                      }
                      } />
                  Microsoft Teams
                  </label>
                </div>
                <div className="control">
                  <label className="remotePlatforms">
                    <input type="checkbox" value="3" checked = {formik.values.remotePlatforms[3]}
                      onChange={() => {
                        formik.touched.remotePlatforms = true
                        formik.values.remotePlatforms[3] = !formik.values.remotePlatforms[3]
                        formik.setFieldValue('remotePlatforms', [formik.values.remotePlatforms[0],formik.values.remotePlatforms[1],formik.values.remotePlatforms[2],formik.values.remotePlatforms[3]])
                      }
                      } />
                  Muu, mikä?
                    {formik.values.remotePlatforms[3]
                      ?

                      <div className="field">

                        <div className="control">
                          <input
                            className="input"
                            style={{ width: 300 }}
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
              <div id="checkbox-group">Valitse vierailulle sopivat tiedeluokat</div>
              <div className="control">
                <label className="checkbox3">
                  <input
                    type="checkbox"  value="0"
                    onChange={() => {
                      formik.touched.scienceClass = true
                      formik.values.scienceClass[0] = !formik.values.scienceClass[0]
                    }} />
                  SUMMAMUTIKKA
                </label>
              </div>
              <div className="control">
                <label className="checkbox3">
                  <input type="checkbox" value="1"
                    onChange={() => {
                      formik.touched.scienceClass = true
                      formik.values.scienceClass[1] = !formik.values.scienceClass[1]
                    }
                    } />
                  FOTONI
                </label>
              </div>
              <div className="control">
                <label className="checkbox3">
                  <input type="checkbox" value="2"
                    onChange={() => {
                      formik.touched.scienceClass = true
                      formik.values.scienceClass[2] = !formik.values.scienceClass[2]


                    }
                    } />
                  LINKKI
                </label>
              </div>

              <div className="control">
                <label className="checkbox3">
                  <input type="checkbox" value="3"
                    onChange={() => {
                      formik.touched.scienceClass = true
                      formik.values.scienceClass[3] = !formik.values.scienceClass[3]


                    }
                    } />
                  GEOPISTE
                </label>
              </div>

              <div className="control">
                <label className="checkbox3">
                  <input type="checkbox" value="4"
                    onChange={() => {
                      formik.touched.scienceClass = true
                      formik.values.scienceClass[4] = !formik.values.scienceClass[4]


                    }
                    } />
                  GADOLIN
                </label>
              </div>

            </div>

            {formik.touched.scienceClass && formik.errors.scienceClass
              ?
              <p className="help is-danger">{formik.errors.scienceClass}</p>
              : null}







            <div className="field">
              <div id="checkbox-group">Valitse vierailulle sopivat luokka-asteet</div>
              <div className="control">
                <label className="checkbox2">
                  <input
                    type="checkbox"  value="0"
                    onChange={() => {
                      formik.touched.grades = true
                      formik.values.grades[0] = !formik.values.grades[0]
                    }} />
                  Varhaiskasvatus
                </label>
              </div>
              <div className="control">
                <label className="checkbox2">
                  <input type="checkbox" value="1"
                    onChange={() => {
                      formik.touched.grades = true

                      formik.values.grades[1] = !formik.values.grades[1]


                    }
                    } />
                  1.-2. luokka
                </label>
              </div>
              <div className="control">
                <label className="checkbox2">
                  <input type="checkbox" value="2"
                    onChange={() => {
                      formik.touched.grades = true

                      formik.values.grades[2] = !formik.values.grades[2]


                    }
                    } />
                  3.-6. luokka
                </label>
              </div>

              <div className="control">
                <label className="checkbox2">
                  <input type="checkbox" value="3"
                    onChange={() => {
                      formik.touched.grades = true

                      formik.values.grades[3] = !formik.values.grades[3]


                    }
                    } />
                  7.-9. luokka
                </label>
              </div>

              <div className="control">
                <label className="checkbox2">
                  <input type="checkbox" value="4"
                    onChange={() => {
                      formik.touched.grades = true

                      formik.values.grades[4] = !formik.values.grades[4]


                    }
                    } />
                  toinen aste
                </label>
              </div>

            </div>

            {formik.touched.grades && formik.errors.grades
              ?
              <p className="help is-danger">{formik.errors.grades}</p>
              : null}




            <div className="field">
              <label className="label" htmlFor="date">
                Päivämäärä
              </label>
              <div className="control">
                <input
                  className={`input ${
                    formik.touched.date
                      ? formik.errors.date
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                  }`}
                  style={style}
                  id="date"
                  name="date"
                  type="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.date}
                />
              </div>
            </div>
            {formik.touched.date && formik.errors.date ? (
              <p className="help is-danger">{formik.errors.date}</p>
            ) : null}

            <div className="field">
              <label className="label" htmlFor="startTime">
                Aloituskellonaika
              </label>
              <div className="control">
                <input
                  className={`input ${
                    formik.touched.startTime
                      ? formik.errors.startTime
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                  }`}
                  style={style}
                  id="startTime"
                  name="startTime"
                  type="time"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.startTime}
                />
              </div>
            </div>
            {formik.touched.startTime && formik.errors.startTime ? (
              <p className="help is-danger">{formik.errors.startTime}</p>
            ) : null}

            <div className="field">
              <label className="label" htmlFor="endTime">
                Lopetuskellonaika
              </label>
              <div className="control">
                <input
                  className={`input ${
                    formik.touched.endTime
                      ? formik.errors.endTime
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                  }`}
                  style={style}
                  id="endTime"
                  name="endTime"
                  type="time"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.endTime}
                />
              </div>
            </div>

            {formik.touched.endTime && formik.errors.endTime ? (
              <p className="help is-danger">{formik.errors.endTime}</p>
            ) : null}

            <div className="field">
              <label className="label" htmlFor="endTime">
                Minimiaika varausten välillä
              </label>
              <div className="control">
                <input
                  className={`input ${
                    formik.touched.waitingTime
                      ? formik.errors.waitingTime
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                  }`}
                  style={{ width: 300 }}
                  id="waitingTime"
                  name="waitingTime"
                  type="number"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.waitingTime}
                />
              </div>
            </div>

            {formik.touched.endTime && formik.errors.endTime ? (
              <p className="help is-danger">{formik.errors.endTime}</p>
            ) : null}

            <div className="field">
              <label className="label" htmlFor="desc">
                Kuvaus
              </label>
              <div className="control">
                <textarea
                  className={`textarea ${
                    formik.touched.desc
                      ? formik.errors.desc
                        ? 'is-danger'
                        : 'is-success'
                      : ''
                  }`}
                  style={style}
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
