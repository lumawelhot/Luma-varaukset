import React, { useState, useEffect, useMemo } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'
import { EventContext } from '.'
import {
  EVENTS,
  CREATE_EVENTS,
  MODIFY_EVENT,
  DELETE_EVENTS,
  EVENT,
  FORCE_DELETE_EVENTS,
  ASSIGN_EVENTS_TO_GROUP,
  ASSIGN_PUBLISH_DATE_TO_EVENTS,
  DISABLE_EVENT,
  ENABLE_EVENT,
  LOCK_EVENT,
  UNLOCK_EVENT,
  EVENT_MODIFIED,
  EVENTS_MODIFIED,
  EVENTS_DELETED
} from '../graphql/queries'
import { parseEvent } from '../helpers/parse'
import { someExist } from '../helpers/utils'

const EventProvider = ({ children }) => {
  const client = useApolloClient()
  const [fetched, setFetched] = useState(false)
  const [event, setEvent] = useState()
  const [parsed, setParsed] = useState([])
  const [selected, setSelected] = useState([])
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
  const end = async () => {
    setHold(false)
  }

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

  const addOrModify = event => {
    if (event.publishDate && new Date() < new Date(event.publishDate)) return
    let found = false
    Object.values(map).forEach(v => {
      if (v.id === event.id) found = true
    })
    updateMap(event)
    if (found) {
      setParsed(parsed.filter(p => p.id !== event.id)
        .concat(parseEvent(event)))
    } else {
      setParsed(parsed.concat(parseEvent(event)))
    }
  }

  useSubscription(EVENT_MODIFIED, {
    onSubscriptionData: async e => {
      if (hold) return
      const id = e?.subscriptionData?.data?.eventModified?.id
      const { data } = await client.query({
        query: EVENT, variables: { id }, fetchPolicy: 'no-cache'
      })
      if (data?.getEvent) {
        addOrModify(data.getEvent)
      }
    },
    onError: err => console.log(err)
  })

  useSubscription(EVENTS_MODIFIED, {
    onSubscriptionData: async e => {
      if (hold) return
      const ids = e?.subscriptionData?.data?.eventsModified?.map(e => e.id)
      if (ids) {
        const { data } = await client.query({
          query: EVENTS, variables: { ids }, fetchPolicy: 'no-cache'
        })
        if (data?.getEvents) {
          for (const event of data.getEvents) {
            addOrModify(event)
          }
        }
      }
    },
    onError: err => console.log(err)
  })

  useSubscription(EVENTS_DELETED, {
    onSubscriptionData: async e => {
      if (hold) return
      const ids = e?.subscriptionData?.data?.eventsDeleted
      if (ids) {
        const newMap = Object.assign({}, map)
        for (const id of ids) {
          delete newMap[id]
        }
        setMap(newMap)
        setParsed(parsed.filter(p => !someExist([p.id], ids)))
      }
    }
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
    setEvent()
    setParsed([])
    setFetched(false)
    setSelected([])
  }

  const fetch = async () => {
    if (fetched) return
    const { data } = await client.query({ query: EVENTS, fetchPolicy: 'no-cache' })
    setFetched(true)
    setMap(data?.getEvents.reduce((set, e) => {
      set[e['id']] = formFieldParse(e)
      return set
    }, {}))
    const parsed = data?.getEvents?.map(event => parseEvent(event)).flat()
    setParsed(parsed)
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
        mutation: CREATE_EVENTS, variables, fetchPolicy: 'no-cache'
      })
      if (data?.createEvents) {
        const newMap = Object.assign({}, map)
        for (let e of data.createEvents) {
          newMap[e.id] = formFieldParse(e)
        }
        setMap(newMap)
        setParsed(parsed.concat(data.createEvents.map(e => parseEvent(e)[0])))
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
      if (data?.modifyEvent) {
        const e = data.modifyEvent
        updateMap(e)
        setParsed(parsed.filter(p => p.id !== e.id)
          .concat(parseEvent(e)))
        end()
        return true
      }
    } catch (err) {
      console.log(err)
    }
    end()
    return false
  }

  const remove = async ids => {
    begin()
    try {
      const { data } = await client.mutate({
        mutation: DELETE_EVENTS, variables: { ids: Array.isArray(ids) ? ids : [ids] }, fetchPolicy: 'no-cache'
      })
      if (data?.deleteEvents) {
        const newMap = map
        for (let id of data.deleteEvents) {
          delete newMap[id]
        }
        setMap(newMap)
        setParsed(parsed.filter(p => !someExist([p.id], data.deleteEvents)))
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
        const newMap = map
        for (let id of ids) {
          delete newMap[id]
        }
        setMap(newMap)
        setParsed(parsed.filter(p => !ids.includes(p.id)))
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
    updateMap({ ...map[id], disabled: e.disabled, locked: false })
    setParsed(parsed.filter(p => p.id !== e.id)
      .concat(parseEvent({ ...map[id], disabled: e.disabled, locked: false })))
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
      end()
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
        end()
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

  const find = id => map[id]

  const cacheModify = value => {
    updateMap(value)
    setParsed(parsed.filter(p => p.id !== value.id)
      .concat(parseEvent(value)))
  }

  const select = id => {
    if (someExist([id], selected)) setSelected(selected.filter(i => i !== id))
    else setSelected(selected.concat(id))
  }

  const unSelectAll = () => setSelected([])

  const removeSelected = () => {
    remove(selected)
    setSelected([])
  }

  useEffect(() => {
    const exec = () => fetch()
    exec()
  }, [fetched])

  return (
    <EventContext.Provider
      value={{
        all: map ? Object.values(map) : undefined,
        filterOptions,
        setFilterOptions,
        current: event,
        parsed: filtered.map(f => ({ ...f, selected: someExist([f.id], selected) })),
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
        unlock,
        select,
        selected,
        removeSelected,
        unSelectAll
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export default EventProvider
