import { Heading } from '@chakra-ui/react'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Table from '../Table'
import { userColumns } from '../../helpers/columns'
import { UserContext } from '../../services/contexts'
import { Button } from '../../Embeds/Button'
import CreateUser from '../Modals/CreateUser'
import { userInit } from '../../helpers/initialvalues'
import ModifyUser from '../Modals/ModifyUser'

const UserList = () => {
  const { t } = useTranslation()
  const [showAdd, setShowAdd] = useState(false)
  const [showModify, setShowModify] = useState(false)
  const [selected, setSelected] = useState()
  const userContext = useContext(UserContext)
  useEffect(() => userContext.fetchAll(), [userContext])

  const users = useMemo(() => userContext?.all?.
    map(u => ({
      id: u.id,
      username: u.username,
      privileges: u.isAdmin ? t('admin') : t('employee'),
      options: <Button onClick={() => {
        setSelected({ ...u, isAdmin: String(u.isAdmin) })
        setShowModify(true)
      }}>{t('modify-user')}</Button>,
      nocheck : u.username === userContext?.current?.username ? true : false
    }))
  , [userContext.all, userContext.current, t])

  const handleRemove = e => {
    userContext.remove(e.checked.map(i => users[i].id))
    e.reset()
  }

  const columns = useMemo(userColumns, [t])

  if (!users) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('users')}</Heading>
      <Table checkboxed data={users} columns={columns} component={e => (<>
        <Button onClick={() => setShowAdd(true)}>{t('create-user')}</Button>
        <Button onClick={() => handleRemove(e)}>{t('remove-chosen')}</Button>
      </>)}/>
      <CreateUser
        show={showAdd}
        close={() => setShowAdd(false)}
        initialValues={userInit}
      />
      {showModify && <ModifyUser
        show={showModify}
        close={() => setShowModify(false)}
        initialValues={selected ? { ...selected, password: '' } : userInit}
      />}
    </>
  )
}

export default UserList
