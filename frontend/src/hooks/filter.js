import { useMemo, useState } from 'react'
import { someExist } from '../helpers/utils'

export const useEventFilter = ({ all, parsed }) => {
  const [filterOptions, setFilterOptions] = useState({
    tags: [],
    grades: [],
    classes: [],
    visitTypes: ['inperson', 'remote'],
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
        return all[p.id]?.inPersonVisit === inPerson || all[p.id]?.remoteVisit === remote
      })
  }, [all, parsed, filterOptions])

  return [filtered, filterOptions, setFilterOptions]
}
