import React from 'react'
import { format, parseISO }  from 'date-fns'
import { useTranslation } from 'react-i18next'

const VisitItem = ({ item, close }) => {
  const { t } = useTranslation('visit')
  return (
    <div className="modal-card">
      <header className="modal-card-head">
        <p className="modal-card-title">{item.event.title}</p>
        <button className="delete" aria-label="close" onClick={close}></button>
      </header>
      <section className="modal-card-body">
        <p>{`${t('start')}: ${format(parseISO(item.startTime), 'd.M.yyyy HH:mm')}`}</p>
        <p>{`${t('end')}: ${format(parseISO(item.endTime), 'd.M.yyyy HH:mm')}`}</p>
        <p>{`${t('grade')}: ${item.grade}`}</p>
        <p>{`${t('extras')}: ${item.extras.map(extra => extra.name).join(', ')}`}</p>
        <p>{`${t('client-name')}: ${item.clientName}`}</p>
        <p>{`${t('client-email')}: ${item.clientEmail}`}</p>
        <p>{`${t('client-phone')}: ${item.clientPhone}`}</p>
        <p>{`${t('school')}: ${item.schoolName}, ${item.schoolLocation}`}</p>
      </section>
      <footer className="modal-card-foot">
        <button className="button" onClick={close}>{t('close')}</button>
      </footer>
    </div>
  )
}

export default VisitItem