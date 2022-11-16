import React, { useEffect, useState } from 'react'
import { usePagination, useSortBy, useTable } from 'react-table'
import { Table as List, Thead, Tbody, Tr, Th, Td, Container, Checkbox } from '../Embeds/Table'
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { multipleExist, someExist } from '../../helpers/utils'
import Pagination from './Pagination'
import PropTypes from 'prop-types'

const Table = ({ columns, data, initialState, component, checkboxed, nosort, onClickRow }) => {
  const [checked, setChecked] = useState([])
  const [nochecked, setNochecked] = useState([])

  useEffect(() => setNochecked(data
    .map((c, i) => ({ value: c, i }))
    .filter(c => c.value.nocheck)
    .map(c => String(c.i))
  ), [data])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    { columns, data, initialState },
    useSortBy,
    usePagination
  )

  const pageColIds = page?.filter(p => !nochecked.includes(p.id)).map(p => p.id)

  return (
    <>
      <Container style={{ overflowY: 'hidden' }}>
        <List { ...getTableProps() }>
          <Thead>
            {headerGroups.map((group, i) => (
              <Tr th key={i} { ...group.getHeaderGroupProps() }>
                {checkboxed && pageColIds?.length > 0 ? <Th>
                  <Checkbox
                    isChecked={multipleExist(checked, pageColIds)}
                    isIndeterminate={
                      someExist(checked, pageColIds) && !multipleExist(checked, pageColIds)
                    }
                    onChange={({ target }) => {
                      target.checked
                        ? setChecked(checked.concat(pageColIds))
                        : setChecked(checked.filter(c => !pageColIds.includes(c)))
                      multipleExist(checked, pageColIds)
                    }}
                  />
                </Th> : (checkboxed ? <Th></Th> : <></>)}
                {group.headers.map((col, j) => (
                  <Th
                    last={group.headers.length === j + 1 ? 'true' : 'false'}
                    key={j}
                    {...col.getHeaderProps(nosort ? undefined : col.getSortByToggleProps())}
                  >
                    {col.render('Header')}
                    <label style={{ marginLeft: 5 }}>
                      {col.isSorted
                        ? col.isSortedDesc
                          ? <AiFillCaretDown />
                          : <AiFillCaretUp />
                        : ''}
                    </label>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps() }>
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <Tr
                  key={i}
                  { ...row.getRowProps()}
                >
                  {checkboxed && <Td>
                    {!row.original.nocheck ? <Checkbox
                      isChecked={checked.includes(row.id)}
                      onChange={(e) => {
                        const isCheked = e.target.checked
                        isCheked ? setChecked(checked.concat(row.id))
                          : setChecked(checked.filter(c => c !== row.id))
                      }}
                    /> : <></>}
                  </Td>}
                  {row.cells.map((cell, j) => {
                    const rowClick = cell.column.rowClick !== false && !!onClickRow
                    return <Td
                      key={j}
                      last={row.cells.length === j + 1 ? 'true' : 'false'}
                      {...cell.getCellProps({
                        className: cell.column.collapse ? 'collapse' : ''
                      })}
                      onClick={() => rowClick && onClickRow(row?.original?.id || row.id)}
                      style={{ cursor: rowClick ? 'pointer' : 'initial' }}
                    >
                      {cell.render('Cell')}
                    </Td>
                  })}
                </Tr>
              )
            })}
          </Tbody>
        </List>
        <Pagination
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          pageOptions={pageOptions}
          pageCount={pageCount}
          gotoPage={gotoPage}
          nextPage={nextPage}
          previousPage={previousPage}
          setPageSize={setPageSize}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      </Container>
      <Container style={{ marginTop: 10, marginBottom: 20 }}>
        {/* Define here variables and functions you want table component to return for use */}
        {component && component({
          checked,
          reset: () => setChecked([])
        })}
      </Container>
    </>
  )
}

export default Table

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  initialState: PropTypes.object,
  component: PropTypes.func,
  checkboxed: PropTypes.bool,
  nosort: PropTypes.bool,
  onClickRow: PropTypes.func
}
