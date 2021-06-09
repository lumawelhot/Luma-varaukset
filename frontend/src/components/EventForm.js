import React, { useEffect, useState } from 'react'
import { useFormik, FormikProvider } from 'formik'
import Message from './Message'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_EVENT, TAGS } from '../graphql/queries'
import { useHistory } from 'react-router'
import LumaTagInput from './LumaTagInput/LumaTagInput'
import moment from 'moment'

const validate = values => {

  const defErrorMessage = 'Vaaditaan!'
  const errors = {}

  if (!values.title) {
    errors.title = defErrorMessage
  }

  if (!values.scienceClass) {
    errors.scienceClass = defErrorMessage
  }

  if (!values.date) {
    errors.date = defErrorMessage
  }

  if (!values.startTime) {
    errors.startTime = defErrorMessage
  }

  if (!values.endTime) {
    errors.endTime = defErrorMessage
  }

  return errors
}

const EventForm = ({ sendMessage, addEvent, newEventTimeRange=[null,null], closeEventForm }) => {
  const history = useHistory()
  const [suggestedTags, setSuggestedTags] = useState([])
  const [showDropdownMenu, setShowDropdownMenu] = useState(false)
  const [create, result] = useMutation(CREATE_EVENT, {
    onError: (error) => console.log(error)
  })
  const tags = useQuery(TAGS)

  useEffect(() => {
    if (tags.data) {
      setSuggestedTags(tags.data.getTags.map(tag => tag.name))
    }
  }, [tags.data])

  useEffect(() => {
    if (result.data) {
      console.log(result.data)
      addEvent(result.data.createEvent)
      sendMessage('Vierailu luotu')
      history.push('/')
    }
  }, [result.data])

  const options = [
    { value: 1, label:'Varhaiskasvatus'  },
    { value: 2, label: '1.-2. luokka' },
    { value: 3, label: '3.-6. luokka' },
    { value: 4, label:'7.-9 luokka' },
    { value: 5, label:  'toinen aste' }
  ]

  const toggleItem = (item, formikValues) => {
    if (formikValues.includes(item)) {
      return formikValues.filter(e => e !== item)
    } else {
      return formikValues.concat(item)
    }
  }

  const formik = useFormik({
    initialValues: {
      grades: [],
      title: '',
      scienceClass: '',
      desc: '',
      date: moment(newEventTimeRange[0]).format('YYYY-MM-DD'),
      startTime: moment(newEventTimeRange[0]).format('HH:mm'),
      endTime: moment(newEventTimeRange[1]).format('HH:mm'),
      tags: []
    },
    validate,
    onSubmit: values => {
      const start = new Date(`${values.date}:${values.startTime}`)
      const end = new Date(`${values.date}:${values.endTime}`)
      create({
        variables: {
          grades: values.grades,
          title: values.title,
          start,
          end,
          scienceClass: values.scienceClass,
          desc: values.desc,
          tags: values.tags.map(tag =>
            Object(
              {
                id: tags.data.getTags.find(t => t.name === tag)?.id || null,
                name: tag
              }
            )
          )
        }
      })
      console.log(tags.data.getTags)
      alert(JSON.stringify(values, null, 2))
    },
  })

  return (
    <div className="section">
      <div className="columns is-centered">
        <div className="section luma-eventform">
          <div className="title">Luo uusi vierailu</div>
          <form onSubmit={formik.handleSubmit}>
            <div className="field">

              <label htmlFor="title">Tapahtuman nimi </label>
              <div className="control">

                <input style={{ width: 300 }}
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
              <Message message={formik.errors.title} />
            ) : null}

            <FormikProvider value={formik}>
              <LumaTagInput
                label='Tagit'
                tags={formik.values.tags}
                setTags={(tags) => {formik.setFieldValue('tags',  tags)}}
                suggestedTags={suggestedTags}
                style={{ width: 300 }}
              />
            </FormikProvider>

            <div className="field">

              <div htmlFor="grade">Luokka-aste </div>
              <FormikProvider value={formik}>
                <div className={`dropdown ${showDropdownMenu && 'is-active'}`}>
                  <div role="button" aria-haspopup="true" className="dropdown-trigger">
                    <button type="button"
                      className={`button ${formik.values.grades.length ? 'is-success' : 'is-danger'}`}
                      onClick={() => setShowDropdownMenu(!showDropdownMenu)}
                    >
                      <span>Valittu ({formik.values.grades.length})</span>
                      <span className="icon">
                        <i className="fas fa-angle-down"></i>
                      </span>
                    </button>
                  </div>
                  <div className="dropdown-menu" style={{ display: showDropdownMenu ? 'block' : 'none' }}>
                    <div role="list" className="dropdown-content">
                      {options.map(option => (
                        <a
                          key={option.value}
                          role="listitem"
                          tabIndex="0"
                          className={`dropdown-item ${formik.values.grades.includes(option.value) && 'is-active'}`}
                          onClick={() => {
                            const newValues = [...toggleItem(option.value, formik.values.grades)]
                            formik.setFieldValue('grades',  newValues)
                          }
                          }
                        >
                          <span>{option.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </FormikProvider>
            </div>
            {formik.touched.grade && formik.errors.grade ? (
              <Message message={formik.errors.grade} />
            ) : null}


            <div className="field">

              <label htmlFor="scienceClass">Tiedeluokka </label>
              <div className="control">
                <FormikProvider value={formik}>
                  <select
                    id="scienceClass"
                    name="scienceClass"
                    value={formik.values.scienceClass}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{ display: 'block', width: 300 }}
                  ><option value="" label="Valitse tiedeluokka" />
                    <option value="SUMMAMUTIKKA" label="SUMMAMUTIKKA" />
                    <option value="FOTONI" label="FOTONI" />
                    <option value="LINKKI" label="LINKKI" />
                    <option value="GEOPISTE" label="GEOPISTE" />
                    <option value="GADOLIN" label="GADOLIN" />
                  </select>


                </FormikProvider>
              </div>
            </div>
            {formik.touched.scienceClass && formik.errors.scienceClass ? (
              <Message message={formik.errors.scienceClass} />
            ) : null}


            <div className="field">

              <label htmlFor="date">Päivämäärä </label>
              <div className="control">

                <input style={{ width: 300 }}
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
              <Message message={formik.errors.date} />
            ) : null}

            <div className="field">

              <label htmlFor="startTime">Aloituskellonaika</label>
              <div className="control">

                <input style={{ width: 300 }}
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
              <Message message={formik.errors.startTime} />
            ) : null}

            <div className="field">

              <label htmlFor="endTime">Lopetuskellonaika</label>
              <div className="control">

                <input style={{ width: 300 }}
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
              <Message message={formik.errors.endTime} />
            ) : null}

            <div className="field">
              <label htmlFor="desc">Kuvaus</label>
              <div className="control">
                <textarea className="textarea" style={{ width: 300 }}
                  id="desc" name="desc"
                  placeholder="Kirjoita tähän lyhyt kuvaus vierailusta."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.desc}>
                </textarea>
              </div>
            </div>
            {formik.touched.desc && formik.errors.desc ? (
              <Message message={formik.errors.desc} />
            ) : null}

            <button id="create" className="button is-link" type='submit'>Tallenna</button>
            <button className="button is-link is-light" onClick={closeEventForm}>Poistu</button>

          </form>
        </div>
      </div>
    </div>
  )
}
export default EventForm