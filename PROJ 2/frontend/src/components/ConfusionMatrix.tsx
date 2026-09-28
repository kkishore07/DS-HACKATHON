import React from 'react';
import { ConfusionMatrixData } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  data: ConfusionMatrixData;
  nonCompleterRecall: number;
  completerRecall: number;
}

export const ConfusionMatrix: React.FC<Props> = ({
  data,
  nonCompleterRecall,
  completerRecall
}) => {
  const { matrix, percentages, true_positive, true_negative, false_positive, false_negative } = data;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Model Confusion Matrix</h3>
          <p className="text-xs text-slate-400 mt-0.5">Evaluation on 20% Stratified Holdout Test Set</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            N = {(true_positive + true_negative + false_positive + false_negative).toLocaleString()} Test Samples
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Matrix Grid */}
        <div className="md:col-span-2">
          <div className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Predicted Class
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold mb-2">
            <div className="text-rose-400">Predicted: Not Completed</div>
            <div className="text-emerald-400">Predicted: Completed</div>
          </div>

          <div className="space-y-2">
            {/* Actual Not Completed */}
            <div className="flex items-center gap-2">
              <div className="w-24 text-right text-xs font-semibold text-rose-400 shrink-0">
                Actual: Not Completed
              </div>
              <div className="grid grid-cols-2 gap-2 flex-1">
                {/* True Negative (Class 0 Correct) */}
                <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-center transition-transform hover:scale-[1.02]">
                  <div className="text-xs text-rose-300 font-medium">True Dropout (TN)</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {true_negative.toLocaleString()}
                  </div>
                  <div className="text-xs text-rose-400 font-mono mt-0.5">
                    {percentages[0][0]}% of test set
                  </div>
                </div>

                {/* False Positive (Type I Error) */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center transition-transform hover:scale-[1.02]">
                  <div className="text-xs text-slate-400 font-medium">False Completed (FP)</div>
                  <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                    {false_positive.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {percentages[0][1]}% of test set
                  </div>
                </div>
              </div>
            </div>

            {/* Actual Completed */}
            <div className="flex items-center gap-2">
              <div className="w-24 text-right text-xs font-semibold text-emerald-400 shrink-0">
                Actual: Completed
              </div>
              <div className="grid grid-cols-2 gap-2 flex-1">
                {/* False Negative (Type II Error) */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center transition-transform hover:scale-[1.02]">
                  <div className="text-xs text-slate-400 font-medium">False Dropout (FN)</div>
                  <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                    {false_negative.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {percentages[1][0]}% of test set
                  </div>
                </div>

                {/* True Positive (Class 1 Correct) */}
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center transition-transform hover:scale-[1.02]">
                  <div className="text-xs text-emerald-300 font-medium">True Completed (TP)</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {true_positive.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-400 font-mono mt-0.5">
                    {percentages[1][1]}% of test set
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Key Metric Spotlight */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            Key EdTech Business Metric
          </div>
          <div>
            <div className="text-xs text-slate-400">Non-Completer Recall</div>
            <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
              {Math.round(nonCompleterRecall * 1000) / 10}%
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Missing an at-risk student costs learner retention and revenue. The model correctly flags {Math.round(nonCompleterRecall * 100)}% of eventual dropouts.
          </p>
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-xs text-slate-400">Completed Recall</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {Math.round(completerRecall * 1000) / 10}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
