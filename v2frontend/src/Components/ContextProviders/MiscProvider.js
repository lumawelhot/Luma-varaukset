import React, { useState, useContext } from 'react'
import { useApolloClient } from '@apollo/client'
import { MiscContext } from '../../services/contexts'
import { EXTRAS, TAGS, DELETE_EXTRAS, CREATE_EXTRA, MODIFY_EXTRA } from '../../graphql/queries'
import { EventContext } from '../../services/contexts'

const MiscProvider = ({ children }) => {
  const client = useApolloClient()
  const [tags, setTags] = useState()
  const [extras, setExtras] = useState()

  const [calendarOptions, setCalendarOptions] = useState({
    view: 'timeGridWeek',
    date: null,
  })

  const eventContext = useContext(EventContext)

  const fetchTags = async () => {
    if (tags) return
    const { data } = await client.query({ query: TAGS })
    if (data) {
      const tags = []
      data.getTags.forEach(tag => tags[tag.id] = 0)
      eventContext.all.forEach(event => {
        event.tags.forEach(tag => {
          if (!tags[tag.id]) tags[tag.id] = 1
          else tags[tag.id] += 1
        })
      })
      const tagList = data.getTags
        .map(tag => ({
          value: tag.name,
          id: tag.id,
          label: tag.name,
          count: tags[tag.id]
        }))
        .sort((a, b) => b.count - a.count)
      setTags(tagList)
    }
  }

  const fetchExtras = async () => {
    if (extras !== undefined) return
    const { data } = await client.query({ query: EXTRAS })
    if (data) setExtras(data?.getExtras)
  }

  const removeExtras = async (ids) => {
    if (ids.length <= 0) return false
    try {
      const { data } = await client.mutate({
        mutation: DELETE_EXTRAS,
        variables: { ids }
      })
      if (data) {
        setExtras(extras.filter(e => !ids.includes(e.id)))
        return true
      }
    } catch (err) { console.log(err)}
    return false
  }

  const addExtra = async (variables) => {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_EXTRA,
        variables
      })
      if (data?.createExtra) {
        setExtras(extras.concat(data.createExtra))
        return true
      }
    } catch (err) { console.log(err)}
    return false
  }

  const modifyExtra = async (variables) => {
    try {
      const { data } = await client.mutate({
        mutation: MODIFY_EXTRA,
        variables
      })
      if (data?.modifyExtra) {
        console.log(data)
        setExtras(extras
          .map(e => e.id === variables.id ? data.modifyExtra : e)
        )
        return true
      }
    } catch (err) {console.log(err)}
    return false
  }

  return (
    <MiscContext.Provider
      value={{
        fetchTags,
        tags,
        calendarOptions,
        setCalendarOptions,
        fetchExtras,
        extras,
        removeExtras,
        addExtra,
        modifyExtra
      }}
    >
      {children}
    </MiscContext.Provider>
  )
}

export default MiscProvider