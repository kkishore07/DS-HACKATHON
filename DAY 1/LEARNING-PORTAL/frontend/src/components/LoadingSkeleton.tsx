import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({ rows = 4, height = "h-16" }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className={`w-full ${height} bg-slate-800/40 rounded-xl border border-slate-700/30`}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 bg-slate-800/50 rounded-xl border border-slate-700/30 p-4 space-y-3">
          <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
          <div className="h-8 bg-slate-700/70 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
};
