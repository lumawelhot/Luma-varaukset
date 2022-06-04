import React, { useContext } from 'react'
import { Formik } from 'formik'
import { Modal, Stack } from 'react-bootstrap'
import { Input } from '../../Embeds/Input'
import { useTranslation } from 'react-i18next'
import { Button } from '../../Embeds/Button'
import { UserContext } from '../../services/contexts'
import { Radio, RadioGroup } from '@chakra-ui/react'
import Title, { Error } from '../../Embeds/Title'
import { CreateUserValidation } from '../../helpers/validate'
import { userInit } from '../../helpers/initialvalues'
import { required } from '../../Embeds/Title'
import { error, success } from '../../helpers/toasts'

const CreateUser = ({ show, close }) => {
  const { t } = useTranslation()
  const { add } = useContext(UserContext)

  const submit = async (values, formik) => {
    const { username, password, isAdmin } = values
    if (await add({ username, password, isAdmin: isAdmin === 'true' })) {
      success(t('notify-user-create-success'))
      close()
    } else error(t('notify-user-create-failed'))
    formik.resetForm()
  }

  return (
    <Formik
      validationSchema={CreateUserValidation}
      initialValues={userInit}
      onSubmit={submit}
    >
      {({ handleChange, handleSubmit, handleBlur, values, setFieldValue, errors, touched }) => (
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
              title={required(t('username'))}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
            />
            {errors.username && touched.username && <Error>{t(errors.username)}</Error>}
            <Input
              id='password'
              title={required(t('password'))}
              type='password'
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
            />
            {errors.password && touched.password && <Error>{t(errors.password)}</Error>}
            <Input
              id='confirm'
              title={required(t('confirm'))}
              type='password'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.confirm}
            />
            {errors.confirm && touched.confirm && <Error>{t(errors.confirm)}</Error>}
            <Title>{required(t('user-role'))}</Title>
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
