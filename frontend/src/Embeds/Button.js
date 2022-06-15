import styled from 'styled-components'
import { Radio as ChakraRadio, Checkbox as ChakraCheckbox, Link as A, IconButton as IButton } from '@chakra-ui/react'

export const Button = styled.button`
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'tnum', "tnum";
  box-sizing: border-box;
  touch-action: manipulation;
  margin: 0;
  font-family: inherit;
  overflow: visible;
  -webkit-appearance: none;
  align-items: center;
  border: 1px solid transparent;
  box-shadow: none;
  display: inline-flex;
  height: 2.5em;
  position: relative;
  vertical-align: top;
  user-select: none;
  background-color: #fff;
  border-width: 1px;
  cursor: pointer;
  justify-content: center;
  text-align: center;
  margin-left: 10px;
  margin-right: 10px;
  padding: 0.375rem 1rem;
  line-height: normal;
  white-space: nowrap;
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

export const Link = styled(A)`
  color: #1890ff !important;
  text-decoration: underline !important;
`

export const IconButton = styled(IButton)`
  margin-left: 5px;
  box-shadow: none !important;
`