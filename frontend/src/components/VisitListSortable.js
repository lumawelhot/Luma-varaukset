import React, { useState, useMemo } from 'react'
import { classes } from '../helpers/classes'
import { resourceColorsLUMA } from '../helpers/styles'
import VisitItem from './VisitItem'
import { format, parseISO }  from 'date-fns'

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config)

  const sortedItems = useMemo(() => {
    let sortableItems = [...items]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [items, sortConfig])

  const requestSort = (key) => {
    let direction = 'ascending'
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  return { items: sortedItems, requestSort, sortConfig }
}

const VisitListSortable = ({ visits, copyURL }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const { items, requestSort, sortConfig } = useSortableData(visits)

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return
    }
    return sortConfig.key === name ? sortConfig.direction : undefined
  }

  const handleSelect = (item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
    setShowModal(false)
  }

  return (
    <>
      <div className={`modal ${showModal ? 'is-active':''}`}>
        <div className="modal-background"></div>
        {showModal && <VisitItem item={selectedItem} close={() => handleCloseModal()}/>}
      </div>
      <table className="table visits">
        <thead>
          <tr>
            <th>
              <p onClick={() => requestSort('title')} className={getClassNamesFor('title')}>
            Otsikko
              </p>
            </th>
            <th>
              <p onClick={() => requestSort('resourceids')} className={getClassNamesFor('resourceids')}>
            Resurssi
              </p>
            </th>
            <th>
              <p onClick={() => requestSort('startTime')} className={getClassNamesFor('startTime')}>
                Päivämäärä
              </p>
            </th>
            <th>
              <p onClick={() => requestSort('status')} className={getClassNamesFor('status')}>
              Tila
              </p>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(visit => {
            const copiedURL = process.env.PUBLIC_URL || 'http://localhost:3000' + '/' + visit.id
            const resourceNames = visit.event.resourceids.map(id => { return { name: classes[id-1]?.label || null, color: resourceColorsLUMA[id - 1] }})
            return (
              <tr key={visit.id}>
                <td onClick={() => handleSelect(visit)} style={{ cursor: 'pointer' }}>{visit.event.title}</td>
                <td>
                  {!!resourceNames.length && <div className="tags">
                    {resourceNames.map(r =>
                      <span key={r.name} className='tag is-small is-link' style={{ backgroundColor: r.color }}>{r.name}</span>)}
                  </div>}
                </td>
                <td>{`${format(parseISO(visit.startTime), 'd.M.yyyy')}`}</td>
                <td>{visit.status ? 'VOIMASSA' : 'PERUTTU'}</td>
                <td>
                  <button className="button luma" onClick={() => copyURL(visit)}>Kopioi URL</button>
                  <input readOnly className="hidden" type="text" id={'value-' + visit.id} value={copiedURL} />
                </td>
              </tr>
            )
          }
          )}
          {(visits.length === 0) && <tr><td colSpan="8"><span className="subtitle luma">Varauksia ei löytynyt.</span></td></tr>}
        </tbody>
      </table>
    </>
  )
}

export default VisitListSortable