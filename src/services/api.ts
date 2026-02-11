import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5215', // Sesuaikan dengan port backend .NET Anda
});

export default api;