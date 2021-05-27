import axios from 'axios'

const BASE_URL = process.env.PUBLIC_URL || 'http://localhost:3001'

const getEvents = async () => {
  const response = await axios.get(BASE_URL + '/events')
  response.data.forEach(element => {
    element.start = new Date(element.start)
    element.end = new Date(element.end)
  })
  return response.data
}

export default { getEvents }