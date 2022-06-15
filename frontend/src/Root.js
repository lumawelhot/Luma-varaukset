import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { UserContext } from './services/contexts'

const Root = () => {
  const { current: user } = useContext(UserContext)

  if (user === undefined) return <></>

  return <Navigate to='/' />
}

export default Root