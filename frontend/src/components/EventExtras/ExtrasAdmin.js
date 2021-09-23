import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useHistory } from 'react-router'
import { EXTRAS, CREATE_EXTRA, DELETE_EXTRA, MODIFY_EXTRA } from '../../graphql/queries'
import AddExtraForm from './Form'
import { useTranslation } from 'react-i18next'
import { Popconfirm } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import Filterform from '../Filter/Filterform'

const ExtrasAdmin = ({ sendMessage }) => {
  const { t } = useTranslation('common')
  const extras = useQuery(EXTRAS)
  const history = useHistory()
  const [modalState, setModalState] = useState(null)
  const [selectedExtra, setSelectedExtra] = useState(null)
  const [filters, setFilters] = useState([1, 2, 3, 4, 5])

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  const [createExtra] = useMutation(CREATE_EXTRA, {
    refetchQueries: [{ query: EXTRAS }],
    onError: () => sendMessage(t('failed-to-create-extra'), 'danger'),
    onCompleted: () => sendMessage(t('extra-added'), 'success')
  })

  const [deleteExtra] = useMutation(DELETE_EXTRA, {
    refetchQueries: [{ query: EXTRAS }],
    onError: () => sendMessage(t('failed-to-delete-extra'), 'danger'),
    onCompleted: () => sendMessage(t('extra-removed'), 'success')
  })

  const [modifyExtra] = useMutation(MODIFY_EXTRA, {
    refetchQueries: [{ query: EXTRAS }],
    onError: () => sendMessage(t('failed-to-modify-extra'), 'danger')
  })

  const handleAdd = values => {
    createExtra({
      variables: {
        ...values
      }
    })
    setModalState(null)
  }

  const handleRemove = id => {
    deleteExtra({
      variables: {
        id
      }
    })
  }

  const handleModify = (values) => {
    modifyExtra({
      variables: {
        id: selectedExtra.id,
        ...values
      }
    })
    setModalState(null)
  }

  if (extras.loading) return <></>

  return (
    <div className="section">
      <h1 className="title">{t('extras')}</h1>
      <Filterform values={filters} setValues={setFilters} />
      <table className="table">
        <thead>
          <tr>
            <th>{t('name')}</th>
            <th>{t('inperson-length')}</th>
            <th>{t('remote-length')}</th>
            <th>SUM</th>
            <th>FOT</th>
            <th>LIN</th>
            <th>GEO</th>
            <th>GAD</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {extras.data.getExtras.filter(extra => extra.classes.some(c => filters.includes(c))).map(extra => (
            <tr key={extra.id}>
              <td>{extra.name}</td>
              <td>{extra.inPersonLength}</td>
              <td>{extra.remoteLength}</td>
              <td>{extra.classes.includes(1) ? <CheckCircleOutlined /> : ''}</td>
              <td>{extra.classes.includes(2) ? <CheckCircleOutlined /> : ''}</td>
              <td>{extra.classes.includes(3) ? <CheckCircleOutlined /> : ''}</td>
              <td>{extra.classes.includes(4) ? <CheckCircleOutlined /> : ''}</td>
              <td>{extra.classes.includes(5) ? <CheckCircleOutlined /> : ''}</td>
              <td><button className='button luma' onClick={() => {
                setModalState('modify')
                setSelectedExtra(extra)
              }}>{t('modify')}</button></td>
              <td>
                <Popconfirm
                  title={t('do-you-want-to-remove')}
                  onConfirm={() => handleRemove(extra.id)}
                  okText={t('yes')}
                  cancelText={t('no')}
                >
                  <button className='button luma'>{t('remove')}</button>
                </Popconfirm>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="field is-grouped">
        <div className="control">
          <button className="button luma primary" onClick={() => setModalState('add')}>{t('add-new')}</button>
        </div>
        <div className="control">
          <button className="button luma" onClick={cancel}>{t('back')}</button>
        </div>
      </div>
      {modalState &&
        <div className="modal is-active">
          <div className="modal-background"></div>
          <AddExtraForm
            handleAdd={handleAdd}
            handleModify={handleModify}
            setModalState={setModalState}
            modalState={modalState}
            extra={selectedExtra}
          />
        </div>
      }
    </div>
  )
}

export default ExtrasAdmin