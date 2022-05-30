import React from 'react'
import { Input } from '../../Embeds/Input'
import { Button } from '../../Embeds/Button'
import { Formik } from 'formik'
import { Modal, ModalHeader } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { groupValidate } from '../../helpers/validate'

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
      validate={groupValidate}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleSubmit, values }) => (
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
              title={t('group-name')}
              onChange={handleChange}
              value={values.name}
            />
            <Input
              id='maxCount'
              title={t('group-maxcount')}
              onChange={handleChange}
              value={values.maxCount}
              type='number'
            />
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