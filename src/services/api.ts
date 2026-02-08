import axios from 'axios';

// Konfigurasi dasar Axios
const api = axios.create({
  // Pastikan alamatnya terbungkus tanda petik tunggal dan diakhiri koma DI LUAR petik
  baseURL: 'http://localhost:5215',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;