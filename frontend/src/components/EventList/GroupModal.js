import { useMutation, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ASSIGN_EVENTS_TO_GROUP, EVENTS, GET_GROUPS } from '../../graphql/queries'

const GroupModal = ({ setModalState, checkedEvents, events }) => {
  const { t } = useTranslation('event')
  const groups = useQuery(GET_GROUPS)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [assignEventsToGroup] = useMutation(ASSIGN_EVENTS_TO_GROUP, {
    refetchQueries: [{ query: EVENTS }, { query: GET_GROUPS }],
    onError: (error) => console.log(error),
    onCompleted: () => setModalState(null)
  })
  if (!groups.data) return <></>

  const assignToGroup = () => {
    assignEventsToGroup({
      variables: {
        group: selectedGroup,
        events: checkedEvents
      }
    })
  }

  return (
    <div className="modal-card">
      <header className="modal-card-head">
        <p className="modal-card-title">{t('assign-events-to-group')}</p>
      </header>
      <section className="modal-card-body">
        <div className="label">{t('events')}:</div>
        <ul>
          {events.filter(event => checkedEvents.includes(event.id)).map(event =>
            <li key={event.id}>{event.title}</li>
          )}
        </ul>
        <div className="field">
          <label className="label" htmlFor="fieldName">{t('group')}</label>
          <div className="control">
            <div className="select">
              <select
                value={selectedGroup}
                onChange={event => setSelectedGroup(event.target.value)}>
                <option></option>
                {groups.data.getGroups.map(o => <option
                  key={o.id}
                  value={o.id}
                >{o.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>
      <footer className="modal-card-foot">
        <button className="button luma" type='submit' onClick={assignToGroup}>{t('assign-to-group')}</button>
        <button className="button" onClick={() => setModalState(null)}>{t('close')}</button>
      </footer>
    </div>
  )
}

export default GroupModal