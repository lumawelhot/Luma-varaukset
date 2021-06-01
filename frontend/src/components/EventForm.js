import React from 'react'
import { useFormik, FormikProvider } from 'formik'
import Message from './Message'
import { useMutation } from '@apollo/client'
import { CREATE_EVENT } from '../graphql/queries'
import { useHistory } from 'react-router'




const validate = values => {
  const errors = {}

  if (!values.title) {
    errors.title = 'Vaaditaan!'
  }

  if (!values.scienceClass) {
    errors.scienceClass = 'Vaaditaan!'
  }

  if (!values.date) {
    errors.date = 'Vaaditaan!'
  }

  if (!values.startTime) {
    errors.time = 'Vaaditaan!'
  }

  if (!values.endTime) {
    errors.time = 'Vaaditaan!'
  }

  return errors
}

const EventForm = ({ sendMessage }) => {
  const [create,] = useMutation(CREATE_EVENT, {
    onError: (error) => console.log(error)
  })

  const history = useHistory()

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      scienceClass: '',
      date: '',
      startTime: '',
      endTime: '',
    },
    validate,
    onSubmit: values => {
      const start = new Date(`${values.date}:${values.startTime}`)
      const end = new Date(`${values.date}:${values.endTime}`)
      create({
        variables: {
          title: values.title,
          start,
          end,
          scienceClass: values.scienceClass
        }
      })
      alert(JSON.stringify(values, null, 2))
      sendMessage('Vierailu luotu')
    },
  })
  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
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

            <div className="field">

              <label htmlFor="scienceClass">Tiedeluokka </label>
              <div className="control">
                <FormikProvider value={formik}>
                  <select
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


            <button className="button is-link" type='submit'>Tallenna</button>
            <button className="button is-link is-light" onClick={cancel}>Poistu</button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default EventForm