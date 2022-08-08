const createTestClient = (server) => {
  const query = async args => {
    return await server.executeOperation({
      ...args,
      query: args.query,
    })
  }
  const mutate = async args => {
    return await server.executeOperation({
      ...args,
      query: args.mutation
    })
  }
  return { query, mutate }
}

module.exports = {
  createTestClient
}