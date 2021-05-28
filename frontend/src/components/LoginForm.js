import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { LOGIN } from '../graphql/queries'
import { useField } from '../hooks'
import Message from './Message'

const LoginForm = ({ getUser }) => {
  const history = useHistory()
  const username = useField('')
  const password = useField('password')
  const [error, setError] = useState('')
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
      setTimeout(() => {
        setError(null)
      }, 5000)
    }
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      localStorage.setItem('app-token', token)
      getUser()
      history.push('/')
    }
  }, [result.data])

  const submit = (event) => {
    event.preventDefault()
    login({
      variables: {
        username: username.field.value,
        password: password.field.value
      }
    })
    username.clear()
    password.clear()
  }

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <Message message={error} />
          <div className="title">Luma varaukset kirjautuminen</div>
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

export default LoginForm