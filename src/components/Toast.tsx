import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-right-full duration-300 ${
      type === 'success' 
        ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-400' 
        : 'bg-slate-900/90 border-rose-500/30 text-rose-400'
    }`}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <p className="text-sm font-medium text-slate-200">{message}</p>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;