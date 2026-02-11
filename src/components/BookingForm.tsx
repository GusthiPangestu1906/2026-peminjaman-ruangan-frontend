import { useState, useEffect } from 'react';
import { Calendar, User, AlignLeft, Home, Save, X } from 'lucide-react';
import api from '../services/api';
import { Room, Peminjaman } from '../types';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  onError?: (message: string) => void;
  initialData?: Peminjaman | null;
}

const BookingForm = ({ onSuccess, onCancel, onError, initialData }: Props) => {
  // Helper: Format tanggal ISO ke format datetime-local (YYYY-MM-DDThh:mm)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  // Helper: Ambil waktu sekarang untuk batasan input (min attribute)
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  // State untuk menampung input user
  const [formData, setFormData] = useState({
    peminjam: initialData?.peminjam || '',
    roomId: initialData?.roomId || 0,
    tanggalPinjam: initialData?.tanggalPinjam ? formatDateForInput(initialData.tanggalPinjam.toString()) : '',
    keperluan: initialData?.keperluan || ''
  });

  // State untuk daftar ruangan (Dropdown)
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // Ambil daftar ruangan dari Backend saat komponen muncul
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Asumsi kamu punya endpoint GET /api/room (RoomController)
        // Jika belum ada, nanti kita buat. Sementara akan kosong.
        const response = await api.get('/api/room'); 
        setRooms(response.data);
      } catch (error) {
        console.error("Gagal ambil room:", error);
      }
    };
    fetchRooms();
  }, []);

  // Handle perubahan input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roomId' ? Number(value) : value
    }));
  };

  // Handle Submit ke Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tanggalPinjam: new Date(formData.tanggalPinjam).toISOString(), // Format tanggal ISO
      };

      if (initialData) {
        // Mode Edit: Gunakan PUT
        await api.put(`/api/Peminjaman/${initialData.id}`, payload);
      } else {
        // Mode Create: Gunakan POST
        await api.post('/api/Peminjaman', { ...payload, status: 'Pending' });
      }
      
      onSuccess(); // Kembali ke dashboard / refresh data
    } catch (error) {
      console.error(error);
      if (onError) {
        onError('Gagal mengajukan peminjaman. Pastikan semua data terisi!');
      } else {
        alert('Gagal mengajukan peminjaman. Pastikan semua data terisi!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0F111A] p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-800/80 w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="mb-6 flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {initialData ? 'Edit Peminjaman' : 'Form Peminjaman'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{initialData ? 'Ubah data peminjaman yang sudah ada.' : 'Isi data lengkap untuk mengajukan ruangan.'}</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Nama */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Nama Peminjam</label>
          <div className="relative group">
            <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              name="peminjam"
              required
              value={formData.peminjam}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-white placeholder-slate-600 transition-all"
              placeholder="Contoh: Gusthi Pangestu"
            />
          </div>
        </div>

        {/* Input Ruangan (Dropdown) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Pilih Ruangan</label>
          <div className="relative group">
            <Home className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <select
              name="roomId"
              required
              value={formData.roomId}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-white appearance-none transition-all"
            >
              <option value={0} className="bg-slate-900 text-slate-400">-- Pilih Ruangan --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id} className="bg-slate-900 text-white">
                  {room.name} (Kapasitas: {room.capacity})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4 pointer-events-none">
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-500"></div>
            </div>
          </div>
        </div>

        {/* Input Tanggal */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tanggal Peminjaman</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="datetime-local"
              name="tanggalPinjam"
              required
              value={formData.tanggalPinjam}
              min={getCurrentDateTime()} // Mencegah pemilihan tanggal masa lalu di UI
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-white placeholder-slate-600 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Input Keperluan */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Keperluan</label>
          <div className="relative group">
            <AlignLeft className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <textarea
              name="keperluan"
              required
              value={formData.keperluan}
              onChange={handleChange}
              rows={3}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-white placeholder-slate-600 transition-all resize-none"
              placeholder="Contoh: Rapat Himpunan Mahasiswa"
            />
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Save size={20} />
            {loading ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Ajukan Peminjaman')}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-all flex items-center gap-2 active:scale-[0.98]"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;