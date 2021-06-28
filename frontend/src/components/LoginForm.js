import { useMutation } from '@apollo/client'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router'
import { LOGIN } from '../graphql/queries'
import { useField } from '../hooks'

const LoginForm = ({ getUser, sendMessage }) => {
  const history = useHistory()
  const username = useField('')
  const password = useField('password')
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => sendMessage(error.graphQLErrors[0].message, 'danger'),
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
        password: password.field.value,
      },
    })
    username.clear()
    password.clear()
  }

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  const style = { width: 500 }
  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <div className="title">Kirjautuminen (Luma-Varaukset)</div>
          <form onSubmit={submit}>
            <div className="field">
              <label className="label">Käyttäjänimi</label>
              <div className="control">
                <input
                  id="username"
                  type="text"
                  className="input"
                  {...username.field}
                  style={style}
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Salasana</label>
              <div className="control">
                <input
                  id="password"
                  type="password"
                  className="input"
                  {...password.field}
                  style={style}
                />
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <button id="login" className="button luma primary" type="submit">
                  Kirjaudu sisään
                </button>
              </div>
              <div className="control">
                <button className="button luma" onClick={cancel}>
                  Poistu
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
