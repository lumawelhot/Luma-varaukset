import { eventGate, extraGate, groupGate, userGate, visitGate, miscGate, formGate } from '../gateway/endpoints'
import { parseEvent, parseFormFields } from '../helpers/parse'
import { useState } from 'react'
import { someExist } from '../helpers/utils'
import { useEventFilter } from './filter'
import { useEventModified, useEventsDeleted, useEventsModified } from './subscriptions'
import { addDays, set } from 'date-fns'
import { FIRST_EVENT_AFTER_DAYS } from '../config'

// Add this thing if for some reason state updates weirdly
// const delay = (time = 10) => new Promise(resolve => setTimeout(() => resolve(true), time))

const crud = (state, gateway, actions) => {
  const { fetchAll, add, modify, remove } = gateway
  const { _set, _add, _modify, _remove } = actions

  return {
    all: state.all,
    fetchAll: async () => !state.all?.length && _set(await fetchAll()),
    add: async variables => {
      const result = await add(variables)
      if (result) _add(result)
      return !!result
    },
    modify: async variables => {
      const result = await modify(variables)
      if (result) _modify(result)
      return !!result
    },
    remove: async ids => {
      const result = await remove(ids)
      if (result) _remove(result)
      return !!result
    },
  }
}

export const useMiscService = ({ miscReducer/* , reducers */ }) => {
  const [state, actions] = miscReducer
  const { fetchTags, fetchEmails, modifyEmail } = miscGate
  const { _setTags, _setEmails, _modifyEmail } = actions
  const [calendarOptions, setCalendarOptions] = useState({
    view: 'timeGridWeek',
    date: addDays(set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }), FIRST_EVENT_AFTER_DAYS),
  })

  return {
    tags: state.tags,
    emails: state.emails,
    fetchTags: async () => !state.tags.length &&
      _setTags((await fetchTags()).map(tag => ({ value: tag.name, id: tag.id, label: tag.name }))),
    fetchEmails: async () => !state.emails.length && _setEmails(await fetchEmails()),
    modifyEmail: async variables => {
      const result = await modifyEmail(variables)
      if (result) _modifyEmail(result)
      return !!result
    },
    calendarOptions,
    setCalendarOptions
  }
}

export const useUserService = ({ userReducer }) => {
  const [state, actions] = userReducer
  const { fetch, login } = userGate
  const { _current, _evict } = actions

  return {
    ...crud(state, userGate, actions),
    current: state.current,
    login: async variables => {
      _current(null)
      const token = (await login(variables))?.value
      if (token) localStorage.setItem('app-token', token)
      return !!token
    },
    fetch: async () => state.current === undefined && _current(await fetch()),
    evict: () => _evict()
  }
}

export const useGroupService = ({ groupReducer }) => {
  const [state, actions] = groupReducer
  return crud(state, groupGate, actions)
}

export const useFormService = ({ formReducer }) => {
  const [state, actions] = formReducer
  return crud(state, formGate, actions)
}

export const useExtraService = ({ extraReducer }) => {
  const [state, actions] = extraReducer
  return crud(state, extraGate, actions)
}

export const useVisitService = ({ visitReducer }) => {
  const [state, actions] = visitReducer
  const { add, fetch, remove } = visitGate
  const { _add, _current, _modify, _evict } = actions
  return {
    ...crud(state, visitGate, actions),
    current: state.current,
    add: async variables => {
      const result = await add(variables)
      if (result) {
        _add(result)
        _current(result)
      }
      return result
    },
    remove: async id => {
      const result = await remove(id)
      if (result) _modify({ ...state.all.find(v => v.id === result.id), status: false })
      return !!result
    },
    findVisit: async id => {
      const visit = state.all.find(v => v.id === id)
      if (visit) {
        _current(visit)
        return true
      }
      const result = await fetch(id)
      if (result) _current(result)
      return !!result
    },
    evict: () => _evict()
  }
}

export const useEventService = ({ eventReducer }) => {
  const [state, actions] = eventReducer
  const { _set, _setParsed, _add, _addParsed, _modify, _modifyParsed, _current, _remove, _removeParsed, _evict } = actions
  const [filtered, filterOptions, setFilterOptions] = useEventFilter(state)
  const [selected, setSelected] = useState([])

  useEventModified(actions)
  useEventsModified(actions)
  useEventsDeleted(actions)

  const toggleDisable = (e, id) => {
    const event = { ...state.all[id], disabled: e.disabled, locked: false }
    _current(event)
    _modify(event)
    _modifyParsed(event)
  }

  return {
    all: state.all ? Object.values(state.all) : undefined,
    fetchAll: async () => {
      if (!state.fetched) {
        const events = await eventGate.fetchAll()
        if (!events) return false
        _set(events?.reduce((p, e) => {
          p[e['id']] = parseFormFields(e)
          return p
        }, {}))
        _setParsed(events?.map(e => parseEvent(e)).flat())
        return true
      }
    },
    findEvent: id => state.all[id],
    add: async variables => {
      const events = await eventGate.add(variables)
      if (events) {
        _add(events.map(e => parseFormFields(e)))
        _addParsed(events.map(e => parseEvent(e)[0]))
      }
      return !!events
    },
    modify: async variables => {
      const event = await eventGate.modify(variables)
      if (event) {
        _modify(parseFormFields(event))
        _modifyParsed(event)
      }
      return !!event
    },
    remove: async ids => {
      const result = await eventGate.remove(ids)
      if (result) {
        _remove(result)
        _removeParsed(result)
      }
      return !!result
    },
    forceRemove: async variables => {
      const result = await eventGate.forceRemove(variables)
      if (result) {
        _remove(result)
        _removeParsed(result)
      }
      return !!result
    },
    set: (event, params) => {
      if (event?.__typename === 'Event') {
        _current({ ...event, ...params })
        return true
      }
      const found = state.all[event]
      if (found) {
        _current({ ...found, ...params })
        return true
      }
      return false
    },
    current: state.current,
    filterOptions,
    setFilterOptions,
    parsed: filtered.map(f => ({ ...f, selected: someExist([f.id], selected) })),
    evict: () => {
      _evict()
      setSelected([])
    },
    selected,
    select: id => {
      if (someExist([id], selected)) setSelected(selected.filter(i => i !== id))
      else setSelected(selected.concat(id))
    },
    removeSelected: async () => {
      const result = await eventGate.remove(selected)
      if (result) {
        _remove(result)
        _removeParsed(result)
      }
      setSelected([])
    },
    unSelectAll: () => setSelected([]),
    setPublish: async variables => {
      const ids = (await eventGate.setPublish(variables))?.map(e => e.id)
      if (ids) _modify(ids.map(id => ({ ...state.all[id], publishDate: variables.publishDate })))
      return !!ids
    },
    disable: async id => {
      const result = await eventGate.disable(id)
      if (result) toggleDisable(result, id)
      return !!result
    },
    enable: async id => {
      const result = await eventGate.enable(id)
      if (result) toggleDisable(result, id)
      return !!result
    },
    lock: async id => {
      const { token } = await eventGate.lock(id)
      if (token) _modify({ ...state.all[id], locked: true })
      return token
    },
    unlock: async id => {
      const result = await eventGate.unlock(id)
      if (result) _modify({ ...state.all[id], locked: false })
      return !!result
    },
    assignToGroup: async ({ events, group }) => {
      const variables = { events, group: group ? group.id : '' } // <- why ?
      const ids = (await eventGate.assignToGroup(variables))?.map(e => e.id)
      if (ids) _modify(ids.map(id => ({ ...state.all[id], group })))
      return !!ids
    },
  }
}
