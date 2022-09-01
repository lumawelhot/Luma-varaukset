import { client } from '..'

export const query = async (gql, { variables, field }) => {
  try {
    const { data } = await client.query({
      query: gql,
      fetchPolicy: 'no-cache',
      variables
    })
    return data[field]
  } catch (err) { undefined }
}

export const mutate = async (gql, { variables, field }) => {
  try {
    const { data } = await client.mutate({
      mutation: gql,
      variables,
      fetchPolicy: 'no-cache',
    })
    return data[field]
  } catch (err) { undefined }
}
