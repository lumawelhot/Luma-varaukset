import { RadioGroup, Button as ChakraButton } from '@chakra-ui/react'
import { Formik } from 'formik'
import React, { useContext, useState } from 'react'
import { Modal, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button, Radio } from '../../Embeds/Button'
import { Input } from '../../Embeds/Input'
import Title, { Error, required } from '../../Embeds/Title'
import { ModifyUserValidation } from '../../helpers/validate'
import { UserContext } from '../../services/contexts'

const ModifyUser = ({ show, close, initialValues }) => {
  const { t } = useTranslation()
  const { current: user, modify } = useContext(UserContext)
  const [modifyPassword, setModifyPassword] = useState(false)

  const submit = async (values, formik) => {
    const { username, password, isAdmin } = values
    if (await modify({ user: values.id, username, password, isAdmin: isAdmin === 'true' })) close()
    else formik.resetForm()
  }

  return (
    <Formik
      validationSchema={ModifyUserValidation}
      initialValues={initialValues}
      onSubmit={submit}
    >
      {({ handleChange, setFieldValue, handleSubmit, handleBlur, values, errors, touched }) => (
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
              title={required(t('username'))}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
            />
            {errors.username && touched.username && <Error>{t(errors.username)}</Error>}
            {user.id !== values.id && <>
              <Title>{t('user-role')}</Title>
              <RadioGroup onChange={v => setFieldValue('isAdmin', v)} value={values.isAdmin}>
                <Stack direction='col'>
                  <Radio value='true'>{t('admin')}</Radio>
                  <Radio value='false'>{t('employee')}</Radio>
                </Stack>
              </RadioGroup>
            </>}
            {!modifyPassword && <ChakraButton
              style={{ marginTop: 15 }}
              onClick={() => setModifyPassword(true)}
            >{t('change-password')}</ChakraButton>}
            {modifyPassword && <Input
              id='password'
              type='password'
              title={t('password')}
              onChange={handleChange}
              value={values.password}
            />}
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
