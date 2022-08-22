import * as userGate from '../gateway/users'
import * as groupGate from '../gateway/groups'
import * as formGate from '../gateway/forms'
import * as extraGate from '../gateway/extras'
import * as visitGate from '../gateway/visits'
import * as eventGate from '../gateway/events'
import {
  useGroupReducer,
  useUserReducer,
  useFormReducer,
  useExtraReducer,
  useVisitReducer,
  useEventReducer
} from './reducers'

const crud = (state, gateway, actions) => {
  const { fetchAll, add: _add, modify: _modify, remove: _remove } = gateway
  const { set, add, modify, remove } = actions

  return {
    all: state.all,
    fetchAll: async () => !state.all.length && set(await fetchAll()),
    add: async variables => {
      const result = await _add(variables)
      if (result) add(result)
      return !!result
    },
    modify: async variables => {
      const result = await _modify(variables)
      if (result) modify(result)
      return !!result
    },
    remove: async ids => {
      const result = await _remove(ids)
      if (result) remove(result)
      return !!result
    },
  }
}

export const useUserService = () => {
  const [state, { set, current, add, modify, evict, remove }] = useUserReducer()
  const { fetch, login } = userGate

  return {
    ...crud(state, userGate, { set, add, modify, remove }),
    current: state.current,
    login: async variables => {
      const token = await login(variables)
      if (token) localStorage.setItem('app-token', token)
      return !!token
    },
    fetch: async () => !state.current && current(await fetch()),
    evict: () => evict()
  }
}

export const useGroupService = () => {
  const [state, actions] = useGroupReducer()
  return crud(state, groupGate, actions)
}

export const useFormService = () => {
  const [state, actions] = useFormReducer()
  return crud(state, formGate, actions)
}

export const useExtraService = () => {
  const [state, actions] = useExtraReducer()
  return crud(state, extraGate, actions)
}

export const useVisitService = () => {
  const [state, actions] = useVisitReducer()
  const { add: _add, fetch, remove } = visitGate
  const { add, current, modify, evict } = actions
  return {
    ...crud(state, visitGate, actions),
    current: state.current,
    add: async variables => {
      const result = await _add(variables)
      if (result) {
        add(result)
        current(result)
      }
      return !!result
    },
    remove: async id => {
      const result = await remove(id)
      if (result) modify({ ...state.all.find(v => v.id === result.id), status: false })
      return !!result
    },
    find: async id => {
      const visit = state.all.find(v => v.id === id)
      if (visit) {
        current(visit)
        return true
      }
      const result = await fetch(id)
      if (result) current(result)
      return !!result
    },
    evict: () => evict()
  }
}

export const useEventService = () => {
  const [state, actions] = useEventReducer()
  return {
    ...crud(state, eventGate, actions)
  }
}
