import { Heading } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Table from '../Table'
import { userColumns } from '../../helpers/columns'
import { Button } from '../Embeds/Button'
import { exec } from '../../helpers/utils'
import { useUsers } from '../../hooks/cache'
import User from '../Modals/User'

const UserList = () => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState()
  const { all, current, fetchAll, remove } = useUsers()
  useEffect(exec(fetchAll), [current])

  const users = useMemo(() => all?.
    map(u => ({
      id: u.id,
      username: u.username,
      privileges: u.isAdmin ? t('admin') : t('employee'),
      options: <Button onClick={() => {
        setSelected({ ...u, isAdmin: String(u.isAdmin) })
      }}>{t('modify-user')}</Button>,
      nocheck : u.username === current?.username ? true : false
    }))
  , [all, current, t])

  const handleRemove = e => {
    if (confirm('remove-user-confirm')) {
      remove(e.checked.map(i => users[i].id))
      e.reset()
    }
  }

  const columns = useMemo(userColumns, [t])

  if (!users) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('users')}</Heading>
      <Table checkboxed data={users} columns={columns} component={e => (<>
        <Button onClick={() => setSelected(null)}>{t('create-user')}</Button>
        {e.checked.length > 0 && <Button onClick={() => handleRemove(e)}>
          {t('remove-chosen')}
        </Button>}
      </>)}/>
      {selected !== undefined && <User
        close={() => setSelected()}
        type={selected === null ? 'create' : 'modify'}
        initialValues={selected && { ...selected, password: '' }}
      />}
    </>
  )
}

export default UserList
