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

export default classified
