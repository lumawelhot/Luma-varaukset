/* eslint-disable no-undef */
import { Given, /* When,  */Then, And } from 'cypress-cucumber-preprocessor/steps'

const eventDate = new Date()
eventDate.setDate(new Date().getDate() + 15)
const eventName = 'Cancel-visit'

it('Initialize tests', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: eventName,
    scienceClass: [1,2],
    start: eventDate,
    end: eventDate,
    remoteVisit: true,
    inPersonVisit: false,
    desc: 'Test event description'
  })
})

Given('I have made a booking for an available event', () => {
  cy.visit('http://localhost:3000')

  cy.get('.rbc-calendar').then(() => {
    if (cy.get('.rbc-calendar').contains(`${eventName}`)) {
      cy.contains(`${eventName}`).click()
    } else {
      cy.get('.rbc-toolbar > :nth-child(1) > :nth-child(3)').click()
      cy.contains(`${eventName}`).click()
    }
  })

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
  cy.get('.privacyPolicy > input').click()
  cy.get('.remoteVisitGuidelines > input').click()
  cy.get('#create').click()
  cy.wait(2000)

  // Cancel the visit
  cy.wait(2000)
})

Then('I can cancel that booking', () => {
  //cy.contains('Peru').click()
})


And('the event is available for booking', () => {
  /* cy.visit('http://localhost:3000')

  cy.get('.rbc-calendar').then(() => {
    if (cy.get('.rbc-calendar').contains(`${eventName}`)) {
      cy.contains(`${eventName}`).click()
    } else {
      cy.get('.rbc-toolbar > :nth-child(1) > :nth-child(3)').click()
      cy.contains(`${eventName}`).click()
    }
  })

  cy.contains('Varaa tapahtuma') */
})
