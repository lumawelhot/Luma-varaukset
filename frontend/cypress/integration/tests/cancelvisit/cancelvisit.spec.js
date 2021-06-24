/* eslint-disable no-undef */
import { Given, /* When,  */Then, And } from 'cypress-cucumber-preprocessor/steps'

const eventDate = new Date()
eventDate.setDate(new Date().getDate() + 29)
const eventName = 'Cancel-visit'
const eventStart = new Date(eventDate.setHours(10,0))
const eventEnd = new Date(eventDate.setHours(12,0))

it('Initialize tests', () => {
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
})

Given('I am on the front page', () => {
  cy.visit('http://localhost:3000')
  cy.wait(1000)
})

And('there is an available event more than two weeks ahead', () => {
  cy.findEvent(eventName).click()
  cy.wait(1000)
  cy.contains('Varaa tapahtuma').click()
})

And('I have made a booking for that event', () => {
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
})

Then('I can cancel that booking', () => {
  cy.contains('Peru').click()
})


And('the event is available for booking', () => {
  cy.visit('http://localhost:3000')

  cy.findEvent(eventName).click()

  cy.contains('Varaa tapahtuma')
})
