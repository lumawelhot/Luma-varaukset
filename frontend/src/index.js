import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router } from 'react-router-dom'
import './i18n'
import { setContext } from 'apollo-link-context'
import 'react-datepicker/dist/react-datepicker.css'
import 'rc-steps/assets/index.css'
import 'react-datepicker/dist/react-datepicker.css'

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client'

import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/link-ws'
import LumaContext from './context'
import { ChakraProvider } from '@chakra-ui/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { registerLocale } from  'react-datepicker'
import fi from 'date-fns/locale/fi'
registerLocale('fi', fi)

const BASE_URL = (process.env.NODE_ENV === 'production' && process.env.PUBLIC_URL) ? process.env.PUBLIC_URL : 'http://localhost:3001'
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

const [, ...basename] = BASE_URL.split('://')[1].split('/')

ReactDOM.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <Router basename={`/${basename}`}>
        <LumaContext>
          <ChakraProvider>
            <App />
            <ToastContainer />
          </ChakraProvider>
        </LumaContext>
      </Router>
    </React.StrictMode>
  </ApolloProvider>,
  document.getElementById('root')
)