/* eslint-disable no-undef */
import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'
import moment from 'moment'

const eventDate1 = new Date()
eventDate1.setDate(new Date().getDate() + 20)
const eventDate2 = new Date()
eventDate2.setDate(new Date().getDate() + 21)
const availableEvent1 = 'Test event'
const availableEvent2 = 'Test event for invalid client name'
const unavailableEventName = 'Unavailable event'
const unavailableEventDate = new Date()

Given('I am on the front page', () => {
  cy.visit('http://localhost:3000')
})

And('there is an event 1 more than two weeks ahead', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: availableEvent1,
    scienceClass: 'LINKKI',
    start: eventDate1,
    end: eventDate1,
    desc: 'Test event description'
  })
  
})

And('there is an event 2 more than two weeks ahead', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: availableEvent2,
    scienceClass: 'LINKKI',
    start: eventDate2,
    end: eventDate2,
    desc: 'Test event description'
  })
})

When('I click on available event 1', () => {
  cy.get('.rbc-calendar').then(() => {
    if (cy.get('.rbc-calendar').contains(`${availableEvent1}`)) {
      cy.contains(`${availableEvent1}`).click()
    } else {
      cy.get('.rbc-toolbar > :nth-child(1) > :nth-child(3)').click()
    cy.contains(`${availableEvent1}`).click()
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
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: unavailableEventName,
    scienceClass: 'LINKKI',
    start: unavailableEventDate,
    end: unavailableEventDate,
    desc: 'Unavailable event description'
  })
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

And('valid information is entered', () => {
  cy.get('#visitGrade').select('1')
  cy.get('#clientName').type('Teacher')
  cy.wait(100)
  cy.get('#clientEmail').type('teacher@school.fi')
  cy.wait(100)
  cy.get('#clientPhone').type('040-1234567')
  cy.wait(100)
  cy.get('#create').click()
  cy.wait(2000)
})

Then('booked event turns grey in calendar view', () => {
  cy.get('.rbc-calendar').then(() => {
    if (cy.get('.rbc-calendar').contains(`${availableEvent1}`)) {
      cy.contains(`${availableEvent1}`).parent().should('have.class', 'booked')
    } else {
      cy.get('.rbc-toolbar > :nth-child(1) > :nth-child(3)').click()
      cy.contains(`${availableEvent1}`).parent().should('have.class', 'booked')
    }
  })
  
})

When('I click on available event 2', () => {
  cy.get('.rbc-calendar').then(() => {
    if (cy.get('.rbc-calendar').contains(`${availableEvent2}`)) {
      cy.contains(`${availableEvent2}`).click()
    } else {
      cy.get('.rbc-toolbar > :nth-child(1) > :nth-child(3)').click()
      cy.contains(`${availableEvent2}`).click()
    }
  })
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