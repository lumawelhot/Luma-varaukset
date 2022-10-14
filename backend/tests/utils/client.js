const createTestClient = (server) => {
  const query = args => server.executeOperation({
    ...args,
    query: args.query,
  })
  const mutate = args => server.executeOperation({
    ...args,
    query: args.mutation
  })
  return { query, mutate }
}

module.exports = {
  createTestClient
}
