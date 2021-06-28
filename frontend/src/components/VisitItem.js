import React from 'react'
import { format, parseISO }  from 'date-fns'

const VisitItem = ({ item, close }) => {
  return (
    <div className="modal-card">
      <header className="modal-card-head">
        <p className="modal-card-title">{item.event.title}</p>
        <button className="delete" aria-label="close" onClick={close}></button>
      </header>
      <section className="modal-card-body">
        <p>Varaus alkaa: {`${format(parseISO(item.startTime), 'd.M.yyyy HH:mm')}`}</p>
        <p>Varaus päättyy: {`${format(parseISO(item.endTime), 'd.M.yyyy HH:mm')}`}</p>
        <p>Luokka-aste: {item.grade}</p>
        <p>Lisäpalvelut: {item.extras.map(extra => extra.name).join(', ')}</p>
        <p>Varaajan nimi: {item.clientName}</p>
        <p>Varaajan sähköposti: {item.clientEmail}</p>
        <p>Varaajan puhelinnumero: {item.clientPhone}</p>
        <p>Koulu: {item.schoolName}, {item.schoolLocation}</p>
      </section>
      <footer className="modal-card-foot">
        <button className="button"  onClick={close}>Sulje</button>
      </footer>
    </div>
  )
}

export default VisitItem