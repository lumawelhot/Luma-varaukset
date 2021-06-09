import React from 'react'
import { useFormik, FormikProvider } from 'formik'
import Message from './Message'
import { useMutation } from '@apollo/client'
import { CREATE_VISIT } from '../graphql/queries'
import { useHistory } from 'react-router'
//import format from 'date-fns/format'


const validate = values => {

  const defErrorMessage = 'Vaaditaan!'
  const errors = {}

  if (!values.visitGrade) {
    errors.visitGrade = defErrorMessage
  }
  if (!values.clientName) {
    errors.clientName = defErrorMessage
  }
  if (!values.clientEmail) {
    errors.clientEmail = defErrorMessage
  }
  if (!values.clientPhone) {
    errors.clientPhone = defErrorMessage
  }

  return errors
}

const VisitForm = ({ sendMessage, event }) => {
  //console.log(event)
  const grades = [
    { value: 1, label:'Varhaiskasvatus' },
    { value: 2, label: '1.-2. luokka' },
    { value: 3, label: '3.-6. luokka' },
    { value: 4, label:'7.-9 luokka' },
    { value: 5, label:  'toinen aste' }
  ]

  const filterEventGrades = (eventGrades) => {
    const returnArray = []
    eventGrades.forEach(availableGrade => {
      grades.forEach(grade => {
        if (availableGrade === grade.value) {
          returnArray.push({ value: grade.value, label: grade.label })
        }
      })
    })
    return returnArray
  }

  const filterEventClass = (eventClass) => {
    switch (eventClass) {
      case 1:
        return 'SUMMAMUTIKKA'
      case 2:
        return 'FOTONI'
      case 3:
        return 'LINKKI'
      case 4:
        return 'GEOPISTE'
      case 5:
        return 'GADOLIN'
      default:
        console.log('Error!')
        break
    }
  }

  const [create, result] = useMutation(CREATE_VISIT, {
    onError: (error) => console.log('virheviesti: ', error, result)
  })

  const history = useHistory()

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  const formik = useFormik({

    initialValues: {
      visitGrade: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
    },
    validate,
    onSubmit: values => {
      try {
        const grade = parseInt(values.visitGrade)
        create({
          variables: {
            clientName: values.clientName,
            clientEmail: values.clientEmail,
            clientPhone: values.clientPhone,
            grade: grade,
            event: event.id
          }
        })
        sendMessage('Olet tehnyt varauksen onnistuneesti!', 'success')
        history.push('/')
      } catch (error) {
        sendMessage('Varauksen teko epäonnistui.', 'danger')
      }
    },
  })
  if (event) {
    const eventGrades = filterEventGrades(event.grades)
    const eventClass = filterEventClass(event.resourceId)
    return (
      <div className="container">
        <div className="columns is-centered">
          <div className="section">
            <div className="title">Varaa vierailu </div>
            <div>
              <p>Tapahtuman tiedot:</p>
              <p>Nimi: {event.title}</p>
              <p>Kuvaus: [Tähän tapahtuman kuvaus]</p>
              <p>Tiedeluokka: {eventClass}</p>
              <p>Valittavissa olevat lisäpalvelut: [Tähän ekstrat]</p>
              <div>Tarjolla seuraaville luokka-asteille: {eventGrades.map(g =>
                <div key={g.value}>{g.label}</div>)}
              </div>
              <p>Tapahtuma alkaa: {event.start.toString()}</p>
              <p>Tapahtuma päättyy: {event.end.toString()}</p>
            </div>

            <br/>
            <h1>Syötä varauksen tiedot</h1>

            <form onSubmit={formik.handleSubmit}>
              <div className="field">
                <label htmlFor="scienceClass">Luokka-aste </label>
                <div className="control">

                  <FormikProvider value={formik}>
                    <select
                      id="visitGrade"
                      name="visitGrade"
                      value={formik.values.visitGrade}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      style={{ display: 'block', width: 300 }}
                    > <option value="" label="Valitse luokka-aste" />
                      {eventGrades.map(g => <option key={g.value} value={g.value} label={g.label}/>)}
                    </select>
                  </FormikProvider>
                </div>
              </div>
              {formik.touched.visitGrade && formik.errors.visitGrade ? (
                <Message message={formik.errors.visitGrade} />
              ) : null}

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
              {formik.touched.clientName && formik.errors.clientName ? (
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
              {formik.touched.clientEmail && formik.errors.clientEmail ? (
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
              {formik.touched.clientPhone && formik.errors.clientPhone ? (
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
  return (
    <div>Tapahtumaa haetaan...</div>
  )
}
export default VisitForm