import { useApolloClient } from '@apollo/client'
import React, { useState } from 'react'
import { VISITS, CANCEL_VISIT, FIND_VISIT, CREATE_VISIT, MODIFY_VISIT } from '../graphql/queries'
import { VisitContext } from '.'

const VisitProvider = ({ children }) => {
  const client = useApolloClient()
  const [fetched, setFetched] = useState(false)
  const [visits, setVisits] = useState([])
  const [visit, setVisit] = useState()

  const formFieldParse = data => {
    const formData = data?.customFormData
    return {
      ...data,
      customFormData: typeof formData === 'string' ? JSON.parse(formData) : formData
    }
  }

  const fetch = async () => {
    if (fetched) return
    try {
      const { data } = await client.query({ query: VISITS, fetchPolicy: 'no-cache' })
      setFetched(true)
      setVisits(data?.getVisits?.map(v => formFieldParse(v)))
    } catch (err) { undefined }
  }

  const evict = () => {
    setVisits([])
    setFetched(false)
    setVisit(undefined)
  }

  // This could probably communicate with EventProvider ??
  // Now assuming that subscriptions fetches a modified event
  // TODO: fix this, still you should avoid of creating depency between two providers
  const remove = async (id) => {
    try {
      const { data } = await client.mutate({
        mutation: CANCEL_VISIT,
        variables: { id },
        fetchPolicy: 'no-cache'
      })
      setVisits(visits
        .map(v => v.id === data.cancelVisit.id ? ({ ...v, status: false }) : v)
      )
    } catch (err) { console.log(err) }
  }

  const find = async (id) => {
    const found = visits?.filter(v => v.id === id)
    if (found && found[0]) {
      setVisit(found[0])
      return found[0]
    }
    try {
      const { data } = await client.query({
        query: FIND_VISIT,
        variables: { id },
        fetchPolicy: 'no-cache'
      })
      if (data.findVisit.id === id) {
        const parsedVisit = { ...data.findVisit, customFormData: JSON.parse(data.findVisit.customFormData) }
        setVisit(parsedVisit)
        setVisits(visits.concat(parsedVisit))
        return parsedVisit
      }
    } catch (err) { console.log(err) }
    return false
  }

  const book = async (variables) => {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_VISIT,
        variables,
        fetchPolicy: 'no-cache'
      })
      const created = data?.createVisit
      if (created) {
        setVisits(visits.concat({ ...created, customFormData: JSON.parse(created?.customFormData) }))
        setVisit({ ...created, customFormData: JSON.parse(created?.customFormData) })
        return created
      }
    } catch (err) { console.log(err) }
    return undefined
  }

  const modify = async variables => {
    try {
      const { data } = await client.mutate({
        mutation: MODIFY_VISIT,
        variables,
        fetchPolicy: 'no-cache'
      })
      const modified = data?.modifyVisit
      if (modified) {
        setVisits(visits.map(v => v.id === modified.id
          ? { ...modified, customFormData: JSON.parse(modified?.customFormData) }
          : v ))
        if (visit.id === modified.id) setVisit({ ...modified, customFormData: JSON.parse(modified?.customFormData) })
        return modified
      }
    } catch (err) { console.log(err) }
  }

  return (
    <VisitContext.Provider
      value={{
        all: visits,
        fetch,
        evict,
        remove,
        current: visit,
        find,
        modify,
        book
      }}
    >
      {children}
    </VisitContext.Provider>
  )
}

export default VisitProvider
