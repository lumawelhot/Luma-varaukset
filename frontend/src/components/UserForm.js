import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { CREATE_USER } from '../graphql/queries'
import { useField } from '../hooks'
import Message from './Message'

const UserForm = () => {
  const history = useHistory()
  const username = useField('')
  const password = useField('password')
  const [error, setError] = useState('')
  const [isAdmin, setPermissions] = useState(null)

  const setMessage = ({ message }) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 5000)
  }

  const [createUser, result] = useMutation(CREATE_USER, {
    onError: (error) => setMessage({ message: error.graphQLErrors[0].message })
  })

  useEffect(() => {
    if (result.data) {
      history.push('/')
    }
  }, [result])

  const submit = (event) => {
    event.preventDefault()
    createUser({
      variables: {
        username: username.field.value,
        password: password.field.value,
        isAdmin
      }
    }).catch(() => setMessage({ message: 'Virheellinen syöte!' }))
    username.clear()
    password.clear()
  }

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  const handlePermissionChange = event => {
    const { value } = event.target
    if (value === 'admin') setPermissions(true)
    else if (value === 'employee') setPermissions(false)
  }

  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <Message message={error} />
          <div className="title">Luo uusi käyttäjä</div>
          <form onSubmit={submit} >
            <div className="field">
              <label className="label">Käyttäjänimi</label>
              <div className="control">
                <input className="input" {...username.field} style={{ width: 500 }} />
              </div>
            </div>
            <div className="field">
              <label className="label">Salasana</label>
              <div className="control">
                <input className="input" {...password.field} style={{ width: 500 }} />
              </div>
            </div>
            <div className="field">
              <label className="label">Käyttäjärooli</label>
              <div className="control">
                <input type="radio" value="admin" name="permission" onChange={handlePermissionChange} /> Ylläpitäjä
                <p></p>
                <input type="radio" value="employee" name="permission" onChange={handlePermissionChange} /> Työntekijä
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <button className="button is-link" type='submit'>Kirjaudu sisään</button>
              </div>
              <div className="control">
                <button className="button is-link is-light" onClick={cancel}>Poistu</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserForm