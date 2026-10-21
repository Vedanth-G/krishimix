import React from 'react';
import { AlternativeSuggestion } from '../../types';
import { AlertTriangle, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface UnsupportedHandlerProps {
  reasons: string[];
  alternatives: AlternativeSuggestion[];
  onSelectAlternative: (alt: AlternativeSuggestion) => void;
}

export const UnsupportedHandler: React.FC<UnsupportedHandlerProps> = ({
  reasons,
  alternatives,
  onSelectAlternative
}) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Red Alert Banner */}
      <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm text-rose-950 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600 text-white rounded-xl shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-200 px-2 py-0.5 rounded-full">
              UNSUPPORTED COMBINATION
            </span>
            <h3 className="text-lg font-black text-rose-950 mt-1">
              Agronomic Conflict: This Crop Combination Cannot Be Recommended
            </h3>
          </div>
        </div>

        <p className="text-xs text-rose-900 leading-relaxed font-medium">
          To prevent catastrophic yield loss or wasted investment, KrishiMix refuses to generate false planting maps or fabricate yield projections for agronomically incompatible varieties.
        </p>

        {/* List of Failure Reasons */}
        <div className="mt-4 pt-4 border-t border-rose-200">
          <h4 className="text-xs font-bold text-rose-950 mb-2 uppercase tracking-wide">
            Identified Agronomic Rule Violations:
          </h4>
          <ul className="space-y-2">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 bg-white/80 p-3 rounded-xl border border-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Supported Alternatives */}
      {alternatives.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Validated Alternatives for Your Field
              </h4>
              <p className="text-xs text-stone-500">
                These companion pairings have proven biological synergy and verified trials.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50/50 hover:bg-emerald-50/30 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-stone-900">{alt.crop_a_name} + {alt.crop_b_name}</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      LER {alt.expected_ler.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    Varieties: {alt.variety_a_name} &amp; {alt.variety_b_name} ({alt.row_ratio})
                  </div>
                  <p className="text-xs text-stone-600 mt-2 italic">
                    "{alt.rationale}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectAlternative(alt)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <span>Switch to This Alternative</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
