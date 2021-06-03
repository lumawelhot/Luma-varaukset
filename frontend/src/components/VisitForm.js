import React from 'react'
import { useFormik, /* FormikProvider */ } from 'formik'
import Message from './Message'
//import { useMutation } from '@apollo/client'
//import { CREATE_VISIT } from '../graphql/queries'
import { useHistory } from 'react-router'

const validate = values => {

  const defErrorMessage = 'Vaaditaan!'
  const errors = {}

  if (!values.clientName) {
    errors.clientName = defErrorMessage
  }

  return errors
}

const VisitForm = ({ sendMessage }) => {
  /* const [create, result] = useMutation(CREATE_VISIT, { //kirjoita mutaatio!!!
    onError: (error) => console.log(error)
  }) */

  const history = useHistory()

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  const formik = useFormik({
    initialValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
    },
    validate,
    onSubmit: values => {
      try {
        console.log(values)
        /* create({
          variables: {
            clientName: values.clientName,
            clientEmail: values.clientEmail,
            clientPhone: values.clientPhone
          }
        })
        alert(JSON.stringify(values, null, 2))
        sendMessage('Olet tehnyt varauksen onnistuneesti!') */
      } catch (error) {
        sendMessage('Varauksen teko epäonnistui.')
      }
    },
  })
  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <div className="title">Varaa vierailu</div>
          <form onSubmit={formik.handleSubmit}>
            <div className="field">

              <label htmlFor="clientName">Varaajan nimi </label>
              <div className="control">

                <input style={{ width: 300 }}
                  id="clientName"
                  name="clientName"
                  type="clientName"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.clientName}
                />
              </div>
            </div>
            {formik.touched.title && formik.errors.clientName ? (
              <Message message={formik.errors.clientName} />
            ) : null}

            <div className="field">

            <label htmlFor="clientEmail">Varaajan sähköpostiosoite </label>
            <div className="control">

              <input style={{ width: 300 }}
                id="clientEmail"
                name="clientEmail"
                type="clientEmail"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.clientEmail}
              />
            </div>
            </div>
            {formik.touched.title && formik.errors.clientEmail ? (
            <Message message={formik.errors.clientEmail} />
            ) : null}

            <div className="field">

            <label htmlFor="clientPhone">Varaajan puhelinnumero </label>
            <div className="control">

              <input style={{ width: 300 }}
                id="clientPhone"
                name="clientPhone"
                type="clientPhone"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.clientPhone}
              />
            </div>
            </div>
            {formik.touched.title && formik.errors.clientPhone ? (
            <Message message={formik.errors.clientPhone} />
            ) : null}

            <button id="create" className="button is-link" type='submit'>Tallenna</button>
            <button className="button is-link is-light" onClick={cancel}>Poistu</button>

          </form>
        </div>
      </div>
    </div>
  )
}
export default VisitForm

















/*import React from 'react'
import { Formik, useField } from 'formik'

const initialValues = {
  mass: '',
  height: '',
}

const getBodyMassIndex = (mass, height) => {
  return Math.round(mass / Math.pow(height, 2))
}

const BodyMassIndexForm = ({ onSubmit }) => {
  const [massField, massMeta, massHelpers] = useField('mass')
  const [heightField, heightMeta, heightHelpers] = useField('height')

  return (
    <div>
      <input
        name='mass'
        placeholder="Weight (kg)"
        value={massField.value}
        onChange={({ target }) => { massHelpers.setValue(target.value)}}
      />
      <input
        name='height'
        placeholder="Height (m)"
        value={heightField.value}
        onChange={({ target }) => { heightHelpers.setValue(target.value)}}
      />
      <button onSubmit={onSubmit}>Laske</button>
    </div>
  )
}

const VisitForm = () => {
  const onSubmit = values => {
    const mass = parseFloat(values.mass)
    const height = parseFloat(values.height)

    if (!isNaN(mass) && !isNaN(height) && height !== 0) {
      console.log(`Your body mass index is: ${getBodyMassIndex(mass, height)}`)
    }
  }

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ handleSubmit }) => <BodyMassIndexForm onSubmit={handleSubmit} />}
    </Formik>
  )
}


 import React from 'react'
import { Formik, useField, useFormikContext } from 'formik'

const FormikInput = ({ name }) => {
    const [field, meta, helpers] = useField(name)
    const showError = meta.touched && meta.error

    return (<>
        <input
          onChange={({ target }) => {
            helpers.setValue(target.value)}}
          onBlur={() => helpers.setTouched(true)}
          value={field.value}
          error={showError}
        />
        {showError && <div>{meta.error}</div>}
    </>)
}
const VisitForm = () => {
  const [field, meta, helpers] = useField('clientName')
  const showError = meta.touched && meta.error

  const onSubmit = () => {
    console.log('Painoit nappia!')
  }
  /* const validationSchema = yup.object().shape({ //muista importata ja asentaa yup
    //tähän tarkistukset
    description: yup
      .string()
      .min(5)
      .required('Kuvaus vaaditaan.')
  })
  return (
    <Formik initialValues={{ clientName:'' }}
      onSubmit={onSubmit} /* validationSchema={validationSchema} >

      {() =>
        <form>
          <FormikInput
            name='clientName'
            onChange={({ target }) => {
              helpers.setValue(target.value)
            }}
            onBlur={() => helpers.setTouched(true)}
            value={field.value}
            error={showError}
          />
        </form>
      }
    </Formik>
  )
}

export default VisitForm*/