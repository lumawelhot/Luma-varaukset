import { client } from '..'

export const query = async ({ query, variables, field }) => {
  try {
    const { data } = await client.query({
      query,
      fetchPolicy: 'no-cache',
      variables
    })
    return data[field]
  } catch (err) { undefined }
}

export const mutate = async ({ mutation, variables, field }) => {
  try {
    const { data } = await client.mutate({
      mutation,
      variables,
      fetchPolicy: 'no-cache',
    })
    return data[field]
  } catch (err) { undefined }
}
