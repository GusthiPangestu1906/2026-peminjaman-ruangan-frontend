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
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Riwayat Peminjaman
        </h2>
        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-medium border border-slate-700">
          Total: {data.length} Data
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-5 font-semibold border-b border-slate-800">Nama Peminjam</th>
              <th className="px-6 py-5 font-semibold border-b border-slate-800">Ruangan</th>
              <th className="px-6 py-5 font-semibold border-b border-slate-800">Tanggal</th>
              <th className="px-6 py-5 font-semibold border-b border-slate-800">Status</th>
              <th className="px-6 py-5 font-semibold border-b border-slate-800 text-center">Aksi Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4 font-medium text-white">{item.peminjam}</td>
                <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300 transition-colors">{item.room?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
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
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    item.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isAdmin ? (
                  <div className="flex justify-center gap-2 items-center">
                    {/* Tombol hanya muncul jika status masih Pending */}
                    {item.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(item.id, 'Approved')}
                          className="p-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm hover:shadow-emerald-900/20"
                          title="Setujui"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(item.id, 'Rejected')}
                          className="p-2 bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm hover:shadow-rose-900/20"
                          title="Tolak"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-slate-600 italic">Selesai</span>
                    )}

                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm ml-2"
                      title="Edit Data"
                    >
                      <Edit size={18} />
                    </button>

                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 bg-slate-800/50 text-slate-400 border border-slate-700 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all shadow-sm"
                      title="Hapus Permanen"
                    >
                      <Trash2 size={18} />
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