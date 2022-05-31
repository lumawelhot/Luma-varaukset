import React, { useState, useEffect, useMemo } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'
import { EventContext } from '../../services/contexts'
import {
  EVENTS,
  CREATE_EVENT,
  MODIFY_EVENT,
  DELETE_EVENT,
  EVENT_STATUS,
  EVENT,
  FORCE_DELETE_EVENTS,
  ASSIGN_EVENTS_TO_GROUP,
  ASSIGN_PUBLISH_DATE_TO_EVENTS,
  DISABLE_EVENT,
  ENABLE_EVENT,
  LOCK_EVENT,
  UNLOCK_EVENT
} from '../../graphql/queries'
import { parseEvent } from '../../helpers/parse'
import { someExist } from '../../helpers/utils'

const EventProvider = ({ children }) => {
  const client = useApolloClient()
  const [fetched, setFetched] = useState(false)
  const [event, setEvent] = useState()
  const [parsed, setParsed] = useState()
  const [map, setMap] = useState({})
  const [filterOptions, setFilterOptions] = useState({
    tags: [],
    grades: [],
    classes: [],
    visitTypes: ['inperson', 'remote'],
    showUnavailable: false
  })
  const [hold, setHold] = useState(false)
  const begin = () => setHold(true)
  const end = () => setHold(false)

  const formFieldParse = data => {
    const form = data?.customForm
    return { ...data, customForm: {
      ...form, fields: typeof form?.fields === 'string' ? JSON.parse(form.fields) : form?.fields
    } }
  }

  const updateMap = data => {
    const newMap = Object.assign({}, map)
    newMap[data.id] = formFieldParse(data)
    setMap(newMap)
  }

  useSubscription(EVENT_STATUS, {
    onSubscriptionData: async e => {
      if (hold) return
      const id = e?.subscriptionData?.data?.eventModified?.id
      const { data } = await client.query({
        query: EVENT, variables: { id }, fetchPolicy: 'no-cache'
      })
      if (data?.getEvent) {
        let found = false
        Object.values(map).forEach(v => {
          if (v.id === data.getEvent.id) found = true
        })
        console.log(data.getEvent)
        updateMap(data.getEvent)
        if (found) {
          setParsed(parsed.filter(p => p.id !== data.getEvent.id)
            .concat(parseEvent(data.getEvent)))
        } else {
          setParsed(parsed.concat(parseEvent(data.getEvent)))
        }
      }
    },
    onError: err => console.log(err)
  })

  const filtered = useMemo(() => {
    if (!map) return parsed
    return parsed
      ?.filter(p => {
        const classes = filterOptions.classes
        if (classes.length <= 0) return true
        return someExist(map[p.id]?.resourceids, classes.map(c => c.value))
      })
      ?.filter(p => {
        const grades = filterOptions.grades
        if (grades.length <= 0) return true
        return someExist(map[p.id]?.grades, grades.map(c => c.value))
      })
      ?.filter(p => {
        const tags = filterOptions.tags
        if (tags.length <= 0) return true
        return someExist(map[p.id].tags.map(t => t.name), filterOptions.tags.map(t => t.value))
      })
      ?.filter(p => {
        const inPerson = filterOptions.visitTypes?.includes('inperson') ? true : false
        const remote = filterOptions.visitTypes?.includes('remote') ? true : false
        return map[p.id]?.inPersonVisit === inPerson || map[p.id]?.remoteVisit === remote
      })
  }, [parsed, filterOptions, map])

  const evict = () => {
    setMap({})
    setEvent(undefined)
    setParsed(undefined)
    setFetched(false)
  }

  const fetch = async () => {
    if (fetched) return
    const { data } = await client.query({ query: EVENTS, fetchPolicy: 'no-cache' })
    setFetched(true)
    const parsed = data?.getEvents?.map(event => parseEvent(event)).flat()
    setParsed(parsed)
    setMap(data?.getEvents.reduce((set, e) => {
      set[e['id']] = formFieldParse(e)
      return set
    }, {}))
  }

  const set = (event, params) => {
    if (event?.__typename === 'Event') {
      setEvent({ ...event, ...params })
      return true
    }
    const found = map[event]
    if (found) {
      setEvent({ ...found, ...params })
      return true
    }
    return false
  }

  const add = async variables => {
    begin()
    try {
      const { data } = await client.mutate({
        mutation: CREATE_EVENT, variables, fetchPolicy: 'no-cache'
      })
      if (data?.createEvent) {
        const e = data.createEvent
        setParsed(parsed.concat(parseEvent(e)))
        updateMap(e)
        end()
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const modify = async variables => {
    begin()
    try {
      const { data } = await client.mutate({
        mutation: MODIFY_EVENT, variables, fetchPolicy: 'no-cache'
      })
      console.log(data.modifyEvent)
      if (data?.modifyEvent) {
        const e = data.modifyEvent
        setParsed(parsed.filter(p => p.id !== e.id)
          .concat(parseEvent(e)))
        updateMap(e)
        end()
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const remove = async id => {
    begin()
    try {
      const { data } = await client.mutate({
        mutation: DELETE_EVENT, variables: { id }, fetchPolicy: 'no-cache'
      })
      if (data.deleteEvent) {
        setParsed(parsed.filter(p => p.id !== id))
        const newMap = map
        delete newMap[id]
        setMap(newMap)
        end()
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const forceRemove = async variables => {
    begin()
    try {
      const ids = variables.events
      const { data } = await client.mutate({
        mutation: FORCE_DELETE_EVENTS, variables, fetchPolicy: 'no-cache'
      })
      if (data.forceDeleteEvents) {
        setParsed(parsed.filter(p => !ids.includes(p.id)))
        const newMap = map
        for (let id of ids) {
          delete newMap[id]
        }
        setMap(newMap)
        end()
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const assignToGroup = async values => {
    const gid = values?.group?.id
    const variables = { events: values.events, group: gid ? gid : '' }
    begin()
    try {
      const { data } = await client.mutate({
        mutation: ASSIGN_EVENTS_TO_GROUP, variables, fetchPolicy: 'no-cache'
      })
      const ids = data?.assignEventsToGroup?.map(e => e.id)
      if (ids) {
        const newMap = Object.assign({}, map)
        for (let id of ids) {
          newMap[id] = formFieldParse({ ...map[id], group: values.group })
        }
        setMap(newMap)
        end()
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const setPublish = async variables => {
    begin()
    try {
      const { data } = await client.mutate({
        mutation: ASSIGN_PUBLISH_DATE_TO_EVENTS, variables, fetchPolicy: 'no-cache'
      })
      const ids = data?.assignPublishDateToEvents?.map(e => e.id)
      if (ids) {
        const newMap = Object.assign({}, map)
        for (let id of ids) {
          newMap[id] = { ...map[id], publishDate: variables.publishDate }
        }
        setMap(newMap)
        end()
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const toggleDisable = (e, id) => {
    setParsed(parsed.filter(p => p.id !== e.id)
      .concat(parseEvent({ ...map[id], disabled: e.disabled, locked: false })))
    updateMap({ ...map[id], disabled: e.disabled, locked: false })
    setEvent({ ...event, disabled: e.disabled, locked: false })
    end()
  }

  const disable = async id => {
    begin()
    try {
      const { data } = await client.mutate({
        mutation: DISABLE_EVENT, variables: { event: id }, fetchPolicy: 'no-cache'
      })
      const e = data?.disableEvent
      if (e) {
        toggleDisable(e, id)
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const enable = async id => {
    begin()
    try {
      const { data } = await client.mutate({
        mutation: ENABLE_EVENT, variables: { event: id }, fetchPolicy: 'no-cache'
      })
      const e = data?.enableEvent
      if (e) {
        toggleDisable(e, id)
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const lock = async id => {
    if (!id) return undefined
    begin()
    try {
      const { data } = await client.mutate({
        mutation: LOCK_EVENT, variables: { event: id }, fetchPolicy: 'no-cache'
      })
      const e = data?.lockEvent
      if (e) {
        updateMap({ ...map[id], locked: true })
        end()
        return e.token
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return undefined
  }

  const unlock = async id => {
    if (!id) return undefined
    begin()
    try {
      const { data } = await client.mutate({
        mutation: UNLOCK_EVENT, variables: { event: id }, fetchPolicy: 'no-cache'
      })
      const e = data?.unlockEvent
      if (e) {
        updateMap({ ...map[id], locked: false })
        end()
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const find = (id) => map[id]

  const cacheModify = value => {
    updateMap(value)
    setParsed(parsed.filter(p => p.id !== value.id)
      .concat(parseEvent(value)))
  }

  useEffect(fetch, [fetched])

  return (
    <EventContext.Provider
      value={{
        all: map ? Object.values(map) : undefined,
        filterOptions,
        setFilterOptions,
        current: event,
        parsed: filtered,
        set,
        fetch,
        find,
        add,
        modify,
        cacheModify,
        remove,
        evict,
        forceRemove,
        assignToGroup,
        setPublish,
        disable,
        enable,
        lock,
        unlock
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export default EventProvider
