/* eslint-disable no-undef */
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Given('Employee is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

Given('an event with title yyyyy is created', () => {

  const date = new Date()
  //date.setDate(date.getDate() + 100)
  date.setMinutes(0)
  //date.setSeconds(0)
  const start = new Date(date)
  const end = new Date(date)
  start.setHours(7)
  end.setHours(23)
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