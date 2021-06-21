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

  cy.visit('http://localhost:3000')
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

Cypress.Commands.add('createEvent', ({ title, scienceClass, remoteVisit, inPersonVisit, start, end, desc }) => {
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
          class: "${scienceClass}"
          start: "${start}"
          end: "${end}"
          desc: "${desc}"
          grades: [1, 2]
          remoteVisit: ${remoteVisit}
          inPersonVisit: ${inPersonVisit}
          tags: [{ name: "Matematiikka" }, { name: "Fysiikka" }]
        ){
          title,
          resourceId,
          start,
          end,
          grades,
          remoteVisit,
          inPersonVisit,
          desc,
          tags {
            name
          },
          booked
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

Cypress.Commands.add('containsEvent', ({ title, resourceId }) => {
  cy.request({
    url: 'http://localhost:3001/graphql',
    method: 'POST',
    body: {
      query: `
        query  {
          getEvents {
            title,
            resourceId
          }
        }
      `
    }
  }).then(({ body }) => {
    let find = false
    body.data.getEvents.forEach(event => {
      if (event.title === title && event.resourceId === resourceId) {
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

