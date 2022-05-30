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
    text: 'Olet perunut opintokäynnin: /visit/r',
    html: '<h1>Olet perunut opintokäynnin: /visit/r</h1>',
    subject: 'LUMA-tiedeluokan opintokäynnin peruutusvahvistus',
    adSubject: 'Peruutus',
    ad: ['tester@jest.com', 'jester@second.com'],
    adText: '/visit/r'
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
    text: 'Älä vastaa tähän viestiin, tämä on automaattinen muistutus huomisesta varauksestasi LUMA-tiedeluokkaan. Tervetuloa opintokäynnille!',
    html: '<p>Älä vastaa tähän viestiin, tämä on automaattinen muistutus huomisesta varauksestasi LUMA-tiedeluokkaan. Tervetuloa opintokäynnille!</p>',
    subject: 'Muistutus',
    adSubject: 'Muistutus',
    ad: ['tester@jest.com'],
    adText: 'text'
  })
  const welcome = new Email({
    name: 'welcome',
    text: `Kiitos varauksestasi! Älä vastaa tähän viestiin, tämä on automaattinen viesti varauksestasi LUMA-tiedeluokkaan.
    Opintokäynnin ohjaaja on sinuun yhteydessä viimeistään 1–2 viikkoa ennen varaamaasi opintokäyntiä. Voit olla meihin yhteydessä halutessasi jo ennen sitä sähköpostitse osoitteeseen tiedekasvatus@helsinki.fi.
    Linkki varaukseen: /link/r`,
    html: '<h1>html/link/r</h1>',
    subject: 'LUMA-tiedeluokan opintokäyntivahvistus',
    adSubject: 'Uusi varaus',
    ad: ['tester@jest.com', 'jester@second.com'],
    adText: '/visit/r'
  })
  await thanks.save()
  await reminder.save()
  await welcome.save()
  await cancellation.save()
}

const checkTimeslot = (argsStart, argsEnd) => {
  const [startHours, ] = new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(new Date(argsStart)).split('.')
  const [endHours, endMinutes]  =  new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(new Date(argsEnd)).split('.')
  if (Number(startHours) < 8) return true
  if (Number(endHours) > 17 || (Number(endHours) === 17 && Number(endMinutes) !== 0)) return true
  return false
}

module.exports = { addNewTags, fillStringWithValues, initEmailMessages, checkTimeslot }
