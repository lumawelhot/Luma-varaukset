import styled from 'styled-components'
import React from 'react'
import { Checkbox as _CheckBox } from '@chakra-ui/react'

export const Container = styled.div`
  max-width: 100%;
  overflow-y: auto;
`

export const Table = styled.table`
  margin: 10px;
  border-collapse: collapse;
`

export const Thead = styled.thead``

export const Tbody = styled.tbody``

export const Tr = styled.tr`
  border-bottom: ${({ th }) => th ? '2px' : '1px'} solid #000;
  border-color: lightgray;
  vertical-align: top;
`

export const ThContainer = styled.div`
  padding: 7px;
  padding-right: ${({ last }) => last === 'true' ? '7px' : '35px'};
`

export const TdContainer = styled.div`
  padding: 7px;
  padding-right: ${({ last }) => last === 'true' ? '7px' : '35px'};
`

export const Th = (rest) => (
  <th { ...rest}>
    <ThContainer last={rest.last}>
      {rest.children}
    </ThContainer>
  </th>
)

export const Td = (rest) => (
  <td { ...rest}>
    <TdContainer last={rest.last}>
      {rest.children}
    </TdContainer>
  </td>
)

export const Pagination = styled.div``

export const Checkbox = styled(_CheckBox)`
  border-color: rgb(150, 150, 150);
  margin-top: 4px;
  margin-right: -20px;
`
