/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import styled from 'styled-components'
import { BiChevronsLeft, BiChevronsRight, BiChevronLeft, BiChevronRight } from 'react-icons/bi'
import { Select } from '../Embeds/Input'
import { TABLE_PAGE_SIZE_OPTIONS } from '../../config'
import PropTypes from 'prop-types'

const Button = styled.button`
  font-size: 28px;
  margin-left: 10px;
`

const Span = styled.span`
  font-size: 15px;
  padding: 5px;
  margin-left: 30px;
  position: relative;
`

const Pagination = ({
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize,
  pageIndex,
  pageSize,
}) => {
  const [option, setOption] = useState({ value: pageSize, label: pageSize })
  const changePageSize = value => {
    setPageSize(value.label)
    setOption(value)
  }

  return (
    <>
      <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
        <BiChevronsLeft />
      </Button>
      <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
        <BiChevronLeft />
      </Button>
      <Button onClick={() => nextPage()} disabled={!canNextPage}>
        <BiChevronRight />
      </Button>
      <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
        <BiChevronsRight />
      </Button>

      <Span>
        <span style={{ position: 'absolute', width: 200, marginTop: 2, marginLeft: 130 }}>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span style={{ position: 'absolute', width: 110, marginTop: -13 }}>
          <Select
            isMulti={false}
            isClearable={false}
            value={option}
            onChange={changePageSize}
            options={TABLE_PAGE_SIZE_OPTIONS.map(o => ({ value: o, label: o }))}
            menuPlacement='top'
          />
        </span>
      </Span>
    </>
  )
}

export default Pagination

Pagination.propTypes = {
  canPreviousPage: PropTypes.bool.isRequired,
  canNextPage: PropTypes.bool.isRequired,
  pageOptions: PropTypes.array.isRequired,
  pageCount: PropTypes.number.isRequired,
  gotoPage: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
  previousPage: PropTypes.func.isRequired,
  setPageSize: PropTypes.func.isRequired,
  pageIndex: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
}
