/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', ({ username, password }) => {
  cy.request({
    url: 'http://localhost:3001/graphql',
    method: 'POST',
    body: {
      query: `
        mutation login {
          login (
            username: "${username}"
            password: "${password}"
          ) {
            value
          }
        }
      `
    }
  }).then(({ body }) => {
    localStorage.setItem('app-token', body.data.login.value)
  })
})

Cypress.Commands.add('createUser', ({ username, password, isAdmin }) => {
  cy.request({
    url: 'http://localhost:3001/graphql',
    method: 'POST',
    headers: {
      authorization: `bearer ${localStorage.getItem('app-token')}`
    },
    body: {
      query: `
        mutation createUser {
          createUser (
            username: "${username}"
            password: "${password}"
            isAdmin: ${isAdmin}
          ) {
            username,
            isAdmin
          }
        }
      `
    }
  }).then(({ body }) => {
    cy.log(body)
  })
})

Cypress.Commands.add('createEventWithVisit', ({ title, start, end }) => {
  cy.request({
    url: 'http://localhost:3001/graphql',
    method: 'POST',
    headers: {
      authorization: `bearer ${localStorage.getItem('app-token')}`
    },
    body: {
      query: `
        mutation {
          createEvent(
            title: "${title}"
            scienceClass: [1,2,3]
            start: "${start.toISOString()}"
            end: "${end.toISOString()}"
            desc: "desc"
            grades: [1, 2]
            remoteVisit: ${true}
            inPersonVisit: ${false}
            tags: ["Matematiikka", "Fysiikka"]
            waitingTime: 15
            duration: 60,
            extras: [],
            remotePlatforms: [1]
          ){
            id
          }
        }
      `
    }
  }).then(({ body }) => {
    cy.request({
      url: 'http://localhost:3001/graphql',
      method: 'POST',
      headers: {
        authorization: `bearer ${localStorage.getItem('app-token')}`
      },
      body: {
        query: `
          mutation {
            createVisit(
              event: "${body.data.createEvent.id}"
              clientName: "Clien"
              schoolName: "School"
              schoolLocation: "Location"
              clientEmail: "email@test.com"
              clientPhone: "email@test.com"
              startTime: "${start.toISOString()}"
              endTime: "${end.toISOString()}"
              grade: "1. grade"
              participants: 13
              inPersonVisit: ${true}
              remoteVisit: ${false}
              dataUseAgreement: ${true}
              extras: []
              token: "token"
            ){
              id
            }
          }
        `
      }
    })
    cy.visit('http://localhost:3000')
  })
})

Cypress.Commands.add('createEvent', ({ title, remoteVisit, inPersonVisit, start, end, desc, remotePlatforms=[] }) => {
  cy.request({
    url: 'http://localhost:3001/graphql',
    method: 'POST',
    headers: {
      authorization: `bearer ${localStorage.getItem('app-token')}`
    },
    body: {
      query: `
        mutation {
          createEvent(
            title: "${title}"
            scienceClass: [1,2,3]
            start: "${start.toISOString()}"
            end: "${end.toISOString()}"
            desc: "${desc}"
            grades: [1, 2]
            remoteVisit: ${remoteVisit}
            inPersonVisit: ${inPersonVisit}
            tags: ["Matematiikka", "Fysiikka"]
            waitingTime: 15
            duration: 60,
            extras: [],
            remotePlatforms: ${JSON.stringify(remotePlatforms)}
          ){
            id,
            title,
            resourceids,
            start,
            end,
            grades,
            remoteVisit,
            inPersonVisit,
            desc,
            tags {
              name
            },
            disabled
          }
        }
      `
    }
  }).then(({ body }) => {
    console.log(body)
    cy.log(body)
    cy.visit('http://localhost:3000')
  })
})

Cypress.Commands.add('containsUser', ({ username }) => {
  cy.request({
    url: 'http://localhost:3001/graphql',
    method: 'POST',
    body: {
      query: `
        query  {
          getUsers {
            username,
            isAdmin
          }
        }
      `
    }
  }).then(({ body }) => {
    let find = false
    body.data.getUsers.forEach(user => {
      if (user.username === username) {
        find = true
      }
    }, [find])
    return find
  })
})

Cypress.Commands.add('containsEvent', ({ title, resourceids }) => {
  cy.request({
    url: 'http://localhost:3001/graphql',
    method: 'POST',
    body: {
      query: `
        query  {
          getEvents {
            title,
            resourceids
          }
        }
      `
    }
  }).then(({ body }) => {
    let find = false
    body.data.getEvents.forEach(event => {
      if (event.title === title && event.resourceids === resourceids) {
        find = true
      }
    }, [find])
    return find
  })
})

Cypress.Commands.add('findEvent', (title) => {
  cy.get('.rbc-calendar').then(($calendar) => {
    // We are using jQuery selector to find any item that has event with the given title
    const elements = $calendar.find(`.rbc-event-content:contains("${title}")`)
    if (elements.length === 0) {
      // Go to the next month view
      cy.get('.rbc-toolbar > :nth-child(1) > :nth-child(3)').click()
      cy.wait(500)
    }
    return cy.contains(`${title}`)
  })
})

