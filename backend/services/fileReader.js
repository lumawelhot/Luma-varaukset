const { readFileSync } = require('fs')

const readMessage = async (fileName, replace) => {
  try {
    const data = readFileSync(`../config/message/${fileName}`, 'utf8')
    let message = data
    replace.forEach(element => message = message.replace(`/${element.name}/r`, element.value))
    return message
  } catch (err) {
    throw new Error('File not found')
  }
}

exports.readMessage = readMessage