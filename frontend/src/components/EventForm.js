import React from 'react'
import { useFormik , FormikProvider } from 'formik'
import Message from './Message'

const validate = values => {
  const errors = {}

  if (!values.scienceClass) {
    errors.scienceClass = 'Vaaditaan!'
  }

  if (!values.date) {
    errors.date = 'Vaaditaan!'
  }

  if (!values.time) {
    errors.time = 'Vaaditaan!'
  }

  return errors
}

const EventForm = () => {
  const formik = useFormik({
    initialValues: {
      scienceClass: '',
      date: '',
      time: '',
    },
    validate,
    onSubmit: values => {

      alert(JSON.stringify(values, null, 2))

    },
  })
  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <div className="title">Luo uusi vierailu</div>
          <form onSubmit={formik.handleSubmit}>
            <div className="field">

              <label htmlFor="scienceClass">Tiedeluokka </label>
              <div className="control">
                <FormikProvider value ={formik}>
                  <select
                    id="scienceClass"
                    name="scienceClass"
                    value={formik.values.scienceClass}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{ display: 'block', width: 300 }}
                  ><option value="" label="Valitse tiedeluokka"  />
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
              <Message message={formik.errors.scienceClass}/>
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
              <Message message={formik.errors.date}/>
            ) : null}

            <div className="field">

              <label htmlFor="time">Kellonaika </label>
              <div className="control">

                <input style={{ width: 300 }}
                  id="time"
                  name="time"
                  type="time"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.time}
                />
              </div>
            </div>

            {formik.touched.time && formik.errors.time ? (
              <Message message={formik.errors.time}/>
            ) : null}


            <button id="create" className="button is-link" type='submit'>Tallenna</button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default EventForm