import React from 'react';
import { EvaluationResponse } from '../../types';
import { HelpCircle, CheckCircle2, AlertTriangle, AlertCircle, FileText, Layers, ShieldCheck } from 'lucide-react';
import { EvidenceBadge } from '../evidence/EvidenceBadge';

interface ExplainabilityViewProps {
  evaluation: EvaluationResponse;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({ evaluation }) => {
  return (
    <div className="space-y-6">
      {/* Plain Language Summary */}
      <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs">
        <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          Why This Result? Plain-Language Agronomic Explanation
        </h4>
        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
          {evaluation.explainability_narrative}
        </p>
      </div>

      {/* Trial Citation Section (if OBSERVED) */}
      {evaluation.citation && (
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Verified Agricultural Research Station Trial Citation
            </h4>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
              {evaluation.citation.is_sample_notice.split(':')[0]}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-500 font-medium">Institution</span>
              <p className="font-bold text-stone-900 mt-0.5">{evaluation.citation.institution}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-500 font-medium">Location</span>
              <p className="font-bold text-stone-900 mt-0.5">{evaluation.citation.location}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-500 font-medium">Year & Season</span>
              <p className="font-bold text-stone-900 mt-0.5">{evaluation.citation.year} ({evaluation.citation.season})</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-500 font-medium">Soil & Rainfall</span>
              <p className="font-bold text-stone-900 mt-0.5">{evaluation.citation.soil_type} ({evaluation.citation.rainfall_mm}mm)</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 italic">
            Full Publication Citation: "{evaluation.citation.citation_text}"
          </p>

          <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            {evaluation.citation.is_sample_notice}
          </p>
        </div>
      )}

      {/* Top Contributing Model Features (if MODEL-PREDICTED) */}
      {evaluation.top_features.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            Top Algorithmic Factors Influencing Yield Projection
          </h4>
          <div className="space-y-3">
            {evaluation.top_features.map((feat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-stone-900">{feat.feature}</span>
                  <span className="font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                    {feat.importance_pct}% weight
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-sky-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, feat.importance_pct * 3)}%` }}
                  />
                </div>
                <p className="text-stone-600 text-[11px]">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Checks Diagnostics */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Individual Agronomic Constraint Verifications
        </h4>
        <div className="space-y-2">
          {evaluation.checks.map((chk, idx) => {
            const isPass = chk.status === 'PASS';
            const isWarn = chk.status === 'WARNING';
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                  isPass
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : isWarn
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                    : 'bg-rose-50/60 border-rose-200 text-rose-950'
                }`}
              >
                {isPass ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : isWarn ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span>{chk.parameter}</span>
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-md bg-white/70">
                      {chk.status}
                    </span>
                  </div>
                  <p className="mt-0.5 font-medium">{chk.farmer_message}</p>
                  <p className="text-[11px] opacity-75 mt-0.5 italic">{chk.scientific_detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
