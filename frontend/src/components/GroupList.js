import { useMutation, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { CREATE_GROUP, DELETE_GROUP, GET_GROUPS } from '../graphql/queries'

const GroupList = () => {
  const { t } = useTranslation('common')
  const history = useHistory()
  const [name, setName] = useState('')
  const [maxCount, setMaxCount] = useState('')
  const groups = useQuery(GET_GROUPS)
  const [createGroup] = useMutation(CREATE_GROUP, {
    refetchQueries: GET_GROUPS,
    onError: error => console.log(error),
    onCompleted: () => groups.refetch()
  })
  const [deleteGroup] = useMutation(DELETE_GROUP, {
    refetchQueries: GET_GROUPS,
    onError: error => console.log(error),
    onCompleted: () => groups.refetch()
  })
  if (groups.loading) return <></>
  console.log(groups)

  const handleBack = () => {
    history.push('/')
  }

  const addGroup = () => {
    createGroup({
      variables: {
        name,
        maxCount
      }
    })
    setName('')
    setMaxCount('')
  }

  const handleRemove = (group) => {
    deleteGroup({
      variables: {
        group
      }
    })
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
            <th>{t('publish-date')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {groups.data.getGroups.map(group =>
            <tr key={group.id}>
              <td>{group.name}</td>
              <td>{group.maxCount}</td>
              <td>{group.visitCount}</td>
              <td>{group.publishDate}</td>
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
          onChange={(event) => setMaxCount(Number(event.target.value))}
        />
        <button className="button luma primary" onClick={addGroup} >{t('add-group')}</button>
        <button className="button luma" onClick={handleBack} >{t('back')}</button>
      </div>
    </div>
  )
}

export default GroupList