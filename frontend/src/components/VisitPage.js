import React, { useState, useEffect } from 'react'
import { FIND_VISIT } from '../graphql/queries'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router'
import moment from 'moment'

/* const grades = [
  { value: 1, label:'Varhaiskasvatus' },
  { value: 2, label: '1.-2. luokka' },
  { value: 3, label: '3.-6. luokka' },
  { value: 4, label:'7.-9 luokka' },
  { value: 5, label:  'toinen aste' }
] */

/* const filterEventGrades = (eventGrades) => {
  const returnArray = []
  eventGrades.forEach(availableGrade => {
    grades.forEach(grade => {
      if (availableGrade === grade.value) {
        returnArray.push({ value: grade.value, label: grade.label })
      }
    })
  })
  return returnArray
} */

/* const filterEventClass = (eventClass) => {
  switch (eventClass) {
    case 1:
      return 'SUMMAMUTIKKA'
    case 2:
      return 'FOTONI'
    case 3:
      return 'LINKKI'
    case 4:
      return 'GEOPISTE'
    case 5:
      return 'GADOLIN'
    default:
      console.log('Error!')
      break
  }
} */

const VisitPage = () => {
  const id = useParams().id
  const [visit, setVisit] = useState(null)

  const result = useQuery(FIND_VISIT, {
    onError: (error) => console.log('virheviesti: ', error, result),
    variables: { id: id }
  })

  useEffect(() => {
    if (result.data) {
      console.log(result.data)
      setVisit(result.data.findVisit)
    }
  }, [result.data])

  if (result.loading || visit === null) {
    return (
      <div>
        <p>Varausta haetaan...</p>
      </div>
    )
  }
  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <div className="title">{visit.event.title}</div>
          <div>
            <p>Kuvaus: [Tähän tapahtuman kuvaus]</p>
            <p>Tiedeluokka: </p>
            <p>Valittavissa olevat lisäpalvelut: [Tähän ekstrat]</p>
            <div>Tarjolla seuraaville luokka-asteille:
            </div>
            <p>Tapahtuma alkaa: {moment(visit.event.start).format('DD.MM.YYYY, HH:mm')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisitPage