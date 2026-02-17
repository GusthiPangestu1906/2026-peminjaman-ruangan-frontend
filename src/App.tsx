import { useEffect, useState } from 'react'
import api from './services/api'
import type { Peminjaman } from './types'
import { LayoutDashboard, CheckCircle, Clock, XCircle, Plus, Search, Filter, LogIn, LogOut, Lock, ChevronLeft, ChevronRight, CalendarSearch, X } from 'lucide-react'
import BookingTable from './components/BookingTable';
import BookingForm from './components/BookingForm';
import RoomAvailability from './components/RoomAvailability';
import Toast from './components/Toast';
import ConfirmationModal from './components/ConfirmationModal';

function App() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRoomCheck, setShowRoomCheck] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [selectedBooking, setSelectedBooking] = useState<Peminjaman | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Jalankan fetchData saat aplikasi pertama kali dibuka
  useEffect(() => {
    fetchData();
  }, []);

  // Efek untuk fetch ulang data saat search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(searchTerm);
    }, 500); // Debounce
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fungsi untuk mengambil semua data dari backend
  const fetchData = async (searchQuery = '') => {
    try {
      setLoading(true);
      // Pastikan menggunakan /api/Peminjaman agar sesuai dengan Route di .NET
      const response = await api.get(`/api/Peminjaman?search=${searchQuery}`);
      console.log('[App] fetchData response', response.status, response.data);
      setData(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menampilkan notifikasi
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Logika Update Status (Koneksi ke Backend PATCH Endpoint)
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/api/Peminjaman/${id}/status`, { status: newStatus });
      // Refresh data agar angka statistik dan tabel langsung sinkron
      fetchData(); 
      showToast(`Berhasil! Status diperbarui menjadi ${newStatus}`, 'success');
    } catch (error) {
      console.error("Gagal update status:", error);
      showToast("Gagal mengubah status. Coba lagi.", 'error');
    }
  };

  // Logika Hapus Data
  const handleDelete = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus data peminjaman ini secara permanen?',
      onConfirm: () => handleConfirmDelete(id),
    });
  };

  const handleConfirmDelete = async (id: number) => {
      try {
        await api.delete(`/api/Peminjaman/${id}`);
        fetchData();
        showToast('Data berhasil dihapus.', 'success');
      } catch (error) {
        console.error("Gagal menghapus:", error);
        showToast('Gagal menghapus data.', 'error');
      }
      setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // Fungsi Login Hardcoded
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCreds.username === 'admin' && loginCreds.password === 'admin123') {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginCreds({ username: '', password: '' });
      showToast('Login berhasil! Mode Admin aktif.', 'success');
    } else {
      showToast('Username atau password salah!', 'error');
    }
  };

  // Logika Edit Data
  const handleEdit = (item: Peminjaman) => {
    setSelectedBooking(item);
    setShowForm(true);
  };

  // Logika Filter Statistik (Dihitung otomatis dari state 'data')
  const approved = data.filter(p => p.status === 'Approved').length;
  const pending = data.filter(p => p.status === 'Pending').length;
  const rejected = data.filter(p => p.status === 'Rejected').length;

  // Logika Pagination & Definisi Variabel untuk JSX
  const filteredData = data;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D14]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Memuat data sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D14] text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Gradients */} 
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800/60 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                    <LayoutDashboard size={20} />
                </div>
                <span className="text-blue-400 font-bold tracking-wider text-xs uppercase">Admin Dashboard <span className="text-slate-600 mx-2">|</span> v1.1.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                Peminjaman <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Ruangan</span>
            </h1>
            <p className="text-slate-400 text-lg">Sistem Manajemen Ruangan Terpadu & Real-time.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button onClick={() => setIsAdmin(false)} className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all text-sm font-medium border border-rose-500/20">
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <button onClick={() => setShowLogin(true)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800 transition-all text-sm font-medium border border-slate-700">
                <LogIn size={18} />
                Login Admin
              </button>
            )}
            <button 
              onClick={() => setShowRoomCheck(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800 transition-all text-sm font-medium border border-slate-700"
            >
              <CalendarSearch size={18} />
              Cek Ruangan
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 border border-blue-400/20"
            >
              <Plus size={20} />
              Buat Peminjaman
            </button>
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 font-medium mb-1">Menunggu Persetujuan</p>
              <h3 className="text-4xl font-bold text-white">{pending}</h3>
              <div className="mt-4 flex items-center gap-2 text-yellow-500 text-sm font-medium bg-yellow-500/10 w-fit px-3 py-1 rounded-full">
                <Clock size={14} /> Pending
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-green-500/30 transition-colors">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 font-medium mb-1">Disetujui</p>
              <h3 className="text-4xl font-bold text-white">{approved}</h3>
              <div className="mt-4 flex items-center gap-2 text-green-500 text-sm font-medium bg-green-500/10 w-fit px-3 py-1 rounded-full">
                <CheckCircle size={14} /> Approved
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-red-500/30 transition-colors">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <XCircle size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 font-medium mb-1">Ditolak</p>
              <h3 className="text-4xl font-bold text-white">{rejected}</h3>
              <div className="mt-4 flex items-center gap-2 text-red-500 text-sm font-medium bg-red-500/10 w-fit px-3 py-1 rounded-full">
                <XCircle size={14} /> Rejected
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama peminjam atau ruangan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-600"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors">
            <Filter size={20} />
            <span>Filter</span>
          </button>
        </div>

        {/* Booking Table Section */}
        <div className="mb-10">
          <BookingTable 
            data={paginatedData} 
            onUpdateStatus={handleUpdateStatus} 
            onDelete={handleDelete}
            onEdit={handleEdit}
            isAdmin={isAdmin}
          />
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-slate-800/50 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-slate-400 font-medium text-sm">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-slate-800/50 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Toast Notification */}
        <div className="fixed bottom-6 right-6 z-50">
          {toast && (
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
              <BookingForm 
                initialData={selectedBooking}
                onSuccess={() => {
                  setShowForm(false);
                  setSelectedBooking(null);
                  fetchData(searchTerm);
                  showToast(selectedBooking ? 'Data berhasil diperbarui!' : 'Peminjaman berhasil diajukan!', 'success');
                }} 
                onCancel={() => { setShowForm(false); setSelectedBooking(null); }}
                onError={(msg) => showToast(msg, 'error')}
              />
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogin(false)}></div>
            <div className="relative z-10 w-full max-w-md bg-[#0F111A] p-8 rounded-3xl border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
                  <Lock size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                <p className="text-slate-400 text-sm">Masukkan kredensial untuk akses admin.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                  <input 
                    type="text" 
                    value={loginCreds.username}
                    onChange={e => setLoginCreds({...loginCreds, username: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={loginCreds.password}
                    onChange={e => setLoginCreds({...loginCreds, password: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                    placeholder="admin123"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20">
                  Masuk
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Room Availability Modal */}
        {showRoomCheck && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-6xl bg-[#0F111A] rounded-3xl border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
              <button 
                onClick={() => setShowRoomCheck(false)}
                className="absolute top-6 right-6 p-2 bg-slate-800/50 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors z-10"
              >
                <X size={24} />
              </button>
              <div className="p-2">
                <RoomAvailability />
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
      </div>
    </div>
  )
}

//edit

export default App