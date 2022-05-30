import { RadioGroup } from '@chakra-ui/react'
import { Formik } from 'formik'
import React, { useContext } from 'react'
import { Modal, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button, Radio } from '../../Embeds/Button'
import { Input } from '../../Embeds/Input'
import Title from '../../Embeds/Title'
import { userValidateModify } from '../../helpers/validate'
import { UserContext } from '../../services/contexts'

const ModifyUser = ({ show, close, initialValues }) => {
  const { t } = useTranslation()
  const { current: user, modify } = useContext(UserContext)

  const submit = async (values, formik) => {
    const { username, password, isAdmin } = values
    if (await modify({ user: values.id, username, password, isAdmin: isAdmin === 'true' })) close()
    formik.resetForm()
  }

  return (
    <Formik
      validate={userValidateModify}
      initialValues={initialValues}
      onSubmit={submit}
    >
      {({ handleChange, setFieldValue, handleSubmit, values }) => (
        <Modal
          show={show}
          onHide={close}
          backdrop="static"
          scrollable={true}
        >
          <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
            <Modal.Title>{t('modify-user-header')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input
              id='username'
              title={t('username')}
              onChange={handleChange}
              value={values.username}
            />
            {user.id !== values.id && <>
              <Title>{t('user-role')}</Title>
              <RadioGroup onChange={v => setFieldValue('isAdmin', v)} value={values.isAdmin}>
                <Stack direction='col'>
                  <Radio value='true'>{t('admin')}</Radio>
                  <Radio value='false'>{t('employee')}</Radio>
                </Stack>
              </RadioGroup>
            </>}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
            <Button
              className='active'
              onClick={handleSubmit}
              type='submit'
            >
              {t('modify-user')}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Formik>
  )
}

export default ModifyUser
