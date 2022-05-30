import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router } from 'react-router-dom'
import './i18n'
import { setContext } from 'apollo-link-context'
import 'react-datepicker/dist/react-datepicker.css'
import 'rsuite/dist/rsuite.min.css'

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client'

import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/link-ws'
import ContextProviders from './Components/ContextProviders'
import { ChakraProvider } from '@chakra-ui/react'

const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : 'http://localhost:3001'
const WS_URL = BASE_URL.replace(/^http/,'ws') + '/graphql/ws'

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
  uri: WS_URL,
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

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <Router>
        <ContextProviders>
          <ChakraProvider>
            <App />
          </ChakraProvider>
        </ContextProviders>
      </Router>
    </React.StrictMode>
  </ApolloProvider>,
  document.getElementById('root')
)