import { addYears } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import Filterform from '../Filter/Filterform'
import DatePicker from '../Pickers/DatePicker'
import Form from '../EventList/Form'
import Table from './Table'
import GroupModal from './GroupModal'

const EventList = ({ events, sendMessage, currentUser }) => {
  const { t } = useTranslation('event')
  const history = useHistory()
  const [filters, setFilters] = useState([1, 2, 3, 4, 5])
  const [modalState, setModalState] = useState(null)
  const [checkedEvents, setCheckedEvents] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(new Date())

  const [tableEvents, setTableEvents] = useState(
    events
      .filter(event => {
        return event.resourceids.some(r => filters.includes(r))
      })
      .slice()
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  )

  useEffect(() => {
    setTableEvents(events
      .filter(event => {
        return event.resourceids.some(r => filters.includes(r))
      })
      .filter(event => {
        const date = new Date(event.start)
        return (startDate <= date && date <= (endDate ? endDate : addYears(new Date(), 100))) ? true : false
      }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()))
    setCheckedEvents([])
  }, [startDate, endDate, events, filters])

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
          <Form
            sendMessage={sendMessage}
            setModalState={setModalState}
            checkedEvents={checkedEvents}
            events={events}
          />
        </div>
      }
      <div className="section">
        <h1 className="title">{t('events')}</h1>
        <Filterform values={filters} setValues={setFilters} />
        <label style={{ fontWeight: 'bold', fontSize: 15 }}>{t('time-line')}: </label>
        <DatePicker
          value={startDate}
          onChange={value => setStartDate(value)}
        />
        <label style={{ fontWeight: 'bold' }}> - </label>
        <DatePicker
          value={endDate}
          onChange={value => setEndDate(value)}
        />
        <Table handleCheckEvent={handleCheckEvent} tableEvents={tableEvents} checkedEvents={checkedEvents} />
        <div className="field is-grouped">
          <button className="button luma primary" onClick={openGroupModal} >{t('assign-to-group')}</button>
          {currentUser.isAdmin &&
            <button className="button luma primary" onClick={openDeleteModal} >{t('delete-choosen-events')}</button>
          }
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