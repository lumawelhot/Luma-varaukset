import { useClipboard } from '@chakra-ui/react'
import React from 'react'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'

const Clipboard = ({ text, content, style }) => {
  const { hasCopied, onCopy } = useClipboard(content)

  return <div style={{ ...style }}>
    <span style={{ marginRight: 5 }}>{text}</span>
    {hasCopied
      ? <CheckIcon style={{ color: '#31bd48' }} w={4} h={4} />
      : <CopyIcon onClick={onCopy} style={{ cursor: 'pointer', color: '#1890ff' }} w={4} h={4} />}
  </div>
}

export default Clipboard