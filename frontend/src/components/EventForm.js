import React, { useEffect, useState } from 'react'
import { useFormik, FormikProvider } from 'formik'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_EVENT, TAGS } from '../graphql/queries'
import { useHistory } from 'react-router'
import LumaTagInput from './LumaTagInput/LumaTagInput'
import moment from 'moment'
import { FaAngleDown } from 'react-icons/fa'

const validate = (values) => {
  const defErrorMessage = 'Vaaditaan!'
  const errors = {}
  const startTime = new Date(`${values.date}:${values.startTime}`)
  const endTime = new Date(`${values.date}:${values.endTime}`)

  if (!values.title) {
    errors.title = defErrorMessage
  }

  if (!values.scienceClass) {
    errors.scienceClass = defErrorMessage
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
  const [showDropdownMenu, setShowDropdownMenu] = useState(false)
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
      console.log(result.data)
      addEvent(result.data.createEvent)
      sendMessage('Vierailu luotu', 'success')
      history.push('/')
    }
  }, [result.data])

  const options = [
    { value: 1, label: 'Varhaiskasvatus' },
    { value: 2, label: '1.-2. luokka' },
    { value: 3, label: '3.-6. luokka' },
    { value: 4, label: '7.-9 luokka' },
    { value: 5, label: 'toinen aste' },
  ]

  const toggleItem = (item, formikValues) => {
    if (formikValues.includes(item)) {
      return formikValues.filter((e) => e !== item)
    } else {
      return formikValues.concat(item)
    }
  }

  const focusInCurrentTarget = ({ relatedTarget, currentTarget }) => {
    if (relatedTarget === null) return false

    var node = relatedTarget.parentNode

    while (node !== null) {
      if (node === currentTarget) return true
      node = node.parentNode
    }

    return false
  }

  const onBlur = (e) => {
    if (!focusInCurrentTarget(e)) {
      setShowDropdownMenu(false)
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
      tags: [],
    },
    validate,
    onSubmit: (values) => {
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
          tags: values.tags.map((tag) =>
            Object({
              id: tags.data.getTags.find((t) => t.name === tag)?.id || null,
              name: tag,
            })
          ),
        },
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
              <label className="label" htmlFor="title">
                Tapahtuman nimi{' '}
              </label>
              <div className="control">
                <input
                  className="input"
                  style={{ width: 300 }}
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
                style={{ width: 300 }}
              />
            </FormikProvider>

            <div className="field" id="grade" >
              <div className="label" htmlFor="grade">
                Luokka-aste
              </div>
              <div
                className="tags"
                style={{ maxWidth: 'fit-content', marginBottom: 0 }}
              >
                {formik.values.grades.map((grade, index) => (
                  <span key={index} className="tag">
                    <span>{options[grade - 1].label}</span>
                    <a
                      role="button"
                      className="delete is-small"
                      onClick={() => {
                        const newValues = [
                          ...toggleItem(
                            options[grade - 1].value,
                            formik.values.grades
                          ),
                        ]
                        formik.setFieldValue('grades', newValues)
                      }}
                    ></a>
                  </span>
                ))}
              </div>
              <FormikProvider value={formik}>
                <div
                  className={`dropdown ${showDropdownMenu && 'is-active'}`}
                  onBlur={onBlur}
                >
                  <div
                    role="button"
                    aria-haspopup="true"
                    className="dropdown-trigger"
                  >
                    <button
                      type="button"
                      className={`button luma ${
                        formik.values.grades.length ? 'is-success' : 'is-danger'
                      }`}
                      onClick={() => setShowDropdownMenu(!showDropdownMenu)}
                    >
                      <span>Valitse</span>
                      <span
                        className="icon"
                        style={{ borderLeft: '1px solid #ececec' }}
                      >
                        <FaAngleDown />
                      </span>
                    </button>
                  </div>
                  <div
                    className="dropdown-menu"
                    style={{ display: showDropdownMenu ? 'block' : 'none' }}
                  >
                    <div role="list" className="dropdown-content">
                      {options.map((option) => (
                        <a
                          key={option.value}
                          role="listitem"
                          tabIndex="0"
                          className={`dropdown-item ${
                            formik.values.grades.includes(option.value) &&
                            'is-active'
                          }`}
                          onClick={() => {
                            const newValues = [
                              ...toggleItem(option.value, formik.values.grades),
                            ]
                            formik.setFieldValue('grades', newValues)
                          }}
                        >
                          <span>{option.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </FormikProvider>
            </div>

            <div className="field">
              <label className="label" htmlFor="scienceClass">
                Tiedeluokka
              </label>
              <div className="control">
                <FormikProvider value={formik}>
                  <select
                    className={`input ${
                      formik.touched.scienceClass
                        ? formik.errors.scienceClass
                          ? 'is-danger'
                          : 'is-success'
                        : ''
                    }`}
                    id="scienceClass"
                    name="scienceClass"
                    value={formik.values.scienceClass}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{ display: 'block', width: 300 }}
                  >
                    <option value="" label="Valitse tiedeluokka" />
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
              <p className="help is-danger">{formik.errors.scienceClass}</p>
            ) : null}

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
                  style={{ width: 300 }}
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
                  style={{ width: 300 }}
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
                  style={{ width: 300 }}
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
                  style={{ width: 300 }}
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
