/* eslint-disable no-undef */
import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'
import { set, addBusinessDays } from 'date-fns'

const eventDate = addBusinessDays(set(new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), 1)
const eventName = 'Cancel-visit'
const eventStart = new Date(eventDate.setHours(10,0))
const eventEnd = set(new Date(eventDate), { hours: 12 })

Given('there is an available event in more than two weeks ahead', () => {
  cy.request('http://localhost:3001/reset')
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: eventName,
    start: eventStart,
    end: eventEnd,
    scienceClass: [1,2],
    remoteVisit: true,
    inPersonVisit: false,
    desc: 'Test event description'
  })
  cy.wait(500)
})

When('I have made a booking for that event', () => {
  cy.findEvent(eventName).click()

  // Open visit form
  cy.contains('Varaa vierailu').click()

  // Fill in the form
  cy.get('#clientName').type('Teacher')
  cy.get('#schoolName').type('School')
  cy.get('#schoolLocation').type('Location')
  cy.get('#clientEmail').type('teacher@school.fi')
  cy.get('#verifyEmail').type('teacher@school.fi')
  cy.get('#clientPhone').type('040-1234567')
  cy.get('#visitGrade').type('1. grade')
  cy.get('#participants').type('9')
  cy.get('#startTime').type('10:00')
  cy.get('.privacyPolicy > input').click()
  cy.get('.remoteVisitGuidelines > input').click()
  cy.get('#create').click()
  const toast = cy.get('.toast')
  toast.should('have.class', 'is-success')
})

Then('I can cancel that booking', () => {
  cy.contains('Peru').click()
})


And('the event is available for booking', () => {
  cy.findEvent(eventName).click()
  cy.contains('Varaa vierailu')
})
