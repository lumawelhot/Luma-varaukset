/* eslint-disable no-undef */
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Given('Employee is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

Given('an event with title yyyyy is created', () => {
  const start = new Date()
  const end = new Date()
  start.setHours(7)
  start.setDate(16)
  end.setHours(23)
  end.setDate(16)
  cy.createEvent({
    title: 'yyyyy',
    scienceClass: 'FOTONI',
    grades: [1, 3, 4],
    remoteVisit: true,
    inPersonVisit: false,
    start,
    end,
    tags: []
  })
})

When('I am on the calendar page', () => {
  cy.visit('http://localhost:3000')
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(4)').click()
})

Then('the event yyyyy is shown with correct information', () => {
  cy.get('.rbc-agenda-view').contains('yyyyy')
})

Given('User is not logged in', () => {
  localStorage.removeItem('app-token')
})

Then('a specific event is shown', () => {
  cy.get('.rbc-agenda-view').contains('yyyyy')
})