import axios from 'axios'

const getEvents = async () => {
  const response = await axios.get('http://localhost:3001/events')
  response.data.forEach(element => {
    element.start = new Date(element.start)
    element.end = new Date(element.end)
  })
  return response.data
}

export default { getEvents }