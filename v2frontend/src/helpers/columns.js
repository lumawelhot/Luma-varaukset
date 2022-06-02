import i18n from '../i18n'
import React from 'react'
import parse from 'date-fns/parse'
import { CLASSES } from '../config'
const t = i18n.t

const dateSort = (rowA, rowB, id) => {
  let a = parse(rowA.values[id], 'd.M.y', new Date())
  let b = parse(rowB.values[id], 'd.M.y', new Date())
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
    Header: <span style={{ paddingRight: 12 }}>{t('time')}</span>,
    accessor: 'time'
  }, {
    Header: t('group'),
    accessor: 'group'
  }, {
    Header: t('visit-count'),
    accessor: 'visitCount'
  }, {
    Header: t('publish-date'),
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
    accessor: 'inPerson'
  },
  {
    Header: t('length-remote'),
    accessor: 'remote'
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
    Cell: ({ cell }) => {
      return <div style={{ fontWeight: 'bold', marginTop: 7 }}>{cell.value}</div>
    },
    accessor: 'date',
    sortType: dateSort,
  },
  {
    Header: t('options'),
    accessor: 'optionButtons'
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
      id: 'date',
      desc: false
    }
  ]
}