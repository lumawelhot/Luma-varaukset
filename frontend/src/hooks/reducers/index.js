import { useReducer } from 'react'
import classified from './classified'

const crud = dispatch => ({
  set: all => dispatch({ type: 'set', all }),
  add: add => dispatch({ type: 'add', add }),
  modify: modify => dispatch({ type: 'modify', modify }),
  remove: ids => dispatch({ type: 'remove', ids }),
})

export const useUserReducer = () => {
  const init = { current: undefined, all: [] }
  const [state, dispatch] = useReducer(classified, init)
  return [state, {
    ...crud(dispatch),
    current: current => dispatch({ type: 'current', current }),
    evict: () => dispatch({ type: 'evict', init })
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
    current: current => {
      console.log(current)
      const r = dispatch({ type: 'current', current })
      console.log(r)
      return r
    },
    evict: () => dispatch({ type: 'evict', init })
  }]
}

export const useEventReducer = () => {
  const init = { current: undefined, all: [] }
  const [state, dispatch] = useReducer(classified, init)
  return [state, {
    ...crud(dispatch)
  }]
}
