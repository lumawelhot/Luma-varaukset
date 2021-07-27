import React from 'react'
import ReactDOM from 'react-dom'
import { setContext } from 'apollo-link-context'
import { BrowserRouter as Router } from 'react-router-dom'

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client'

import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/link-ws'

import './index.css'
import App from './App'
import './i18n'

const BASE_URL = process.env.PUBLIC_URL || 'http://localhost:3001'

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('app-token')

  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null,
    },
  }
})

const httpLink = new HttpLink({ uri: BASE_URL + '/graphql' })

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3001/graphql',
  options: {
    reconnect: true,
  },
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <Router basename={process.env.PUBLIC_URL}>
      <App />
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
)