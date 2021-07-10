import { useMutation } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router'
import { CREATE_USER, USERS } from '../graphql/queries'
import { RadioButton, TextField } from './VisitForm/FormFields'

const UserForm = ({ sendMessage }) => {
  const history = useHistory()

  const [createUser, result] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: USERS }],
    onError: (error) => sendMessage(error.graphQLErrors[0].message, 'danger')
  })

  useEffect(() => {
    if (result.data) {
      sendMessage(`Käyttäjätunnus '${result.data.createUser.username}' luotu.`, 'success')
      history.push('/')
    }
  }, [result])

  const onSubmit = (values) => {
    createUser({
      variables: {
        username: values.username,
        password: values.password,
        isAdmin: values.isAdmin
      }
    }).catch(() => sendMessage('Virheellinen syöte!', 'danger'))
    values.username = ''
    values.password = ''
  }

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  return (
    <Formik
      initialValues={{
        username: '',
        password: '',
        isAdmin: null,
      }}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, setFieldValue }) => {
        return (
          <div className="container">
            <div className="columns is-centered">
              <div className="section">
                <div className="title">Luo uusi käyttäjä</div>
                <form onSubmit={handleSubmit} >
                  <Field
                    style={{ width: 500 }}
                    label='Käyttäjänimi'
                    fieldName='username'
                    component={TextField}
                  />
                  <Field
                    label='Salasana'
                    fieldName='password'
                    type='password'
                    component={TextField}
                  />
                  <label className="label">Käyttäjärooli</label>
                  <Field
                    label='Ylläpitäjä'
                    id='permission'
                    onChange={() => setFieldValue('isAdmin', true)}
                    component={RadioButton}
                  />
                  <Field
                    style={{ marginBottom: 10 }}
                    label='Työntekijä'
                    id='permission'
                    onChange={() => setFieldValue('isAdmin', false)}
                    component={RadioButton}
                  />
                  <div className="field is-grouped">
                    <div className="control">
                      <button
                        id="create"
                        className="button luma primary"
                        type='submit'
                      > Tallenna käyttäjä
                      </button>
                    </div>
                    <div className="control">
                      <button
                        className="button luma"
                        onClick={cancel}
                      > Poistu
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }}
    </Formik>
  )
}

export default UserForm