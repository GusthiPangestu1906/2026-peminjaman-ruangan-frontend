import { Peminjaman } from '../types';
import { Check, X, Trash2, Edit, Lock } from 'lucide-react'; // Kita pakai icon supaya lebih pro

interface Props {
  data: Peminjaman[];
  onUpdateStatus: (id: number, status: string) => void; // Tambahkan fungsi handler
  onDelete: (id: number) => void;
  onEdit: (item: Peminjaman) => void;
  isAdmin: boolean;
}

const BookingTable = ({ data, onUpdateStatus, onDelete, onEdit, isAdmin }: Props) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-800/60 overflow-hidden">
      <div className="p-6 border-b border-slate-800/60 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Daftar Peminjaman</h2>
        <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-400 border border-slate-700">Total: {data.length} Data</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-5 font-semibold">Nama Peminjam</th>
              <th className="px-6 py-5 font-semibold">Ruangan</th>
              <th className="px-6 py-5 font-semibold">Tanggal</th>
              <th className="px-6 py-5 font-semibold">Status</th>
              <th className="px-6 py-5 font-semibold text-center">Aksi Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{item.peminjam}</td>
                <td className="px-6 py-4 text-slate-400">{item.room?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {item.tanggalPinjam // Ganti ke tanggalPinjam sesuai backend
                    ? new Date(item.tanggalPinjam).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                    item.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isAdmin ? (
                    <div className="flex justify-center gap-2">
                    {/* Tombol hanya muncul jika status masih Pending */}
                    {item.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(item.id, 'Approved')}
                          className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-sm"
                          title="Setujui"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(item.id, 'Rejected')}
                          className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Tolak"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-slate-600 italic">Selesai</span>
                    )}

                    <div className="w-px h-6 bg-slate-800 mx-2"></div>

                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Edit Data"
                    >
                      <Edit size={16} />
                    </button>

                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 bg-slate-800/50 text-slate-400 border border-slate-700 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all shadow-sm"
                      title="Hapus Permanen"
                    >
                      <Trash2 size={16} />
                    </button>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center gap-2 text-slate-600">
                      <Lock size={14} />
                      <span className="text-xs italic">Admin Only</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                  Belum ada data peminjaman.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;