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

    <form onSubmit={formik.handleSubmit}>

      <b>Tiedevierailulomake</b>
      <p><label htmlFor="scienceClass">Tiedeluokka </label>
        <FormikProvider value ={formik}>
          <select
            name="scienceClass"
            value={formik.values.scienceClass}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ display: 'block' }}
          >
            <option value="" label="Valitse tiedeluokka, jossa vierailu tapahtuu" />
            <option value="SUMMAMUTIKKA" label="SUMMAMUTIKKA" />
            <option value="FOTONI" label="FOTONI" />
            <option value="LINKKI" label="LINKKI" />
            <option value="GEOPISTE" label="GEOPISTE" />
            <option value="GADOLIN" label="GADOLIN" />
          </select>


        </FormikProvider>
      </p>
      {formik.touched.scienceClass && formik.errors.scienceClass ? (
        <Message message={formik.errors.scienceClass}/>
      ) : null}

      <p>
        <label htmlFor="date">Päivämäärä </label>
        <input style={{ width: 100 }}
          id="date"
          name="date"
          type="date"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.date}
        />
      </p>
      {formik.touched.date && formik.errors.date ? (
        <Message message={formik.errors.date}/>
      ) : null}

      <p>
        <label htmlFor="time">Kellonaika </label>
        <input style={{ width: 100 }}
          id="time"
          name="time"
          type="time"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.time}
        />
      </p>
      {formik.touched.time && formik.errors.time ? (
        <Message message={formik.errors.time}/>
      ) : null}


      <button type="submit">Tallenna</button>
    </form>
  )
}
export default EventForm