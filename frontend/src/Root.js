import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from './hooks/api'

const Root = () => {
  const { current: user } = useUser()

  if (user === undefined) return <></>

  return <Navigate to='/' />
}

export default Root
