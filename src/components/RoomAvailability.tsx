import { useState, useEffect } from 'react';
import { Search, Calendar, Users, AlertCircle, Home, Clock, User } from 'lucide-react';
import api from '../services/api';
import { AxiosError } from 'axios';

// Definisi tipe data sesuai response dari Backend
interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  isAvailable: boolean;
}

interface BookingSchedule {
  tanggalPinjam: string;
  peminjam: string;
  keperluan: string;
}

export default function RoomAvailability() {
  // State untuk input form
  const [selectedRoomId, setSelectedRoomId] = useState('');
  
  // State untuk data dan UI
  const [schedules, setSchedules] = useState<BookingSchedule[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  // Ambil daftar ruangan untuk dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log('[RoomAvailability] Fetching rooms from /api/Room');
        const response = await api.get('/api/Room', {
          timeout: 5000 // 5 second timeout
        });
        console.log('[RoomAvailability] Rooms fetched successfully:', response.data);
        setAllRooms(response.data);
      } catch (err) {
        console.error("Gagal mengambil daftar ruangan", err);
        // Set a fallback empty array to prevent errors
        setAllRooms([]);
      }
    };
    fetchRooms();
  }, []);

  // Fungsi untuk memanggil API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError('Silakan pilih ruangan terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');
    setSchedules([]);

    try {
      const endpoint = `/api/Room/${selectedRoomId}/bookings`;
      console.log('[RoomAvailability] Calling endpoint:', endpoint);
      
      // 2. Panggil Endpoint Backend menggunakan service api
      const response = await api.get(endpoint, {
        timeout: 5000 // 5 second timeout
      });
      
      console.log('[RoomAvailability] API Response:', response.data);
      setSchedules(response.data || []);
      setHasSearched(true);
    } catch (err) {
      console.error('[RoomAvailability] Error details:', err);
      
      let errorMessage = 'Terjadi kesalahan saat menghubungi server.';
      
      if ((err as AxiosError).response) {
        const statusCode = (err as AxiosError).response?.status;
        const responseData = (err as AxiosError).response?.data;
        console.error("API Error Response:", statusCode, responseData);
        
        if (statusCode === 400) {
          errorMessage = 'Tanggal tidak valid atau masa lalu. Silakan pilih tanggal yang akan datang.';
        } else if (statusCode === 404) {
          errorMessage = 'Endpoint API tidak ditemukan. Periksa konfigurasi server.';
        } else if (statusCode === 500) {
          errorMessage = 'Terjadi kesalahan di server. Hubungi administrator.';
        }
      } else if ((err as any).code === 'ECONNABORTED') {
        errorMessage = 'Permintaan timeout. Server mungkin tidak merespons.';
      } else if ((err as any).message === 'Network Error') {
        errorMessage = 'Gagal menghubungi server. Pastikan backend sedang berjalan di http://localhost:5215';
      }
      
      setError(errorMessage);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Cek Jadwal Ruangan</h2>
        <p className="text-gray-400">Pilih ruangan untuk melihat jadwal penggunaan dan tanggal yang tidak tersedia.</p>
      </div>

      {/* --- FORM PENCARIAN --- */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 shadow-lg backdrop-blur-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          
          {/* Input Nama Ruangan (Dropdown) */}
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Home size={16} className="text-blue-400" />
              Pilih Ruangan
            </label>
            <div className="relative">
              <select 
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
              >
                <option value="">-- Pilih Ruangan --</option>
                {allRooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name} (Kapasitas: {room.capacity})</option>
                ))}
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Tombol Cari */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Mencari...
              </>
            ) : (
              <><Search size={18} /> Cek Jadwal</>
            )}
          </button>
        </form>
      </div>

      {/* --- HASIL PENCARIAN --- */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {hasSearched && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {schedules.length > 0 ? (
            <>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="text-red-400" size={24} />
                Jadwal Terisi: <span className="text-red-400">{schedules.length} Booking Ditemukan</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.map((schedule, index) => (
                  <div key={index} className="group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/10">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                            {new Date(schedule.tanggalPinjam).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </h4>
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <Clock size={14} /> {new Date(schedule.tanggalPinjam).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className="bg-red-500/10 text-red-400 text-xs font-medium px-2.5 py-1 rounded-full border border-red-500/20">
                          Booked
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Oleh: <strong>{schedule.peminjam}</strong></span>
                        </div>
                        <div className="flex items-start gap-2 text-gray-300">
                          <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                          <span className="text-sm italic">"{schedule.keperluan}"</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-green-500/10 rounded-xl border border-green-500/30 border-dashed">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                  <Calendar size={32} />
                </div>
              </div>
              <p className="text-green-400 text-lg font-bold">Ruangan Kosong!</p>
              <p className="text-gray-400 text-sm mt-2">Belum ada jadwal booking yang disetujui untuk ruangan ini kedepannya.</p>
              <p className="text-gray-500 text-xs mt-1">Anda bebas memilih tanggal kapan saja.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
