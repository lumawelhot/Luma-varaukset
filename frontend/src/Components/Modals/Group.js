import React from 'react'
import { Input } from '../Embeds/Input'
import { Button } from '../Embeds/Button'
import { Formik } from 'formik'
import { Modal, ModalHeader } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { GroupValidation } from '../../helpers/validate'
import { Error, required } from '../Embeds/Title'

const Group = ({ show, close, handle, title, initialValues }) => {
  const { t } = useTranslation()

  const onSubmit = async values => {
    if(await handle(values)) {
      close()
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={GroupValidation}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleSubmit, handleBlur, values, errors, touched }) => (
        <Modal
          show={show}
          backdrop="static"
          onHide={close}
          scrollable={true}
        >
          <ModalHeader style={{ backgroundColor: '#f5f5f5' }} closeButton>
            <Modal.Title>{title}</Modal.Title>
          </ModalHeader>
          <Modal.Body>
            <Input
              id='name'
              title={required(t('group-name'))}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.name}
            />
            {errors.name && touched.name && <Error>{t(errors.name)}</Error>}
            <Input
              id='maxCount'
              title={required(t('group-maxcount'))}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.maxCount}
              type='number'
            />
            {errors.maxCount && touched.maxCount && <Error>{t(errors.maxCount)}</Error>}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
            <Button type='submit' onClick={handleSubmit}>{title}</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Formik>
  )
}

export default Group

/*<>
      <Input
        placeholder={t('name')}
        value={nameValue}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder={t('max-count')}
        value={maxCountValue}
        onChange={(e) => setMaxCount(e.target.value)}
      />
      <Button onClick={() => {
        onSubmit({ name: nameValue, maxCount: maxCountValue })
      }}>{buttonText}</Button>
    </>*/