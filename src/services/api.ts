import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5215/api', // Sesuaikan port dengan yang ada di Swagger kamu
});

export default api;