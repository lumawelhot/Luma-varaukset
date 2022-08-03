import { useApolloClient } from '@apollo/client'
import React, { useState } from 'react'
import { CREATE_GROUP, DELETE_GROUPS, GROUPS, MODIFY_GROUP } from '../graphql/queries'
import { GroupContext } from '.'

const GroupProvider = ({ children }) => {
  const client = useApolloClient()
  const [groups, setGroups] = useState([])
  const [fetched, setFetched] = useState(false)

  const fetch = async () => {
    if (fetched) return
    try {
      const { data } = await client.query({ query: GROUPS })
      setFetched(true)
      setGroups(data?.getGroups)
    } catch (err) { console.log(err)}
  }

  const add = async variables => {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_GROUP,
        variables
      })
      if (data?.createGroup) {
        setGroups(groups.concat(data.createGroup))
        return true
      }
    } catch (err) { console.log(err) }
    return false
  }

  const remove = async ids => {
    try {
      const { data } = await client.mutate({
        mutation: DELETE_GROUPS,
        variables: { ids }
      })
      if (data) {
        setGroups(groups.filter(g => !ids.includes(g.id)))
        return true
      }
    } catch (err) { console.log(err) }
    return false
  }

  const modify = async variables => {
    try {
      const { data } = await client.mutate({
        mutation: MODIFY_GROUP,
        variables
      })
      if (data?.modifyGroup) {
        setGroups(groups.map(g => g.id === variables.id ? data.modifyGroup : g))
        return true
      }
    } catch (err) { console.log(err) }
    return false
  }

  return (
    <GroupContext.Provider
      value={{
        all: groups,
        fetch,
        remove,
        add,
        modify
      }}
    >
      {children}
    </GroupContext.Provider>
  )
}

export default GroupProvider