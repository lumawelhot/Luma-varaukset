import React, { useContext } from 'react'
import { Formik } from 'formik'
import { Modal, Stack } from 'react-bootstrap'
import { Input } from '../../Embeds/Input'
import { useTranslation } from 'react-i18next'
import { Button } from '../../Embeds/Button'
import { UserContext } from '../../services/contexts'
import { Radio, RadioGroup } from '@chakra-ui/react'
import Title from '../../Embeds/Title'
import { userValidate } from '../../helpers/validate'
import { userInit } from '../../helpers/initialvalues'

const CreateUser = ({ show, close }) => {
  const { t } = useTranslation()
  const { add } = useContext(UserContext)

  const submit = async (values, formik) => {
    const { username, password, isAdmin } = values
    if (await add({ username, password, isAdmin: isAdmin === 'true' })) close()
    formik.resetForm()
  }

  return (
    <Formik
      validate={userValidate}
      initialValues={userInit}
      onSubmit={submit}
    >
      {({ handleChange, handleSubmit, values, setFieldValue }) => (
        <Modal
          show={show}
          onHide={close}
          backdrop="static"
          scrollable={true}
        >
          <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
            <Modal.Title>{t('create-user-header')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input
              id='username'
              title={t('username')}
              onChange={handleChange}
              value={values.username}
            />
            <Input
              id='password'
              title={t('password')}
              type='password'
              onChange={handleChange}
              value={values.password}
            />
            <Input
              id='confirm'
              title={t('confirm')}
              type='password'
              onChange={handleChange}
              value={values.confirm}
            />
            <Title>{t('user-role')}</Title>
            <RadioGroup onChange={v => setFieldValue('isAdmin', v)} value={values.isAdmin}>
              <Stack direction='col'>
                <Radio value='true'>{t('admin')}</Radio>
                <Radio value='false'>{t('employee')}</Radio>
              </Stack>
            </RadioGroup>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
            <Button
              className='active'
              onClick={handleSubmit}
              type='submit'
            >
              {t('create-user')}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Formik>
  )
}

export default CreateUser
