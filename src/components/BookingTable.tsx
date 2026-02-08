import { Peminjaman } from '../types';
import { Check, X } from 'lucide-react'; // Kita pakai icon supaya lebih pro

interface Props {
  data: Peminjaman[];
  onUpdateStatus: (id: number, status: string) => void; // Tambahkan fungsi handler
}

const BookingTable = ({ data, onUpdateStatus }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Daftar Peminjaman Ruangan</h2>
        <span className="text-xs font-medium text-gray-400">Total: {data.length} Data</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama Peminjam</th>
              <th className="px-6 py-4 font-semibold">Ruangan</th>
              <th className="px-6 py-4 font-semibold">Tanggal</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Aksi Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{item.peminjam}</td>
                <td className="px-6 py-4 text-gray-500">{item.room?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.tanggalPinjam // Ganti ke tanggalPinjam sesuai backend
                    ? new Date(item.tanggalPinjam).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                    item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    {/* Tombol hanya muncul jika status masih Pending */}
                    {item.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(item.id, 'Approved')}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-shadow shadow-sm"
                          title="Setujui"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(item.id, 'Rejected')}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-shadow shadow-sm"
                          title="Tolak"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs italic text-gray-400 italic">No Action</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;