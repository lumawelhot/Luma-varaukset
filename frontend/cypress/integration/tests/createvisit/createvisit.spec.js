/* eslint-disable no-undef */
import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'
import moment from 'moment'

const eventDate = new Date()
eventDate.setDate(new Date().getDate() + 20)
const eventName = 'Test event'
const unavailableEventName = 'Unavailable event'
const unavailableEventDate = new Date()

Given('I am on the front page', () => {
  cy.visit('http://localhost:3000')
})

And('there is an event more than two weeks ahead', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: eventName,
    scienceClass: 'LINKKI',
    start: eventDate,
    end: eventDate,
    desc: 'Test event description'
  })
})

When('I click on the available event', () => {
  cy.get('.rbc-calendar').then(() => {
    if (cy.get('.rbc-calendar').contains(`${eventName}`)) {
      cy.contains(`${eventName}`).click()
    } else {
      cy.get('.rbc-toolbar > :nth-child(1) > :nth-child(3)').click()
      cy.contains(`${eventName}`).click()
    }
  })
})

Then('available event page has the correct title', () => {
  cy.contains(`${eventName}`)
})

And('available event page has the correct start date', () => {
  const formattedDate = moment(eventDate).format('DD.MM.YYYY, HH:mm')
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
  const formattedUnavailableEventDate = moment(unavailableEventDate).format('DD.MM.YYYY, HH:mm')
  cy.contains(`${formattedUnavailableEventDate}`)
})

And('unavailable event page contains correct info text', () => {
  cy.contains('Valitettavasti tämä tapahtuma ei ole varattavissa.')
})