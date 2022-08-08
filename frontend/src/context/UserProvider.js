import { useApolloClient } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { CREATE_USER, CURRENT_USER, USERS, DELETE_USERS, LOGIN, MODIFY_USER } from '../graphql/queries'
import { UserContext } from '.'

const UserProvider = ({ children }) => {
  const client = useApolloClient()
  const [user, setUser] = useState()
  const [users, setUsers] = useState()

  const evict = () => setUser()

  const fetch = async () => {
    try {
      if (user) return
      const { data } = await client.query({ query: CURRENT_USER, fetchPolicy: 'no-cache' })
      setUser(data?.me)
    } catch (err) {
      setUser(null)
    }
  }

  const fetchAll = async () => {
    if (users) return
    try {
      const { data } = await client.query({ query: USERS, fetchPolicy: 'no-cache' })
      setUsers(data?.getUsers)
    } catch (err) { undefined }
  }

  const add = async (variables) => {
    try {
      const { data } = await client.mutate({ mutation: CREATE_USER, variables, fetchPolicy: 'no-cache' })
      if (data?.createUser?.id) {
        setUsers(users.concat(data.createUser))
        return true
      }
    } catch (err) { undefined }
    return false
  }

  const modify = async (variables)  => {
    try {
      const { data } = await client.mutate({ mutation: MODIFY_USER, variables, fetchPolicy: 'no-cache' })
      if (data?.updateUser) {
        const usr = data.updateUser
        setUsers(users.map(u => u.id === usr.id ? usr : u))
        if (usr.id === user.id) setUser(usr)
        return true
      }
    } catch (err) {
      console.log(err)
    }
    return false
  }

  const remove = async ids => {
    try {
      const { data } = await client.mutate({ mutation: DELETE_USERS,
        variables: { ids }, fetchPolicy: 'no-cache'
      })
      if (data) {
        setUsers(users.filter(u => !ids.includes(u.id)))
        return true
      }
    } catch (err) { undefined }
    return false
  }

  const login = async (variables) => {
    try {
      const { data } = await client.mutate({ mutation: LOGIN, variables, fetchPolicy: 'no-cache' })
      const token = data?.login?.value
      if (token) {
        return token
      }
    } catch (err) { undefined }
    return null
  }

  useEffect(() => {
    const exec = () => fetch()
    exec()
  }, [user])

  return (
    <UserContext.Provider
      value={{
        current: user,
        all: users,
        evict,
        fetch,
        fetchAll,
        add,
        remove,
        login,
        modify
      }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
