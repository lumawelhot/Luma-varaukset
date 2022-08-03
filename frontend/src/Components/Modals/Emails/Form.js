/* eslint-disable react/display-name */
import { Formik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, TextArea } from '../../Embeds/Input'
import _ from 'lodash'
import Title from '../../Embeds/Title'
import { ListItem, UnorderedList, Button } from '@chakra-ui/react'
import { Stack } from 'react-bootstrap'
import { DeleteIcon } from '@chakra-ui/icons'
import { IconButton } from '../../Embeds/Button'

const Form = React.forwardRef((props, ref) => {
  const [address, setAdress] = useState('')
  const { t } = useTranslation()
  return (
    <Formik
      innerRef={ref}
      initialValues={{
        ...props.initialValues,
        senderText: props.initialValues.adText
      }}
    >
      {({ setFieldValue, values }) => (
        <div style={{ overflowX: 'hidden', padding: 3 }}>
          <Input
            id='subject'
            title={t('subject')}
            onChange={_.debounce(e => {
              setFieldValue('subject', e.target.value)
            }, 300, [setFieldValue])}
            defaultValue={values?.subject}
          />
          <TextArea
            id='text'
            title={t('text-content')}
            onChange={_.debounce(e => {
              setFieldValue('text', e.target.value)
            }, 300, [setFieldValue])}
            defaultValue={values?.text}
          />
          <TextArea
            id='text'
            title={t('html-content')}
            onChange={_.debounce(e => {
              setFieldValue('html', e.target.value)
            }, 300, [setFieldValue])}
            defaultValue={values?.html}
          />
          <Title>{t('sender-emails')}</Title>
          <UnorderedList>
            {values?.ad?.map((e, i) => <ListItem
              style={{ marginLeft: 10, fontSize: 15 }} key={i}
            >{e}
              <IconButton size='sm' style={{ marginLeft: 5, backgroundColor: 'white' }} onClick={() => {
                setFieldValue('ad', values.ad.filter(a => a !== e))
              }} icon={<DeleteIcon color='red.500' />} />
            </ListItem>)}
          </UnorderedList>
          <Stack direction='horizontal'>
            <div style={{ width: '100%', marginRight: 15 }}>
              <Input
                onChange={e => setAdress(e.target.value)}
                value={address}
              />
            </div>
            <div>
              <Button height={10} style={{ marginTop: 5 }} colorScheme='blue' variant='outline' onClick={() => {
                setFieldValue('ad', values.ad.concat(address))
                setAdress('')
              }}>{t('add-email-address')}</Button>
            </div>
          </Stack>

          <Input
            id='adSubject'
            title={t('notify-subject')}
            onChange={_.debounce(e => {
              setFieldValue('adSubject', e.target.value)
            }, 300, [setFieldValue])}
            defaultValue={values?.adSubject}
          />
          <TextArea
            id='senderText'
            title={t('notify-text-content')}
            onChange={_.debounce(e => {
              setFieldValue('senderText', e.target.value)
            }, 300, [setFieldValue])}
            defaultValue={values?.adText}
          />
        </div>
      )}
    </Formik>
  )
})

export default Form