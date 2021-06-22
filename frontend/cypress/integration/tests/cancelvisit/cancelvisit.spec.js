/* eslint-disable no-undef */
import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'

const eventDate = new Date()
eventDate.setDate(new Date().getDate() + 1)
const eventName = 'Cancel-visit'

Given('employee is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

And('there is an available event in more than two weeks ahead', () => {
  cy.createEvent({
    title: eventName,
    scienceClass: 'LINKKI',
    start: eventDate,
    end: eventDate,
    remoteVisit: true,
    inPersonVisit: false,
    desc: 'Test event description'
  })
})


And('I have made a booking for that event', () => {
  cy.visit('http://localhost:3000')
  cy.wait(1000)
  cy.findEvent(eventName).click()

  // Open visit form
  cy.contains('Varaa tapahtuma').click()

  // Fill in the form
  cy.get('#clientName').type('Teacher')
  cy.get('#schoolName').type('School')
  cy.get('#schoolLocation').type('Location')
  cy.get('#clientEmail').type('teacher@school.fi')
  cy.get('#verifyEmail').type('teacher@school.fi')
  cy.get('#clientPhone').type('040-1234567')
  cy.get('#visitGrade').type('1. grade')
  cy.get('#participants').type('9')
  cy.get('#create').click()
  cy.wait(2000)

  // Cancel the visit
  cy.wait(2000)
})

Then('I can cancel that booking', () => {
  cy.contains('Peru').click()
})


And('the event is available for booking', () => {
  cy.visit('http://localhost:3000')
  cy.wait(500)

  cy.findEvent(eventName).click()

  cy.contains('Varaa tapahtuma')
})
