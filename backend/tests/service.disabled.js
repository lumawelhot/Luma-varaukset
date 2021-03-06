const mailer = require('../services/mailer')
const reader = require('../services/fileReader')

describe('Mailer', () => {

  it('success', () => {
    let error
    const details = {
      from: 'Luma-Varaukset <noreply@helsinki.fi>',
      to: 'tester@email',
      subject: 'Tervetuloa!',
      text: 'test',
      html: '<h1>test</h1>'
    }
    try {
      mailer.sendMail(details)
    } catch (err) {
      error = err
    }
    expect(error).toBe(undefined)
  })

})

describe('File reader', () => {

  let mailDetails = [{
    name: 'link',
    value: 'URL'
  }]

  it('reads the existing file correctly', async () => {
    let error
    let data
    try {
      data = await reader.readMessage('test.txt', mailDetails)
    } catch (err) {
      error = err
    }
    expect(data).toContain('URL')
    expect(data).toContain('LumaWelhot')
    expect(error).toBe(undefined)
  })

  it('cannot read the file which do not exist', async () => {
    let error = undefined
    let data = undefined
    try {
      data = await reader.readMessage('error.html', mailDetails)
    } catch (err) {
      error = err
    }
    expect(data).toBe(undefined)
    expect(error.message).toBe('File not found')
  })

})