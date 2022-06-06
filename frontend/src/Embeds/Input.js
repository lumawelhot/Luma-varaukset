import React, { useState } from 'react'
import Title from './Title'
import styled, { css } from 'styled-components'
import { default as ReactSelect } from 'react-select'

const base = css`
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'tnum', "tnum";
  box-sizing: border-box;
  margin: 0;
  font-family: inherit;
  overflow: visible;
  -webkit-appearance: none;
  align-items: center;
  border: 1px solid transparent;
  display: inline-flex;
  font-size: 1rem;
  height: 2.5em;
  justify-content: flex-start;
  line-height: 1.5;
  padding-bottom: calc(.5em - 1px);
  padding-left: calc(.75em - 1px);
  padding-right: calc(.75em - 1px);
  padding-top: calc(.5em - 1px);
  position: relative;
  vertical-align: top;
  background-color: #fff;
  border-color: #dbdbdb;
  border-radius: 4px;
  color: #363636;
  box-shadow: inset 0 .0625em .125em rgba(10,10,10,.05);
  max-width: 100%;
  width: 100%;
  touch-action: manipulation;
  &:focus {
    outline: 2px solid lightblue !important;
  }
`

const InputBase = styled.input`${() => base}`
const TextAreaBase = styled.textarea`${() => base}
  min-height: 100px;
`

export const Input = (rest) => (
  <>
    <Title>{rest.title}</Title>
    <InputBase { ...rest } />
  </>
)

export const TextArea = (rest) => (
  <>
    <Title>{rest.title}</Title>
    <TextAreaBase { ...rest } />
  </>
)

export const Select = (rest) => {
  const [additional, setAdditional] = useState(0)
  const max = rest.max ? rest.max : 1000000000

  return <>
    <Title>{rest.title}</Title>
    <ReactSelect
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