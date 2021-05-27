import React from 'react'
import ReactDOM from 'react-dom'
import { setContext } from 'apollo-link-context'
import { BrowserRouter as Router } from 'react-router-dom'

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'

import './index.css'
import App from './App'

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

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <Router basename={process.env.PUBLIC_URL}>
      <App />
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
)