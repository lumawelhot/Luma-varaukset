/* eslint-disable no-undef */
import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'
import moment from 'moment'

const eventDate1 = new Date()
eventDate1.setDate(new Date().getDate() + 16)
const eventDate2 = new Date()
eventDate2.setDate(new Date().getDate() + 16)
const eventDate3 = new Date()
eventDate3.setDate(new Date().getDate() + 15)
const availableEvent1 = 'Test available event 1 both remote and inPerson'
const availableEvent2 = 'Test available event 2 for invalid client name'
const availableEvent3 = 'Test available event 3 only remote'
const unavailableEventName = 'Test unavailable event'
const unavailableEventDate = new Date()
unavailableEventDate.setDate(new Date().getDate() + 5)

it('Initialize tests', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: availableEvent1,
    scienceClass: 'LINKKI',
    start: new Date(eventDate1.setHours(10,0)),
    end: new Date(eventDate1.setHours(12,0)),
    remoteVisit: true,
    inPersonVisit: true,
    desc: 'Test event description'
  })
  cy.createEvent({
    title: availableEvent2,
    scienceClass: 'LINKKI',
    start: new Date(eventDate2.setHours(13,0)),
    end: new Date(eventDate2.setHours(14,0)),
    inPersonVisit: true,
    remoteVisit: false,
    desc: 'Test event description'
  })
  cy.createEvent({
    title: availableEvent3,
    scienceClass: 'LINKKI',
    start: new Date(eventDate3.setHours(10,0)),
    end: new Date(eventDate3.setHours(12,0)),
    inPersonVisit: false,
    remoteVisit: true,
    desc: 'Test event description'
  })
  cy.createEvent({
    title: unavailableEventName,
    scienceClass: 'LINKKI',
    inPersonVisit: true,
    remoteVisit: false,
    start: new Date(unavailableEventDate.setHours(10,0)),
    end: new Date(unavailableEventDate.setHours(12,0)),
    desc: 'Unavailable event description'
  })
})

Given('I am on the front page', () => {
  cy.visit('http://localhost:3000')
})

And('there is an event 1 more than two weeks ahead', () => {

})

And('there is an event 2 more than two weeks ahead', () => {

})

And('there is an event 3 more than two weeks ahead', () => {

})

When('I click on available event 1', () => {
  cy.findEvent(availableEvent1).click()
})

When('I click on available event 3', () => {
  cy.get('.rbc-calendar').then(() => {
    if (cy.get('.rbc-calendar').contains(`${availableEvent3}`)) {
      cy.contains(`${availableEvent3}`).click()
    } else {
      cy.get('.rbc-toolbar > :nth-child(1) > :nth-child(3)').click()
      cy.contains(`${availableEvent3}`).click()
    }
  })
})

Then('available event page has the correct title', () => {
  cy.contains(`${availableEvent1}`)
})

And('available event page has the correct start date', () => {
  const formattedDate = moment(eventDate1).format('DD.MM.YYYY')
  cy.contains(`${formattedDate}`)
})

And('available event page contains booking button', () => {
  cy.contains('Varaa tapahtuma')
})

And('I click the booking button', () => {
  cy.contains('Varaa tapahtuma').click()
})

Then('booking form opens', () => {
  cy.get('#clientName')
    .should('exist')
    .and('be.visible')
})

And('there is an event less than two weeks ahead', () => {
})

When('I click on the unavailable event', () => {
  cy.contains(unavailableEventName).click()
})

Then('unavailable event page has the correct title', () => {
  cy.contains(unavailableEventName)
})

And('unavailable event page has the correct start date', () => {
  const formattedUnavailableEventDate = moment(unavailableEventDate).format('DD.MM.YYYY')
  cy.contains(`${formattedUnavailableEventDate}`)
})

And('unavailable event page contains correct info text', () => {
  cy.contains('Valitettavasti tämä tapahtuma ei ole varattavissa.')
})

And('valid information is entered and visit mode selected', () => {
  cy.get(':nth-child(2) > .visitMode').click()
  cy.get('#clientName').type('Teacher')
  cy.get('#schoolName').type('School')
  cy.get('#schoolLocation').type('Location')
  cy.get('#clientEmail').type('teacher@school.fi')
  cy.get('#verifyEmail').type('teacher@school.fi')
  cy.get('#clientPhone').type('040-1234567')
  cy.get('#visitGrade').type('1. grade')
  cy.get('#participants').type('9')
  cy.get('.privacyPolicy > input').click()
  cy.get('.remoteVisitGuidelines > input').click()
  cy.get('#create').click()
  cy.wait(2000)
  cy.visit('http://localhost:3000')
})

And('valid information is entered and visit mode predetermined', () => {
  cy.get('#clientName').type('Teacher')
  cy.get('#schoolName').type('School')
  cy.get('#schoolLocation').type('Location')
  cy.get('#clientEmail').type('teacher@school.fi')
  cy.get('#verifyEmail').type('teacher@school.fi')
  cy.get('#clientPhone').type('040-1234567')
  cy.get('#visitGrade').type('1. grade')
  cy.get('#participants').type('9')
  cy.get('.privacyPolicy > input').click()
  cy.get('.remoteVisitGuidelines > input').click()
  cy.get('#create').click()
  cy.wait(2000)
  cy.visit('http://localhost:3000')
})

Then('booked event turns grey in calendar view', () => {
  cy.findEvent(availableEvent1).should('have.class', 'booked')
})

When('I click on available event 2', () => {
  cy.findEvent(availableEvent2).click()
})

When('invalid client name is entered', () => {
  cy.get('#visitGrade').select('1')
  cy.get('#clientName').type('Tea')
  cy.wait(100)
  cy.get('#clientEmail').type('teacher@school.fi')
  cy.wait(100)
  cy.get('#clientPhone').type('040-1234567')
  cy.wait(100)
  cy.get('#create').click()
  cy.wait(2000)
})

Then('an error message is shown', () => {
  cy.contains('Liian lyhyt!')
})

Given('admin logs in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

Then('unavailable event page contains booking button', () => {
  cy.contains('Varaa tapahtuma')
})

Then('unavailable event turns grey in calendar view', () => {
  cy.findEvent(unavailableEventName).parent().should('have.class', 'booked')
})