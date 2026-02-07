import { useEffect, useState } from 'react'
import api from './services/api'
import { Peminjaman } from './types'
import { LayoutDashboard, CheckCircle, Clock, XCircle } from 'lucide-react'

function App() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/Peminjaman');
      setData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logika Filter Statistik
  const approved = data.filter(p => p.status === 'Approved').length;
  const pending = data.filter(p => p.status === 'Pending').length;
  const rejected = data.filter(p => p.status === 'Rejected').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex items-center gap-3">
        <LayoutDashboard className="text-blue-600" size={32} />
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Peminjaman Ruangan</h1>
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

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-blue-700 text-sm">
          💡 <strong>Tip:</strong> Data di atas diambil langsung dari <code>localhost:5215</code>. 
          Pastikan backend tetap menyala!
        </p>
      </div>
    </div>
  )
}

export default App