/* eslint-disable no-undef */
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Given('Employee is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

Given('an event with title yyyyy is created', () => {

  const date = new Date()
  date.setMinutes(0)
  const start = new Date(date)
  const end = new Date(date)
  start.setHours(7)
  end.setHours(23)
  cy.createEvent({
    title: 'yyyyy',
    scienceClass: [1,2],
    grades: [1, 3, 4],
    remoteVisit: true,
    inPersonVisit: false,
    start,
    end,
    tags: [],
    duration: 60,
    extras: [],
    desc: 'Some description'
  })
})

When('I am on the calendar page', () => {
  cy.visit('http://localhost:3000')
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(4)').click()
})

Then('the event yyyyy is shown with correct information', () => {
  cy.get('.rbc-agenda-view').contains('yyyyy')
  //console.log(event.parent().children())
})

Given('User is not logged in', () => {
  localStorage.removeItem('app-token')
})

Then('a specific event is shown', () => {
  cy.get('.rbc-agenda-view').contains('yyyyy')
})