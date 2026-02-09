import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'info';
}

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'info' }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
        onClick={onCancel}
      ></div>
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-[#0F111A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden" style={{ animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">{message}</p>
          
          <div className="flex gap-3 justify-center">
            <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors active:scale-95">
              Batal
            </button>
            <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all active:scale-95 ${type === 'danger' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}>
              Ya, Lanjutkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;