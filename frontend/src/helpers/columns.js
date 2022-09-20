import React from 'react'
import { t } from '../i18n'
import parse from 'date-fns/parse'
import { CLASSES } from '../config'

const dateSort = (rowA, rowB, id) => {
  const _a = rowA.values[id]
  const _b = rowB.values[id]
  if (!_b) return -1
  const a = parse(_a, `d.M.y${_a.includes(' - ') ? ' - HH:mm' : ''}`, new Date())
  const b = parse(_b, `d.M.y${_b.includes(' - ') ? ' - HH:mm' : ''}`, new Date())
  if (b - a > 0) return 1
  if (a - b > 0) return -1
  return 0
}

export const groupColumns = () => [
  {
    Header: t('name'),
    accessor: 'name'
  },
  {
    Header: t('max-visits'),
    accessor: 'maxCount'
  },
  {
    Header: t('visit-count'),
    accessor: 'visitCount'
  },
  {
    Header: t('event-count'),
    accessor: 'eventCount'
  },
  {
    Header: t('hidden'),
    accessor: 'hidden'
  },
  {
    Header: t(''),
    accessor: 'modifyButton'
  },
]

export const eventColumns = () => [
  {
    Header: t('events'),
    accessor: 'title'
  }, {
    Header: t('resource'),
    accessor: 'resources'
  }, {
    Header: t('date'),
    accessor: 'date',
    sortType: dateSort
  }, {
    Header: <span style={{ paddingRight: 13 }}>{t('time')}</span>,
    accessor: 'time'
  }, {
    Header: t('group'),
    accessor: 'group'
  }, {
    Header: t('visit-count'),
    accessor: 'visitCount'
  }, {
    Header: <span style={{ paddingRight: 10 }}>{t('publish-date')}</span>,
    accessor: 'publishDate'
  }
]

export const visitColumns = () => [
  {
    Header: t('header'),
    accessor: 'title'
  },
  {
    Header: t('resource'),
    accessor: 'resourceids'
  },
  {
    Header: t('date'),
    accessor: 'date',
    sortType: dateSort
  },
  {
    Header: <span style={{ paddingRight: 70 }}>{t('created')}</span>,
    accessor: 'created',
    sortType: dateSort
  },
  {
    Header: t('status'),
    accessor: 'status'
  },
  {
    Header: '',
    accessor: 'urlCopy'
  },
]

export const userColumns = () => [
  {
    Header: t('username'),
    accessor: 'username'
  },
  {
    Header: t('privileges'),
    accessor: 'privileges'
  },
  {
    Header: '',
    accessor: 'options'
  }
]

export const extraColumns = () => [
  {
    Header: t('name'),
    accessor: 'name'
  },
  {
    Header: t('length-inperson'),
    accessor: 'inPersonLength'
  },
  {
    Header: t('length-remote'),
    accessor: 'remoteLength'
  },
  ...CLASSES.map(c => ({
    Header: c.short,
    accessor: c.short
  })),
  {
    Header: '',
    accessor: 'modifyButton'
  }
]

export const formColumns = () => [
  {
    Header: t('form-name'),
    accessor: 'name'
  },
  {
    Header: '',
    accessor: 'modifyButton'
  }
]

export const formFieldColumns = () => [
  {
    Header: t('form-field-name'),
    accessor: 'name'
  },
  {
    Header: t('required-field'),
    accessor: 'required'
  },
  {
    Header: t('field-type'),
    accessor: 'type'
  },
  {
    Header: t('options'),
    accessor: 'optionButtons'
  }
]

export const eventDateColumns = () => [
  {
    Header: t('event-date'),
    // eslint-disable-next-line react/prop-types
    Cell: ({ cell }) => <div style={{ fontWeight: 'bold', marginTop: 7 }}>{cell.value}</div>,
    accessor: 'date',
    sortType: dateSort,
  },
  {
    Header: t('options'),
    accessor: 'optionButtons'
  }
]

export const emailColumns = () => [
  {
    Header: t('type'),
    accessor: 'name'
  },
  {
    Header: t('subject'),
    accessor: 'subject'
  },
  {
    Header: '',
    accessor: 'options'
  }
]

export const eventInitialState = {
  sortBy: [
    {
      id: 'date',
      desc: false
    }
  ]
}

export const visitInitialState = {
  sortBy: [
    {
      id: 'created',
      desc: false
    }
  ]
}
