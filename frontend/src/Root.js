import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUsers } from './hooks/cache'

// This is used to redirect unauthorized user from nonexisting path to calendar page
const Root = () => useUsers().current === undefined ? <></> : <Navigate to='/' />

export default Root
