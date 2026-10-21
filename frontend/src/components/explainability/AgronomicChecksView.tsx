import React from 'react';
import { useTranslation } from 'react-i18next';
import { EvaluationResponse } from '../../types';
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck, Info } from 'lucide-react';

interface AgronomicChecksViewProps {
  evaluation: EvaluationResponse;
}

export const AgronomicChecksView: React.FC<AgronomicChecksViewProps> = ({ evaluation }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-950">
              Agronomic Safety &amp; Biological Compatibility Checks ({evaluation.checks.length} Rules Evaluated)
            </h4>
            <p className="text-xs text-emerald-800">
              Every crop pair must satisfy botanical and microclimatic rules before layout recommendation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {evaluation.checks.map((chk, idx) => {
          const isPass = chk.status === 'PASS';
          const isWarn = chk.status === 'WARNING';
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 transition shadow-xs ${
                isPass
                  ? 'bg-white border-emerald-200 text-stone-900'
                  : isWarn
                  ? 'bg-amber-50/70 border-amber-300 text-stone-900'
                  : 'bg-rose-50/70 border-rose-300 text-stone-900'
              }`}
            >
              <div className="mt-0.5">
                {isPass ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : isWarn ? (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wide text-stone-800">
                    {chk.parameter}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                      isPass
                        ? 'bg-emerald-100 text-emerald-800'
                        : isWarn
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {chk.status}
                  </span>
                </div>

                <p className="text-xs font-semibold text-stone-800 leading-snug">
                  {chk.farmer_message}
                </p>

                <p className="text-[11px] text-stone-500 font-normal italic pt-0.5">
                  Scientific Basis: {chk.scientific_detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
