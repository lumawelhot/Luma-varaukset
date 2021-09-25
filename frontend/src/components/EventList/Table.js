import { format } from 'date-fns'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { classes } from '../../helpers/classes'
import { useSortableData } from '../VisitListSortable'

const Table = ({ tableEvents, checkedEvents, handleCheckEvent }) => {
  const { t } = useTranslation('event')
  const { items, requestSort, sortConfig } = useSortableData(tableEvents, { key: 'start', direction: 'ascending' })

  const resourceColors = classes.map(c => c.color)

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return
    }
    return sortConfig.key === name ? sortConfig.direction : undefined
  }

  return (
    <table className="table visits" style={{ marginTop: 10 }}>
      <thead>
        <tr>
          <th></th>
          <th>
            <p onClick={() => requestSort('title')} className={getClassNamesFor('title')}>
              {t('event')}
            </p>
          </th>
          <th>
            {t('resource')}
          </th>
          <th>
            <p onClick={() => requestSort('start')} className={getClassNamesFor('start')}>
              {t('date')}
            </p>
          </th>
          <th>{t('time')}</th>
          <th>{t('group')}</th>
          <th>{t('has-visits')}</th>
          <th>{t('publish-date')}</th>
        </tr>
      </thead>
      <tbody>
        {items.map(event => {
          const resourceNames = event.resourceids.map(id => { return { name: classes[id-1]?.label || null, color: resourceColors[id - 1] }})
          return (
            <tr key={event.id}>
              <td>
                <input
                  type="checkbox" checked={checkedEvents.includes(event.id) ? 'checked' : ''}
                  onChange={(e) => handleCheckEvent(e, event.id)} />
              </td>
              <td>{event.title}</td>
              <td>
                {!!resourceNames.length && <div className="tags">
                  {resourceNames.map(r =>
                    <span key={r.name} className='tag is-small is-link' style={{ backgroundColor: r.color }}>{r.name}</span>)}
                </div>}
              </td>
              <td>{`${format(new Date(event.start), 'dd.MM.yyyy')}`}</td>
              <td>{`${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')}`}</td>
              <td>{event.group ? event.group.name : ''}</td>
              <td>{event.visits.length}</td>
              <td>{event.publishDate ? `${format(new Date(event.publishDate), 'dd.MM.yyyy')}, ${format(new Date(event.publishDate), 'HH:mm')}` : ''}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default Table