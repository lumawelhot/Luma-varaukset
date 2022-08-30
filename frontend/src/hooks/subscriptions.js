import { useSubscription } from '@apollo/client'
import { EVENTS_DELETED, EVENTS_MODIFIED, EVENT_MODIFIED } from '../graphql/queries'
import { eventGate } from '../gateway/endpoints'
import { parseFormFields } from '../helpers/parse'

const addOrModify = (event, actions) => {
  if (event.publishDate && new Date() < new Date(event.publishDate)) return
  actions._modify(parseFormFields(event))
  actions._modifyParsed(event)
}

export const useEventModified = (actions) => {
  useSubscription(EVENT_MODIFIED, {
    onSubscriptionData: async e => {
      const id = e?.subscriptionData?.data?.eventModified?.id
      const event = await eventGate.fetch(id)
      if (event) addOrModify(event, actions)
    }
  })
}

export const useEventsModified = (actions) => {
  useSubscription(EVENTS_MODIFIED, {
    onSubscriptionData: async e => {
      const ids = e?.subscriptionData?.data?.eventsModified?.map(e => e.id)
      if (ids) {
        const events = await eventGate.fetchAll(ids)
        if (events) {
          for (const event of events) addOrModify(event, actions)
        }
      }
    }
  })
}

export const useEventsDeleted = ({ _remove, _removeParsed }) => {
  useSubscription(EVENTS_DELETED, {
    onSubscriptionData: e => {
      const ids = e?.subscriptionData?.data?.eventsDeleted
      if (ids) {
        _remove(ids)
        _removeParsed(ids)
      }
    }
  })
}
