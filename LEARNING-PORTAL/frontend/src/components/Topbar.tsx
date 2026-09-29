import React from 'react';
import { Search, Bell, UploadCloud, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onOpenUpload: () => void;
  onRetrain?: () => void;
  isRetraining?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenUpload,
  onRetrain,
  isRetraining = false
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/learners?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="relative w-72 sm:w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Global search by Learner ID or Course ID..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* ML Status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Random Forest Active</span>
        </div>

        {onRetrain && (
          <button
            onClick={onRetrain}
            disabled={isRetraining}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-semibold transition-all"
            title="Retrain Random Forest model on latest data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Retraining...' : 'Retrain Model'}</span>
          </button>
        )}

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload CSV</span>
        </button>
      </div>
    </header>
  );
};
