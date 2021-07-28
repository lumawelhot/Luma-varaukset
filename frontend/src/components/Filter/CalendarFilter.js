import React, { useState } from 'react'
import Filterform from './Filterform'
import FilterByVisitType from './FilterByVisitType'
import FilterByGrades from './FilterByGrades'

const CalendarFilter = (props) => {
  const [resources, setResources] = useState([1,2,3,4,5])
  const [remote, setRemote] = useState(true)
  const [inPerson, setInPerson] = useState(true)
  const [grades, setGrades] = useState([1,2,3,4,5])

  const handleChange = (newValues) => {
    setResources(newValues)
    if (!newValues.length) {
      props.setFilterFunction(() => () => { return false })
    } else {
      props.setFilterFunction(() => (event) => {
        return event.resourceids.some(r => newValues.includes(r))
        &&
        ((inPerson!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
        &&
        (grades.length ? event.grades.some(grade => grades.includes(grade)) : false)
      })
    }
  }

  const handleChangeRemote = (newValue) => {
    setRemote(newValue)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? event.resourceids.some(r => resources.includes(r)) : false)
        &&
        ((inPerson!==false && event.inPersonVisit) || (newValue!==false && event.remoteVisit))
        &&
        (grades.length ? event.grades.some(grade => grades.includes(grade)) : false)
    })
  }

  const handleChangeInPerson = (newValue) => {
    setInPerson(newValue)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? event.resourceids.some(r => resources.includes(r)) : false)
      &&
      ((newValue!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
      &&
      (grades.length ? event.grades.some(grade => grades.includes(grade)) : false)
    })
  }

  const handleChangeGrades = (newValues) => {
    setGrades(newValues)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? event.resourceids.some(r => resources.includes(r)) : false)
      &&
      ((inPerson!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
      &&
      (newValues.length ? event.grades.some(grade => newValues.includes(grade)) : false)
    })
  }

  return (
    <>
      <Filterform values={resources} setValues={handleChange} />
      <FilterByVisitType remote={remote} setRemote={handleChangeRemote} inPerson={inPerson} setInPerson={handleChangeInPerson} />
      <FilterByGrades grades={grades} setGrades={handleChangeGrades} />
    </>
  )
}

export default CalendarFilter