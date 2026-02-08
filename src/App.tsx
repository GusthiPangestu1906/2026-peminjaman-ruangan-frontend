import { useEffect, useState } from 'react'
import api from './services/api'
import { Peminjaman } from './types'
import { LayoutDashboard, CheckCircle, Clock, XCircle } from 'lucide-react'
import BookingTable from './components/BookingTable';

function App() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);

  // Jalankan fetchData saat aplikasi pertama kali dibuka
  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi untuk mengambil semua data dari backend
  const fetchData = async () => {
    try {
      setLoading(true);
      // Pastikan menggunakan /api/Peminjaman agar sesuai dengan Route di .NET
      const response = await api.get('/api/Peminjaman');
      setData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logika Update Status (Koneksi ke Backend PATCH Endpoint)
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      // Mengirim request PATCH ke backend sesuai controller yang kita buat
      await api.patch(`/api/Peminjaman/${id}/status`, { status: newStatus });
      
      // Refresh data agar angka statistik dan tabel langsung sinkron
      fetchData(); 
      alert(`Berhasil! Status diperbarui menjadi ${newStatus}`);
    } catch (error) {
      console.error("Gagal update status:", error);
      alert("Gagal mengubah status. Pastikan Backend menyala dan CORS sudah diatur!");
    }
  };

  // Logika Filter Statistik (Dihitung otomatis dari state 'data')
  const approved = data.filter(p => p.status === 'Approved').length;
  const pending = data.filter(p => p.status === 'Pending').length;
  const rejected = data.filter(p => p.status === 'Rejected').length;

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Memuat data dari server...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <header className="mb-8 flex items-center gap-3">
        <LayoutDashboard className="text-blue-600" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Peminjaman Ruangan</h1>
          <p className="text-sm text-gray-500">Panel Admin Management - PENS 2024</p>
        </div>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <h3 className="text-2xl font-bold">{pending}</h3>
            </div>
            <Clock className="text-yellow-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Approved</p>
              <h3 className="text-2xl font-bold">{approved}</h3>
            </div>
            <CheckCircle className="text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Rejected</p>
              <h3 className="text-2xl font-bold">{rejected}</h3>
            </div>
            <XCircle className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Booking Table Section */}
      <div className="mt-8 mb-10">
        <BookingTable data={data} onUpdateStatus={handleUpdateStatus} />
      </div>

      {/* Info Section / Footer */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-blue-700 text-sm text-center">
          💡 <strong>Tip:</strong> Gunakan tombol <span className="font-bold">Check</span> untuk menyetujui atau <span className="font-bold">X</span> untuk menolak pengajuan peminjaman.
        </p>
      </div>
    </div>
  )
}
// Update untuk memancing Pull Request

export default App