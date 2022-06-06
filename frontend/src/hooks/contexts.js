import { useContext } from 'react'
import { EventContext, UserContext, VisitContext } from '../services/contexts'

export const useEvict = () => {
  const user = useContext(UserContext)
  const visits = useContext(VisitContext)
  const events = useContext(EventContext)

  const evict = () => {
    user.evict()
    visits.evict()
    events.evict()
  }

  return { evict }
}