import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Title from '../../Embeds/Title'
import { ListItem, UnorderedList, Button } from '@chakra-ui/react'
import { Stack } from 'react-bootstrap'
import { DeleteIcon } from '@chakra-ui/icons'
import { IconButton } from '../../Embeds/Button'
import { useForm } from 'react-hook-form'
import { Input, TextArea } from '../../Embeds/Input'

const Form = ({ initialValues, formId, onSubmit }) => {
  const [address, setAdress] = useState('')
  const { t } = useTranslation()
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: initialValues
  })

  return <form
    id={formId}
    onSubmit={handleSubmit(onSubmit)}
    style={{ overflowX: 'hidden', padding: 3 }}
  >
    <Input id='subject' title={t('subject')} {...register('subject')} />
    <TextArea id='text' title={t('text-content')} { ...register('text')} />
    <TextArea id='html' title={t('html-content')} { ...register('html')} />
    <Title>{t('sender-emails')}</Title>
    <UnorderedList>
      {watch('ad').map((e, i) => <ListItem
        style={{ marginLeft: 10, fontSize: 15 }} key={i}
      >{e}
        <IconButton size='sm' style={{ marginLeft: 5, backgroundColor: 'white' }} onClick={() => {
          setValue('ad', watch('ad').filter(a => a !== e))
        }} icon={<DeleteIcon color='red.500' />} />
      </ListItem>)}
    </UnorderedList>
    <Stack direction='horizontal'>
      <div style={{ width: '100%', marginRight: 15 }}>
        <Input onChange={e => setAdress(e.target.value)} value={address} />
      </div>
      <div>
        <Button height={10} style={{ marginTop: 5 }} colorScheme='blue' variant='outline' onClick={() => {
          setValue('ad', watch('ad').concat(address))
          setAdress('')
        }}>{t('add-email-address')}</Button>
      </div>
    </Stack>
    <Input id='adSubject' title={t('notify-subject')} { ...register('adSubject')} />
    <TextArea id='senderText' title={t('notify-text-content')} { ...register('senderText')} />
  </form>
}

export default Form