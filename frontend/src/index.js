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

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
})

const viewportContext = React.createContext({})

const ViewportProvider = ({ children }) => {
  // This is the exact same logic that we previously had in our hook

  const [width, setWidth] = React.useState(window.innerWidth)
  const [height, setHeight] = React.useState(window.innerHeight)

  const handleWindowResize = () => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  }

  React.useEffect(() => {
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  /* Now we are dealing with a context instead of a Hook, so instead
     of returning the width and height we store the values in the
     value of the Provider */
  return (
    <viewportContext.Provider value={{ width, height }}>
      {children}
    </viewportContext.Provider>
  )
}

/* Rewrite the "useViewport" hook to pull the width and height values
   out of the context instead of calculating them itself */
export const useViewport = () => {
  /* We can use the "useContext" Hook to acccess a context from within
     another Hook, remember, Hooks are composable! */
  const { width, height } = React.useContext(viewportContext)
  return { width, height }
}

ReactDOM.render(
  <ApolloProvider client={client}>
    <Router basename={process.env.PUBLIC_URL?.includes('staging') ? '/luma-varaukset' : ''}>
      <ViewportProvider>
        <App />
      </ViewportProvider>
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
)