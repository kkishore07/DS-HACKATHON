import React, { useState, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { ValidationSummary } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid CSV file.');
        return;
      }
      setFile(selected);
      setError(null);
      setSummary(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadCsv(file);
      setSummary(res);
      setUploading(false);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to process CSV file.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Learner Activity CSV</h3>
              <p className="text-xs text-slate-400">Dynamic validation, cleaning, and model retraining</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!summary ? (
            <>
              {/* Drop area */}
              <div 
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all"
              >
                <input 
                  type="file" 
                  ref={inputRef}
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                {file ? (
                  <div>
                    <div className="text-sm font-semibold text-white font-mono">{file.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-medium text-slate-200">
                      Drag & drop your learner dataset here, or <span className="text-indigo-400 font-semibold underline">browse</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Supports standard columns: Learner_ID, Course_ID, Login_Frequency, Video_Completion, Quiz_Attempts, Assignment_Submissions, Discussion_Activity, Completion_Status
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!file || uploading}
                  onClick={handleUpload}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {uploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {uploading ? 'Validating & Training...' : 'Run Pipeline & Retrain'}
                </button>
              </div>
            </>
          ) : (
            /* Validation Summary Card */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-200 text-sm">Dataset Ingestion & Validation Complete</div>
                  <div className="mt-1 text-slate-300 leading-relaxed">{summary.message}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Rows Processed</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">{summary.rows_processed.toLocaleString()}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Duplicates Detected</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">{summary.duplicate_rows}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{summary.duplicates_retained.toLocaleString()} Retained</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Missing Values Handled</div>
                  <div className="text-xl font-bold font-mono text-indigo-400 mt-1">{summary.missing_values}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Invalid Values Corrected</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{summary.invalid_values}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Corrected Records</div>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">{summary.corrected_records}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Valid Pipeline Records</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{summary.valid_records.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg"
                >
                  Apply & Explore Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
