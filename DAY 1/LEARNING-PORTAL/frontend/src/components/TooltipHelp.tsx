import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipHelpProps {
  content: string;
  title?: string;
}

export const TooltipHelp: React.FC<TooltipHelpProps> = ({ content, title }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center ml-1.5 cursor-pointer text-slate-400 hover:text-indigo-400 transition-colors"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
    >
      <HelpCircle className="w-3.5 h-3.5" />
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 shadow-xl backdrop-blur-md">
          {title && <div className="font-semibold text-indigo-300 mb-1">{title}</div>}
          <div className="leading-relaxed">{content}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
