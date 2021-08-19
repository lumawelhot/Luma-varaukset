const Tag = require('../models/tag')
const Email = require('../models/email')

const addNewTags = async tags => {
  const mongoTags = await Tag.find({ name: { $in: tags } })
  let result = []
  const foundTagNames = mongoTags.map(t => t.name)
  mongoTags.forEach(tag => result.push(tag))
  tags.forEach(tag => {
    if (!foundTagNames.includes(tag)) {
      const newTag = new Tag({ name: tag })
      result.push(newTag)
      newTag.save()
    }
  })
  return result
}

const fillStringWithValues = (str, replace) => {
  let newString = str
  try {
    replace.forEach(element => newString = newString.replace(`/${element.name}/r`, element.value))
    return newString
  } catch (err) {
    return str
  }
}

const initEmailMessages = async () => {
  await Email.deleteMany({})
  const cancellation = new Email({
    name: 'cancellation',
    text: 'text',
    html: '<h1>html</h1>',
    subject: 'Cancellation',
    adSubject: 'Cancellation',
    ad: ['tester@jest.com', 'jester@second.com'],
    adText: 'text'
  })
  const thanks = new Email({
    name: 'thanks',
    text: 'text',
    html: '<h1>html</h1>',
    subject: 'Thanks',
    adSubject: 'New visit',
    ad: ['tester@jest.com'],
    adText: 'text'
  })
  const reminder = new Email({
    name: 'reminder',
    text: 'text',
    html: '<h1>html</h1>',
    subject: 'Reminder',
    adSubject: 'New visit',
    ad: ['tester@jest.com'],
    adText: 'text'
  })
  const welcome = new Email({
    name: 'welcome',
    text: 'text/link/r',
    html: '<h1>html/link/r</h1>',
    subject: 'Welcome',
    adSubject: 'New visit',
    ad: ['tester@jest.com', 'jester@second.com'],
    adText: 'text'
  })
  await thanks.save()
  await reminder.save()
  await welcome.save()
  await cancellation.save()
}

const checkTimeslot = (argsStart, argsEnd) => {
  // eslint-disable-next-line no-unused-vars
  const [startHours, startMinutes] = new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(new Date(argsStart)).split('.')
  const [endHours, endMinutes]  =  new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(new Date(argsEnd)).split('.')
  if (Number(startHours) < 8) return true
  if (Number(endHours) > 17 || (Number(endHours) === 17 && Number(endMinutes) !== 0)) return true
  return false
}

module.exports = { addNewTags, fillStringWithValues, initEmailMessages, checkTimeslot }
