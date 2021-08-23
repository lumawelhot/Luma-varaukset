import { format } from 'date-fns'
import React from 'react'
import { useTranslation } from 'react-i18next'

const InfoBox = ({ event, eventGrades, eventClass }) => {
  const { t } = useTranslation('event')
  return (
    <>
      <div className="title">{t('book-visit')}</div>
      <div className="box">
        <p className="subtitle"><strong> {t('visit-info')}</strong></p>
        <p><strong>{t('name')}:</strong> {event.titleText}</p>
        <p><strong>{t('description')}:</strong> {event.desc || t('no-description')}</p>
        <p><strong>{t('science-class')}:</strong> {eventClass}</p>
        <div><strong>{t('available-to-grades')}:</strong> {eventGrades}
        </div>
        <div><strong>{t('event-on-offer')}: </strong>
          {event.inPersonVisit ? t('in-inperson') : <></>}
          {event.inPersonVisit && event.remoteVisit && t('and-remote')}
          {event.remoteVisit && !event.inPersonVisit? t('in-remote') : <></>}
        </div>
        <p><strong>{t('event-length')}:</strong> {event.duration} {t('minutes')}</p>
        <p><strong>{t('earliest-start')}:</strong> {format(event.start, 'd.M.yyyy, HH:mm')}</p>
        <p><strong>{t('latest-end')}:</strong> {format(event.end, 'd.M.yyyy, HH:mm')}</p>
      </div>
      <br />
    </>
  )
}

export default InfoBox