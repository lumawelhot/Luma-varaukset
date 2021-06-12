import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { CREATE_USER } from '../graphql/queries'
import { useField } from '../hooks'

const UserForm = ({ sendMessage }) => {
  const history = useHistory()
  const username = useField('')
  const password = useField('password')
  const [isAdmin, setPermissions] = useState(null)

  const [createUser, result] = useMutation(CREATE_USER, {
    onError: (error) => sendMessage(error.graphQLErrors[0].message, 'danger')
  })

  useEffect(() => {
    if (result.data) {
      sendMessage(`Käyttäjätunnus '${result.data.createUser.username}' luotu.`, 'success')
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
    }).catch(() => sendMessage('Virheellinen syöte!', 'danger'))
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
          <div className="title">Luo uusi käyttäjä</div>
          <form onSubmit={submit} >
            <div className="field">
              <label className="label">Käyttäjänimi</label>
              <div className="control">
                <input id="username" className="input" {...username.field} style={{ width: 500 }} />
              </div>
            </div>
            <div className="field">
              <label className="label">Salasana</label>
              <div className="control">
                <input id="password" className="input" {...password.field} style={{ width: 500 }} />
              </div>
            </div>
            <div className="field">
              <label className="label">Käyttäjärooli</label>
              <div className="control">
                <input id="admin" type="radio" value="admin" name="permission" onChange={handlePermissionChange} /> Ylläpitäjä
                <p></p>
                <input type="radio" value="employee" name="permission" onChange={handlePermissionChange} /> Työntekijä
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <button id="create" className="button luma primary" type='submit'>Tallenna käyttäjä</button>
              </div>
              <div className="control">
                <button className="button luma" onClick={cancel}>Poistu</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserForm