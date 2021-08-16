import { useMutation, useQuery } from '@apollo/client'
import { format, parseISO, set } from 'date-fns'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { CREATE_GROUP, DELETE_GROUP, EVENTS, GET_GROUPS, UPDATE_GROUP } from '../graphql/queries'
import DatePicker from './Pickers/DatePicker'
import TimePicker from './Pickers/TimePicker'

const GroupList = () => {
  const { t } = useTranslation('common')
  const history = useHistory()
  const [name, setName] = useState('')
  const [maxCount, setMaxCount] = useState('')
  const groups = useQuery(GET_GROUPS)
  const [createGroup] = useMutation(CREATE_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }],
    onError: error => console.log(error)
  })
  const [modifyGroup] = useMutation(UPDATE_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }, { query: EVENTS }],
    onError: error => console.log(error)
  })
  const [deleteGroup] = useMutation(DELETE_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }, { query: EVENTS }],
    onError: error => console.log(error),
  })
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [publishDay, setPublishDay] = useState(null)
  const [publishTime, setPublishTime] = useState(null)

  if (groups.loading) return <></>
  const handleBack = () => {
    history.push('/')
  }

  const getPublishDate = () => {
    let publishDate = null
    if (publishDay && publishTime) {
      const time = new Date(publishTime)
      publishDate = set(new Date(publishDay), { hours: time.getHours(), minutes: time.getMinutes(), seconds: 0 })
      return publishDate.toISOString()
    }
    return null
  }

  const addGroup = () => {
    createGroup({
      variables: {
        name,
        maxCount,
        publishDate: getPublishDate()
      }
    })
    setName('')
    setMaxCount('')
  }

  const updateGroup = () => {
    modifyGroup({
      variables: {
        id: selectedGroup,
        name,
        maxCount,
        publishDate: getPublishDate()
      }
    })
  }

  const handleRemove = (group) => {
    deleteGroup({
      variables: {
        group
      }
    })
  }

  const handleUpdate = group => {
    if (group.id === selectedGroup) {
      setSelectedGroup(null)
      setName('')
      setMaxCount('')
      setPublishTime(null)
      setPublishDay(null)
    } else {
      setSelectedGroup(group.id)
      setName(group.name)
      setMaxCount(Number(group.maxCount))
      setPublishDay(group.publishDate ? new Date(group.publishDate) : undefined)
      setPublishTime(group.publishDate ? new Date(group.publishDate) : undefined)
    }
  }

  return (
    <div className="section">
      <h1 className="title">{t('groups')}</h1>
      <table className="table" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>{t('name')}</th>
            <th>{t('max-number-of-visits')}</th>
            <th>{t('number-of-booked-visits')}</th>
            <th>{t('publish')}</th>
            <th>{t('number-of-events')}</th>
            <th>{t('disabled')}</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {groups.data.getGroups.map(group =>
            <tr key={group.id}>
              <td>{group.name}</td>
              <td>{group.maxCount}</td>
              <td>{group.visitCount}</td>
              <td>{group.publishDate ? format(parseISO(group.publishDate), 'd.M.yyyy, HH:mm') : ''}</td>
              <td>{group.events.length}</td>
              <td>{group.disabled ? t('yes') : t('no')}</td>
              <td>
                <button className={`button luma ${selectedGroup === group.id ? 'active' : ''}`} onClick={() => handleUpdate(group)}>{t('change-details')}</button>
              </td>
              <td>
                <button className="button luma" onClick={() => handleRemove(group.id)}>{t('remove')}</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="field is-grouped">
        <input
          className="input"
          value={name}
          placeholder={t('name')}
          style={{ width: 150, marginRight: 10 }}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className="input"
          type="number"
          value={maxCount}
          placeholder={t('max-count')}
          style={{ width: 150, marginRight: 10 }}
          onChange={(event) => setMaxCount(Number(event.target.value) > 0 ? Number(event.target.value) : '')}
        />
        <DatePicker
          format={'d.M.yyyy'}
          value={publishDay}
          placeholder={t('publish-date')}
          style={{ width: 150, marginRight: 10 }}
          onChange={value => setPublishDay(value)}
        />
        <TimePicker
          value={publishTime}
          placeholder={t('publish-time')}
          style={{ width: 150, marginRight: 10 }}
          onChange={value => setPublishTime(value)}
        />
        {!selectedGroup &&
          <button className="button luma primary" onClick={addGroup} >{t('add-group')}</button>
        }
        {selectedGroup &&
          <button className="button luma primary" onClick={updateGroup} >{t('update')}</button>
        }
      </div>
      <div className="control" >
        <button className="button luma" onClick={handleBack} >{t('back')}</button>
      </div>
    </div>
  )
}

export default GroupList