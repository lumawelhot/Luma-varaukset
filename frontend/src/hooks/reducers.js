import { useReducer } from 'react'
import { parseEvent } from '../helpers/parse'
import { addOrUpdateById, deleteByIds, someExist } from '../helpers/utils'
// WARNING: avoid updating state in a loop, it may be a huge performance loss
// If you need looping then modify actions so you can update multiple things at once

const classified = (state, action) => {
  switch (action.type) {
    case 'set':
      return { ...state, all: action.all }
    case 'current':
      return { ...state, current: action.current }
    case 'add':
      return { ...state, all: state.all.concat(action.add) }
    case 'modify':
      return {
        ...state,
        current: state.current?.id === action.modify?.id ? action.modify : state.current,
        all: state.all.map(v => v.id === action.modify?.id ? action.modify : v)
      }
    case 'remove':
      return { ...state, all: state.all
        .filter(v => !action.ids.includes(v.id)) }
    case 'evict':
      return action.init
    default:
      return { ...state }
  }
}

const crud = dispatch => ({
  _set: all => dispatch({ type: 'set', all }),
  _add: add => dispatch({ type: 'add', add }),
  _modify: modify => dispatch({ type: 'modify', modify }),
  _remove: ids => dispatch({ type: 'remove', ids }),
})

export const userMiscReducer = () => {
  const init = { emails: [], tags: [] }
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'setTags':
        return { ...state, tags: action.tags }
      case 'setEmails':
        return { ...state, emails: action.emails }
      case 'modifyEmail':
        return { ...state, emails: state.emails
          .map(e => e.name === action.email.name ? action.email : e) }
      default:
        return { ...state }
    }
  }, init)
  return [state, {
    _setTags: tags => dispatch({ type: 'setTags', tags }),
    _setEmails: emails => dispatch({ type: 'setEmails', emails }),
    _modifyEmail: email => dispatch({ type: 'modifyEmail', email })
  }]
}

export const useUserReducer = () => {
  const init = { current: undefined, all: [] }
  const [state, dispatch] = useReducer(classified, init)
  return [state, {
    ...crud(dispatch),
    _current: current => dispatch({ type: 'current', current }),
    _evict: () => dispatch({ type: 'evict', init })
  }]
}

export const useGroupReducer = () => {
  const init = { current: undefined, all: [] }
  const [state, dispatch] = useReducer(classified, init)
  return [state, crud(dispatch)]
}

export const useFormReducer = () => {
  const init = { current: undefined, all: [] }
  const [state, dispatch] = useReducer(classified, init)
  return [state, crud(dispatch)]
}

export const useExtraReducer = () => {
  const init = { current: undefined, all: [] }
  const [state, dispatch] = useReducer(classified, init)
  return [state, crud(dispatch)]
}

export const useVisitReducer = () => {
  const init = { current: undefined, all: [] }
  const [state, dispatch] = useReducer(classified, init)
  return [state, {
    ...crud(dispatch),
    _current: current => dispatch({ type: 'current', current }),
    _evict: () => dispatch({ type: 'evict', init })
  }]
}

export const useEventReducer = () => {
  const init = {
    current: undefined,
    all: {},
    parsed: [],
    fetched: false,
  }
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'set':
        return { ...state, all: action.all, fetched: true }
      case 'setParsed':
        return { ...state, parsed: action.parsed, fetched: true }
      case 'current':
        return { ...state, current: action.current }
      case 'add':
        return { ...state, all: addOrUpdateById(state.all, action.add) }
      case 'addParsed':
        return { ...state, parsed: state.parsed.concat(action.add) }
      case 'modify':
        return { ...state, all: addOrUpdateById(state.all, action.modify) }
      case 'modifyParsed':
        return {
          ...state,
          parsed: state.parsed.filter(p => p.id !== action.modify.id)
            .concat(parseEvent(action.modify))
        }
      case 'remove':
        return { ...state, all: deleteByIds(state.all, action.remove) }
      case 'removeParsed':
        return { ...state, parsed: state.parsed.filter(p => !someExist([p.id], action.remove)) }
      case 'evict':
        return action.init
      default:
        return { ...state }
    }
  }, init)

  return [state, {
    ...crud(dispatch),
    _current: current => dispatch({ type: 'current', current }),
    _setParsed: parsed => dispatch({ type: 'setParsed', parsed }),
    _addParsed: add => dispatch({ type: 'addParsed', add }),
    _removeParsed: remove => dispatch({ type: 'removeParsed', remove }),
    _modifyParsed: modify => dispatch({ type: 'modifyParsed', modify }),
    _evict: () => dispatch({ type: 'evict', init })
  }]
}
