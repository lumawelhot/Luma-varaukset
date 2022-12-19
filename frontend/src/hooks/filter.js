import { useMemo, useState } from 'react'
import { TIME_VALUE_LARGE } from '../config'
import { someExist } from '../helpers/utils'
import { useEvents } from './cache'

export const useEventFilter = ({ all, parsed }) => {
  const [filterOptions, setFilterOptions] = useState({
    tags: [],
    grades: [],
    classes: [],
    visitTypes: ['inperson', 'remote', 'school'],
    showUnavailable: false
  })
  const filtered = useMemo(() => {
    if (!all) return parsed
    return parsed
      ?.filter(p => {
        const { classes } = filterOptions
        if (classes.length <= 0) return true
        return someExist(all[p.id]?.resourceids, classes.map(c => c.value))
      })
      ?.filter(p => {
        const { grades } = filterOptions
        if (grades.length <= 0) return true
        return someExist(all[p.id]?.grades, grades.map(c => c.value))
      })
      ?.filter(p => {
        const { tags } = filterOptions
        if (tags.length <= 0) return true
        return someExist(all[p.id].tags.map(t => t.name), filterOptions.tags.map(t => t.value))
      })
      ?.filter(p => {
        const inPerson = filterOptions.visitTypes?.includes('inperson') ? true : false
        const remote = filterOptions.visitTypes?.includes('remote') ? true : false
        const school = filterOptions.visitTypes?.includes('school') ? true : false
        return all[p.id]?.inPersonVisit === inPerson
          || all[p.id]?.remoteVisit === remote
          || all[p.id]?.schoolVisit === school
      })
  }, [all, parsed, filterOptions])

  return [filtered, filterOptions, setFilterOptions]
}

export const useEventListFilter = ({ all }) => {
  const [filterOptions, setFilterOptions] = useState({
    classes: [],
    range: { start: undefined, end: new Date() }
  })
  const { findEvent } = useEvents()

  const filtered = useMemo(() => all
    ?.filter(p => {
      const { classes } = filterOptions
      if (classes.length <= 0) return true
      return someExist(findEvent(p.id)?.resourceids, classes.map(c => c.value))
    })
    ?.filter(p => {
      const { start } = filterOptions.range
      const { end } = filterOptions.range
      return (new Date(p.start) < (end ? end : new Date(TIME_VALUE_LARGE))) &&
      ((start ? start : new Date(0)) < new Date(p.start))
    })
  , [all, filterOptions])

  return [filtered, filterOptions, setFilterOptions]
}
