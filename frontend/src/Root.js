import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUsers } from './hooks/cache'

const Root = () => {
  const { current: user } = useUsers()

  if (user === undefined) return <></>

  return <Navigate to='/' />
}

export default Root
