import axios from 'axios'

const getEvents = async () => {
  const response = await axios.get('http://localhost:3001/events')
  return response.data
}

export default { getEvents }