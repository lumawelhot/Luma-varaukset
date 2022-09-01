import React from 'react'
import * as _R from './hooks/reducers'
import * as _S from './hooks/services'
import PropTypes from 'prop-types'

export const LumaContext = React.createContext()

const Cache = ({ children }) => {
  const reducers = {
    userReducer: _R.useUserReducer(),
    groupReducer: _R.useGroupReducer(),
    formReducer: _R.useFormReducer(),
    extraReducer: _R.useExtraReducer(),
    visitReducer: _R.useVisitReducer(),
    eventReducer: _R.useEventReducer(),
    miscReducer: _R.userMiscReducer(),
  }
  // Why we are defining services this way?
  // We don't want to prevent services to use other parts of the cache
  // Still for example avoid using "visitReducer" in "events" service because it breaks modularity
  const services = {
    users: _S.useUserService({ userReducer: reducers.userReducer, reducers }),
    groups: _S.useGroupService({ groupReducer: reducers.groupReducer, reducers }),
    forms: _S.useFormService({ formReducer: reducers.formReducer, reducers }),
    extras: _S.useExtraService({ extraReducer: reducers.extraReducer, reducers }),
    visits: _S.useVisitService({ visitReducer: reducers.visitReducer, reducers }),
    events: _S.useEventService({ eventReducer: reducers.eventReducer, reducers }),
    misc: _S.useMiscService({ miscReducer: reducers.miscReducer, reducers })
  }

  return <LumaContext.Provider value={{ services }}>{children}</LumaContext.Provider>
}

export default Cache

Cache.propTypes = {
  children: PropTypes.node.isRequired
}
