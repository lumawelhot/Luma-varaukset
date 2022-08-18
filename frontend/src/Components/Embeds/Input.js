/* eslint-disable react/display-name */
import React, { useState } from 'react'
import Title from './Title'
import styled, { css } from 'styled-components'
import { default as ReactSelect } from 'react-select'
import Creatable from 'react-select/creatable'

const base = css`
  overflow: visible;
  border: 1px solid transparent;
  justify-content: flex-start;
  padding-bottom: calc(.5em - 1px);
  padding-left: calc(.75em - 1px);
  padding-right: calc(.75em - 1px);
  padding-top: calc(.5em - 1px);
  position: relative;
  border-color: #dbdbdb;
  border-radius: 4px;
  max-width: 100%;
  width: 100%;
  &:focus {
    outline: 1px solid #0479a5 !important;
  }
`

const InputBase = styled.input`${() => base}`
const TextAreaBase = styled.textarea`${() => base}
  min-height: 100px;
`

export const Input = React.forwardRef((rest, ref) => <>
  <Title>{rest.title}</Title>
  <InputBase
    { ...rest }
    title={undefined}
    ref={ref}
    onWheel={e => e.currentTarget.blur()}
  />
</>)

export const TextArea = React.forwardRef((rest, ref) => <>
  <Title>{rest.title}</Title>
  <TextAreaBase { ...rest } ref={ref}/>
</>)

export const Select = (rest) => {
  const [additional, setAdditional] = useState(0)
  const max = rest.max ? rest.max : 1000000000

  const Renderer = rest.creatable ? Creatable : ReactSelect

  return <>
    <Title>{rest.title}</Title>
    <Renderer
      isMulti
      placeholder=''
      options={rest?.options?.slice(0, max + additional)}
      value={rest.value}
      className="basic-multi-select"
      classNamePrefix="select"
      onMenuOpen={rest.onClick}
      isClearable={true}
      isSearchable={true}
      menuPortalTarget={document.body}
      styles={{
        menuPortal: base => ({ ...base, zIndex: 9999 })
      }}
      { ...rest }
      onChange={e => {
        setAdditional(e?.length)
        rest.onChange && rest.onChange(e)
      }}
    />
  </>
}