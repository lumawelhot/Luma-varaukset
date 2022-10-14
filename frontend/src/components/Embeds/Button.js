import React from 'react'
import styled from 'styled-components'
import {
  Radio as ChakraRadio,
  Checkbox as ChakraCheckbox,
  Link as A,
  IconButton as IButton,
  RadioGroup as _RadioGroup,
  CheckboxGroup as _CheckboxGroup
} from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import Title from './Title'
import { Stack } from 'react-bootstrap'
import PropTypes from 'prop-types'

export const Button = styled.button`
  align-items: center;
  box-shadow: none;
  display: inline-flex;
  height: 2.5em;
  vertical-align: top;
  user-select: none;
  background-color: #fff;
  border-width: 1px;
  cursor: pointer;
  text-align: center;
  margin-left: 10px;
  margin-right: 10px;
  padding: 0.375rem 1rem;
  line-height: normal;
  border-color: #0479a5;
  color: #0479a5;
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 0;
  &:hover {
    background-color: rgb(27, 28, 41);
    color: white;
    border-color: rgb(27, 28, 41);
  }
`

export const MenuButton = styled(Button)`
  margin: 0;
`
export const Checkbox = styled(ChakraCheckbox)`border-color: darkgrey;`
export const Radio = styled(ChakraRadio)`border-color: darkgrey !important;`

export const RadioGroup = ({ name, control, title, render, onChange }) => {
  const _onChange = onChange
  return <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <_RadioGroup onChange={(v, ...r) => {
        _onChange && _onChange(v)
        return onChange(v, ...r)
      }} value={value}>
        {title && <Title>{title}</Title>}
        <Stack direction='col'>
          {render}
        </Stack>
      </_RadioGroup>
    )}
  />
}

export const CheckboxGroup = ({ name, control, title, render, onChange }) => {
  const _onChange = onChange
  return <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <_CheckboxGroup onChange={(v, ...r) => {
        _onChange && _onChange(v)
        return onChange(v, ...r)
      }} value={value}>
        {title && <Title>{title}</Title>}
        <Stack direction='col'>
          {render}
        </Stack>
      </_CheckboxGroup>
    )}
  />
}

export const Link = styled(A)`
  color: #1890ff !important;
  text-decoration: underline !important;
`

export const IconButton = styled(IButton)`
  margin-left: 5px;
  box-shadow: none !important;
`

RadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  title: PropTypes.node,
  render: PropTypes.node.isRequired,
  onChange: PropTypes.func
}

CheckboxGroup.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  title: PropTypes.node,
  render: PropTypes.node.isRequired,
  onChange: PropTypes.func
}
