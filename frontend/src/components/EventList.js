import { useMutation, useQuery } from '@apollo/client'
import { format } from 'date-fns'
import { Field, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { ASSIGN_EVENTS_TO_GROUP, EVENTS, FORCE_DELETE_EVENTS, GET_GROUPS } from '../graphql/queries'
import { classes } from '../helpers/classes'
import { resourceColorsLUMA } from '../helpers/styles'
import DatePicker from './Pickers/DatePicker'
import { TextField } from './VisitForm/FormFields'

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
    console.log(selectedGroup)
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

const EventList = ({ events, sendMessage }) => {
  const { t } = useTranslation('event')
  const history = useHistory()
  const [modalState, setModalState] = useState(null)
  const [checkedEvents, setCheckedEvents] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(new Date())
  const [showEvents, setShowEvents] = useState(false)
  const [tableEvents, setTableEvents] = useState(
    events.slice().sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  )

  useEffect(() => {
    setTableEvents(events.filter(event => {
      const date = new Date(event.start)
      return (startDate <= date && date <= endDate) ? true : false
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()))
    setCheckedEvents([])
  }, [startDate, endDate, events])

  const [forceDeleteEvents] = useMutation(FORCE_DELETE_EVENTS, {
    refetchQueries: [{ query: EVENTS }],
    onError: () => sendMessage(t('failed-to-remove-events'), 'danger'),
    onCompleted: () => {
      setModalState(null)
      sendMessage(t('events-removed-successfully'), 'success')
    }
  })

  const handleCheckEvent = (event, id) => {
    if (event.target.checked) {
      setCheckedEvents(checkedEvents.concat(id))
    } else {
      setCheckedEvents(checkedEvents.filter(e => e !== id))
    }
  }

  const handleBack = () => {
    history.push('/')
  }

  const openDeleteModal = () => {
    setModalState('delete')
  }

  const openGroupModal = () => {
    setModalState('group')
  }

  const handleDeleteEvents = (values) => {
    forceDeleteEvents({
      variables: {
        events: checkedEvents,
        password: values.password
      }
    })
    values.password = ''
  }

  const handleChooseAll = () => {
    if (checkedEvents.length === tableEvents.length) {
      setCheckedEvents([])
    }
    else {
      setCheckedEvents(tableEvents.map(event => event.id))
    }
  }

  return (
    <>
      <div className={`modal ${modalState === 'group' ? 'is-active':''}`}>
        <div className="modal-background"></div>
        <GroupModal
          setModalState={setModalState}
          checkedEvents={checkedEvents}
          events={events}
        />
      </div>
      {modalState === 'delete' &&
        <div className={`modal ${modalState ? 'is-active': ''}`}>
          <div className="modal-background"></div>
          <Formik
            initialValues={{
              password: ''
            }}
            onSubmit={handleDeleteEvents}
          >
            {({ handleSubmit }) => {
              return (
                <div className="modal-card">
                  <header className="modal-card-head">
                    <p className="modal-card-title">{t('delete-events-confirm')}</p>
                  </header>
                  <section className="modal-card-body">
                    <div className="label" style={{ color: 'red' }}>{t('event-deletion-alert-text')}</div>
                    {checkedEvents.length ?
                      <>
                        <Field
                          label={t('confirm-with-password')}
                          fieldName='password'
                          type='password'
                          component={TextField}
                        />
                        {showEvents &&
                          <>
                            <div className="label">{t('events')}:</div>
                            <ul>
                              {events.filter(event => checkedEvents.includes(event.id)).map(event =>
                                <li key={event.id}>{event.title}</li>
                              )}
                            </ul>
                            <a onClick={() => setShowEvents(false)}>{t('hide-events-to-be-removed')}</a>
                          </>
                        }
                        {!showEvents &&
                          <a onClick={() => setShowEvents(true)}>{t('show-events-to-be-removed')}</a>
                        }
                      </>
                      :
                      <div className="label">{t('no-events-chosen')}</div>
                    }
                  </section>
                  <footer className="modal-card-foot">
                    <button className="button luma" onClick={handleSubmit} type='submit'>{t('delete-events')}</button>
                    <button className="button" onClick={() => setModalState(null)}>{t('close')}</button>
                  </footer>
                </div>
              )}}
          </Formik>
        </div>
      }
      <div className="section">
        <h1 className="title">{t('events')}</h1>
        <label style={{ fontWeight: 'bold' }}>{t('time-line')}: </label>
        <DatePicker
          value={startDate}
          onChange={value => setStartDate(value)}
        />
        <label style={{ fontWeight: 'bold' }}> - </label>
        <DatePicker
          value={endDate}
          onChange={value => setEndDate(value)}
        />
        <table className="table" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th></th>
              <th>{t('event')}</th>
              <th>{t('resource')}</th>
              <th>{t('date')}</th>
              <th>{t('time')}</th>
              <th>{t('group')}</th>
            </tr>
          </thead>
          <tbody>
            {tableEvents.map(event => {
              const resourceNames = event.resourceids.map(id => { return { name: classes[id-1]?.label || null, color: resourceColorsLUMA[id - 1] }})
              return (
                <tr key={event.id}>
                  <td>
                    <input
                      type="checkbox" checked={checkedEvents.includes(event.id) ? 'checked' : ''}
                      onChange={(e) => handleCheckEvent(e, event.id)} />
                  </td>
                  <td>{event.title}</td>
                  <td>
                    {!!resourceNames.length && <div className="tags">
                      {resourceNames.map(r =>
                        <span key={r.name} className='tag is-small is-link' style={{ backgroundColor: r.color }}>{r.name}</span>)}
                    </div>}
                  </td>
                  <td>{`${format(new Date(event.start), 'dd.MM.yyyy')}`}</td>
                  <td>{`${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')}`}</td>
                  <td>{event.group ? event.group.name : ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="field is-grouped">
          <button className="button luma primary" onClick={openGroupModal} >{t('assign-to-group')}</button>
          <button className="button luma primary" onClick={openDeleteModal} >{t('delete-choosen-events')}</button>
          <div className="control">
            <button className="button luma" onClick={handleChooseAll} >{checkedEvents.length !== tableEvents.length ? t('choose-all') : t('deselect')}</button>
          </div>
          <button className="button luma" onClick={handleBack} >{t('back')}</button>
        </div>
      </div>
    </>
  )
}

export default EventList