import React, { useState } from 'react'
import { FormContext } from '.'
import { useApolloClient } from '@apollo/client'
import { CREATE_FORM, GET_ALL_FORMS, MODIFY_FORM, DELETE_FORMS } from '../graphql/queries'


const FormProvider = ({ children }) => {
  const client = useApolloClient()
  const [fetched, setFetched] = useState()
  const [forms, setForms] = useState()

  const fetch = async () => {
    if (fetched) return
    const { data } = await client.query({ query: GET_ALL_FORMS, fetchPolicy: 'no-cache' })
    setFetched(true)
    setForms(data?.getForms.map(f => ({
      ...f, fields: JSON.parse(f.fields)
    })))
  }

  const add = async variables => {
    try {
      const { data } = await client.mutate({ mutation: CREATE_FORM, variables, fetchPolicy: 'no-cache' })
      if (data?.createForm) {
        setForms(forms.concat(data?.createForm))
        return true
      }
    } catch (err) {
      console.log(err)
    }
    return false
  }

  const modify = async variables => {
    try {
      const { data } = await client.mutate({ mutation: MODIFY_FORM, variables, fetchPolicy: 'no-cache' })
      const modified = data?.updateForm
      if (modified) {
        setForms(forms.map(f => f.id === modified.id ? modified : f))
        return true
      }
    } catch (err) {
      console.log(err)
    }
    return false
  }

  const remove = async ids => {
    try {
      const { data } = await client.mutate(
        { mutation: DELETE_FORMS, variables: { ids }, fetchPolicy: 'no-cache' }
      )
      if (data) {
        setForms(forms.filter(f => !ids.includes(f.id)))
        return true
      }
    } catch (err) {
      console.log(err)
    }
    return false
  }

  return (
    <FormContext.Provider
      value={{
        fetch,
        all: forms,
        add,
        modify,
        remove,
        find
      }}
    >
      {children}
    </FormContext.Provider>
  )
}

export default FormProvider
