import React, { useState } from 'react';
import { Info, CheckCircle2, Sparkles, AlertTriangle, X } from 'lucide-react';

export const EvidenceLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-emerald-800 text-xs font-semibold hover:bg-emerald-50 transition shadow-sm"
      >
        <Info className="w-4 h-4 text-emerald-600" />
        <span>Evidence Legend</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                KrishiMix Evidence Framework
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mt-3 mb-4">
              To protect smallholder farmers from crop failure, KrishiMix strictly enforces transparency. Predictions are never disguised as observations.
            </p>

            <div className="space-y-4">
              {/* Level 1: OBSERVED */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-600 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" /> OBSERVED
                  </span>
                  <span className="text-xs font-semibold text-emerald-900">Empirical Trial Records</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Yield and LER values come directly from peer-reviewed agricultural university or ICAR field experiments. Shows full station citation, year, season, and location.
                </p>
              </div>

              {/* Level 2: MODEL-PREDICTED */}
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/70">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-sky-600 text-white">
                    <Sparkles className="w-3.5 h-3.5" /> MODEL-PREDICTED
                  </span>
                  <span className="text-xs font-semibold text-sky-900">Validated Machine Learning</span>
                </div>
                <p className="text-xs text-sky-800 leading-relaxed">
                  Applied when agronomic rules (sunlight, maturity, moisture) pass without conflict, but no identical station trial is in the database. Accompanied by a 95% Confidence Interval and feature breakdown.
                </p>
              </div>

              {/* Level 3: UNSUPPORTED */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-rose-600 text-white">
                    <AlertTriangle className="w-3.5 h-3.5" /> UNSUPPORTED
                  </span>
                  <span className="text-xs font-semibold text-rose-900">Agronomically Rejected</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Rejected because of severe biological conflict (e.g., solar smothering, maturity mismatch &gt; 90d, or conflicting water requirements). No layout is generated; closest supported alternatives are provided.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
