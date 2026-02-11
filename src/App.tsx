import { useEffect, useState } from 'react'
import api from './services/api'
import { Peminjaman } from './types'
import { LayoutDashboard, CheckCircle, Clock, XCircle, PlusCircle, Filter, Search, ChevronLeft, ChevronRight, LogIn, LogOut, Lock } from 'lucide-react'
import BookingTable from './components/BookingTable';
import BookingForm from './components/BookingForm';
import Toast from './components/Toast';
import ConfirmationModal from './components/ConfirmationModal';

function App() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // State untuk toggle form
  const [showLogin, setShowLogin] = useState(false); // State untuk modal login
  const [isAdmin, setIsAdmin] = useState(false); // State status login admin
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [selectedBooking, setSelectedBooking] = useState<Peminjaman | null>(null); // State untuk data yang diedit
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterStatus, setFilterStatus] = useState('All'); // State untuk filter
  const [searchTerm, setSearchTerm] = useState(''); // State untuk search
  const [currentPage, setCurrentPage] = useState(1); // State untuk pagination
  const itemsPerPage = 5; // Jumlah item per halaman
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  // Jalankan fetchData saat aplikasi pertama kali dibuka
  useEffect(() => {
    fetchData();
  }, []);

  // Reset ke halaman 1 jika filter atau search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Fungsi inti untuk update status ke backend
  const processUpdateStatus = async (id: number, newStatus: string) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false })); // Tutup modal
    try {
      await api.patch(`/api/Peminjaman/${id}/status`, { status: newStatus });
      fetchData(); 
      showToast(`Status diperbarui menjadi ${newStatus}`, 'success');
    } catch (error) {
      console.error("Gagal update status:", error);
      showToast("Gagal mengubah status.", 'error');
    }
  };

  // Wrapper untuk handle klik tombol aksi (dengan konfirmasi)
  const handleUpdateStatus = (id: number, newStatus: string) => {
    if (newStatus === 'Rejected') {
      setConfirmModal({
        isOpen: true,
        title: 'Tolak Peminjaman?',
        message: 'Apakah Anda yakin ingin menolak pengajuan ini? Status akan berubah menjadi Rejected.',
        type: 'danger',
        onConfirm: () => processUpdateStatus(id, newStatus)
      });
    } else {
      // Jika Approved, langsung proses (atau bisa tambah konfirmasi juga di sini)
      processUpdateStatus(id, newStatus);
    }
  };

  // Fungsi untuk menghapus data (Delete)
  const processDelete = async (id: number) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    try {
      await api.delete(`/api/Peminjaman/${id}`);
      fetchData();
      showToast('Data peminjaman berhasil dihapus', 'success');
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      showToast("Gagal menghapus data.", 'error');
    }
  };

  const handleDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data?',
      message: 'Apakah Anda yakin ingin menghapus data peminjaman ini secara permanen? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger',
      onConfirm: () => processDelete(id)
    });
  };

  // Fungsi untuk membuka form edit
  const handleEdit = (item: Peminjaman) => {
    setSelectedBooking(item);
    setShowForm(true);
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

  // Logika Filter Statistik (Dihitung otomatis dari state 'data')
  const approved = data.filter(p => p.status === 'Approved').length;
  const pending = data.filter(p => p.status === 'Pending').length;
  const rejected = data.filter(p => p.status === 'Rejected').length;

  // Logika Filter Data (Client-side)
  const filteredData = data.filter(item => {
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesSearch = item.peminjam.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Logika Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0C15]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium animate-pulse">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C15] p-4 md:p-8 text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Bento Item 1: Header / Welcome (Span 8) */}
        <div className="col-span-12 md:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 p-8 rounded-3xl flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="absolute top-0 right-0">
                  {isAdmin ? (
                    <button onClick={() => setIsAdmin(false)} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all text-sm font-medium border border-rose-500/20">
                      <LogOut size={16} />
                      Logout Admin
                    </button>
                  ) : (
                    <button onClick={() => setShowLogin(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800 transition-all text-sm font-medium border border-slate-700">
                      <LogIn size={16} />
                      Login Admin
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                        <LayoutDashboard size={20} />
                    </div>
                    <span className="text-blue-400 font-bold tracking-wider text-xs uppercase">Admin Dashboard</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-3 leading-tight">
                    Peminjaman <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Ruangan</span>
                </h1>
                <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
                    Kelola jadwal, persetujuan, dan status ruangan kampus dalam satu panel terintegrasi yang modern.
                </p>
            </div>
        </div>

        {/* Bento Item 2: Action / Create Button (Span 4) */}
        <div 
          onClick={() => setShowForm(true)}
          className="col-span-12 md:col-span-4 bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-blue-900/20 group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-500/50"
        >
            <div className="absolute -right-6 -top-6 text-white/10 group-hover:text-white/20 transition-colors rotate-12">
                <PlusCircle size={140} />
            </div>
            <div className="relative z-10">
                <div className="bg-white/20 w-fit p-3 rounded-xl backdrop-blur-md mb-6 shadow-inner">
                    <PlusCircle className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Buat Peminjaman</h3>
                <p className="text-blue-100 text-sm font-medium opacity-90">Klik di sini untuk membuka form pengajuan baru.</p>
            </div>
        </div>

        {/* Bento Item 3, 4, 5: Stats */}
        <div className="col-span-12 md:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 p-6 rounded-3xl flex items-center justify-between group hover:border-yellow-500/30 transition-all">
            <div>
                <p className="text-slate-400 font-medium mb-1 text-sm uppercase tracking-wider">Pending</p>
                <h3 className="text-4xl font-bold text-white">{pending}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform border border-yellow-500/10">
                <Clock size={28} />
            </div>
        </div>
        
        <div className="col-span-12 md:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
            <div>
                <p className="text-slate-400 font-medium mb-1 text-sm uppercase tracking-wider">Approved</p>
                <h3 className="text-4xl font-bold text-white">{approved}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform border border-emerald-500/10">
                <CheckCircle size={28} />
            </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 p-6 rounded-3xl flex items-center justify-between group hover:border-rose-500/30 transition-all">
            <div>
                <p className="text-slate-400 font-medium mb-1 text-sm uppercase tracking-wider">Rejected</p>
                <h3 className="text-4xl font-bold text-white">{rejected}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform border border-rose-500/10">
                <XCircle size={28} />
            </div>
        </div>

        {/* Bento Item 6: Table (Full Width) */}
        <div className="col-span-12 space-y-4">
          {/* Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mr-2 px-2">
                  <Filter size={16} />
                  <span>Filter:</span>
              </div>
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                  <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      filterStatus === status 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800 border border-slate-800/50'
                  }`}
                  >{status}</button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Cari peminjam atau ruangan..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <BookingTable 
            data={paginatedData} 
            onUpdateStatus={handleUpdateStatus} 
            onDelete={handleDelete} 
            onEdit={handleEdit} 
            isAdmin={isAdmin}
          />

          {/* Pagination Controls */}
          {filteredData.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="text-sm text-slate-500 order-2 sm:order-1">
                Menampilkan <span className="text-slate-300 font-medium">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> dari <span className="text-slate-300 font-medium">{filteredData.length}</span> data
              </span>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-1 bg-slate-900/40 p-1 rounded-xl border border-slate-800/50">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
              onClick={() => setShowForm(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-lg" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <BookingForm 
                    initialData={selectedBooking}
                    onSuccess={() => {
                        setShowForm(false);
                        setSelectedBooking(null);
                        fetchData();
                        showToast(selectedBooking ? 'Data berhasil diperbarui!' : 'Peminjaman berhasil diajukan!', 'success');
                    }} 
                    onCancel={() => { setShowForm(false); setSelectedBooking(null); }} 
                    onError={(msg) => showToast(msg, 'error')}
                />
            </div>

            {/* Custom Keyframes for smooth animation */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes scaleIn { 
                    from { opacity: 0; transform: scale(0.95); } 
                    to { opacity: 1; transform: scale(1); } 
                }
            `}</style>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogin(false)}></div>
          <div className="relative z-10 w-full max-w-md bg-[#0F111A] p-8 rounded-3xl border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 mb-4">
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

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        type={confirmModal.type}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}

//edit

export default App