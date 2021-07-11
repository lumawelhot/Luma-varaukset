import { format } from 'date-fns'
import React from 'react'

const InfoBox = ({ event, eventGrades, eventClass }) => {
  return (
    <>
      <div className="title">Varaa vierailu </div>
      <div className="box">
        <p className="subtitle"><strong>Vierailun tiedot</strong></p>
        <p><strong>Nimi:</strong> {event.title}</p>
        <p><strong>Kuvaus:</strong> {event.desc || 'Ei kuvausta'}</p>
        <p><strong>Tiedeluokka:</strong> {eventClass}</p>
        <div><strong>Tarjolla seuraaville luokka-asteille:</strong> {eventGrades}
        </div>
        <div><strong>Vierailu tarjolla: </strong>
          {event.inPersonVisit ? 'Lähiopetuksena' : <></>}
          {event.inPersonVisit && event.remoteVisit && ' ja etäopetuksena'}
          {event.remoteVisit && !event.inPersonVisit? 'Etäopetuksena' : <></>}
        </div>
        <p><strong>Vierailun kesto:</strong> {event.duration} min</p>
        <p><strong>Vierailun aikaisin alkamisaika:</strong> {format(event.start, 'd.M.yyyy, HH:mm')}</p>
        <p><strong>Vierailun myöhäisin päättymisaika:</strong> {format(event.end, 'd.M.yyyy, HH:mm')}</p>
      </div>
      <br />
    </>
  )
}

export default InfoBox