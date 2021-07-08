/* eslint-disable no-undef */
import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'
import { format, set, addBusinessDays } from 'date-fns'

const eventDate1 = addBusinessDays(set(new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), 14)
const eventDate2 = addBusinessDays(set(new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), 16)
const eventDate3 = addBusinessDays(set(new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), 15)
const availableEvent1 = 'EVENT1'
const availableEvent2 = 'EVENT2'
const availableEvent3 = 'EVENT3'
const unavailableEventName = 'Test unavailable event'
const unavailableEventDate = addBusinessDays(set(new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), 3)

it('Initialize tests', () => {
  cy.request('http://localhost:3001/reset')
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: availableEvent1,
    start: new Date(eventDate1.setHours(10,0)),
    end: new Date(eventDate1.setHours(12,0)),
    scienceClass: [1,3],
    remoteVisit: true,
    inPersonVisit: true,
    remotePlatforms: [1],
    desc: 'Test event description',
  })
  cy.createEvent({
    title: availableEvent2,
    start: new Date(eventDate2.setHours(13,0)),
    end: new Date(eventDate2.setHours(14,0)),
    scienceClass: [3],
    inPersonVisit: true,
    remoteVisit: false,
    desc: 'Test event description',
  })
  cy.createEvent({
    title: availableEvent3,
    scienceClass: 'LINKKI',
    start: new Date(eventDate3.setHours(10,0)),
    end: new Date(eventDate3.setHours(12,0)),
    inPersonVisit: false,
    remoteVisit: true,
    remotePlatforms: [1],
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
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(1)').click()
})

And('there is an event 1 more than two weeks ahead', () => {

})

And('there is an event 2 more than two weeks ahead', () => {

})

And('there is an event 3 more than two weeks ahead', () => {
  cy.findEvent(availableEvent3)
})

When('I click on available event 1', () => {
  cy.wait(500)
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
  const formattedDate = format(eventDate1, 'd.M.yyyy')
  cy.contains(`${formattedDate}`)
})

And('available event page contains booking button', () => {
  cy.contains('Varaa vierailu')
})

And('I click the booking button', () => {
  cy.contains('Varaa vierailu').click()
})

Then('booking form opens', () => {
  cy.get('#clientName')
    .should('exist')
    .and('be.visible')
})

And('there is an event less than two weeks ahead', () => {
  cy.wait(500)
  cy.findEvent(unavailableEventName)
})

When('I click on the unavailable event', () => {
  cy.get('.rbc-calendar').then(() => {
    if (cy.get('.rbc-calendar').contains(`${unavailableEventName}`)) {
      cy.contains(`${unavailableEventName}`).click()
    } else {
      cy.get('.rbc-toolbar > :nth-child(1) > :nth-child(3)').click()
      cy.contains(`${unavailableEventName}`).click()
    }
  })
})

Then('unavailable event page has the correct title', () => {
  cy.contains(unavailableEventName)
})

And('unavailable event page has the correct start date', () => {
  const formattedUnavailableEventDate = format(unavailableEventDate, 'd.M.yyyy')
  cy.contains(`${formattedUnavailableEventDate}`)
})

And('unavailable event page contains correct info text', () => {
  cy.contains('Valitettavasti tämä vierailu ei ole varattavissa.')
})

And('valid information is entered and visit mode selected', () => {
  cy.get(':nth-child(1) > :nth-child(2) > label').click()
  cy.get(':nth-child(2) > :nth-child(2) > label > input').click()
  cy.get('#clientName').type('Teacher')
  cy.get('#schoolName').type('School')
  cy.get('#schoolLocation').type('Location')
  cy.get('#clientEmail').type('teacher@school.fi')
  cy.get('#verifyEmail').type('teacher@school.fi')
  cy.get('#clientPhone').type('040-1234567')
  cy.get('#visitGrade').type('1. grade')
  cy.get('#participants').type('9')
  cy.get('.ant-picker-input > input').as('startTime').click()
  cy.get('.ant-picker-content').within(() => {
    cy.get('ul .ant-picker-time-panel-cell').contains('10').click()
    cy.get('ul:last-child .ant-picker-time-panel-cell').contains('00').click()
  })
  cy.get('.ant-btn').eq(0).click()
  cy.get('@startTime').should('have.value', '10:00')
  cy.get('.privacyPolicy > input').click()
  cy.get('.remoteVisitGuidelines > input').click()
  cy.get('#create').click()
  cy.wait(2000)
  cy.visit('http://localhost:3000')
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(1)').click()
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
  cy.get('.ant-picker-input > input').as('startTime').click()
  cy.get('.ant-picker-content').within(() => {
    cy.get('ul .ant-picker-time-panel-cell').contains('10').click()
    cy.get('ul:last-child .ant-picker-time-panel-cell').contains('00').click()
  })
  cy.get('.ant-btn').eq(0).click()
  cy.get('@startTime').should('have.value', '10:00')
  cy.get('.privacyPolicy > input').click()
  cy.get('.remoteVisitGuidelines > input').click()
  cy.get('#create').click()
  cy.wait(2000)
  cy.visit('http://localhost:3000')
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(1)').click()
})

Then('booked event turns grey in calendar view', () => {
  cy.wait(500)
  cy.findEvent(availableEvent1).parent().should('have.class', 'booked')
})

When('I click on available event 2', () => {
  cy.wait(500)
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
  cy.get('.level > .button').should('have.text', 'Kirjaudu ulos')
})

Then('unavailable event page contains booking button', () => {
  cy.contains('Varaa vierailu')
})

Then('unavailable event turns grey in calendar view', () => {
  cy.wait(500)
  cy.findEvent(unavailableEventName).parent().should('have.class', 'booked')
})