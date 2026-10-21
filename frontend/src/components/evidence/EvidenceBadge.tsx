import React from 'react';
import { EvidenceLevel, ConfidenceInterval } from '../../types';
import { CheckCircle2, Sparkles, AlertTriangle, HelpCircle } from 'lucide-react';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  confidenceInterval?: ConfidenceInterval;
  citationSource?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  level,
  confidenceInterval,
  citationSource,
  size = 'md',
  showDetails = true
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3.5 py-1',
    lg: 'text-base px-4 py-2 font-semibold'
  };

  if (level === 'OBSERVED') {
    return (
      <div className="inline-flex flex-col items-start gap-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold shadow-sm ${sizeClasses[size]}`}
          title="Direct trial observation from institutional research station"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>OBSERVED TRIAL</span>
        </span>
        {showDetails && citationSource && (
          <span className="text-[11px] text-emerald-700 font-medium pl-1 italic">
            Source: {citationSource}
          </span>
        )}
      </div>
    );
  }

  if (level === 'MODEL-PREDICTED') {
    return (
      <div className="inline-flex flex-col items-start gap-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 text-sky-800 font-bold shadow-sm ${sizeClasses[size]}`}
          title="Algorithmic ML prediction based on validated agronomic rules"
        >
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
          <span>MODEL-PREDICTED</span>
        </span>
        {showDetails && confidenceInterval && (
          <span className="text-[11px] text-sky-700 font-medium pl-1">
            95% CI: [{confidenceInterval.low.toFixed(2)} - {confidenceInterval.high.toFixed(2)}]
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 text-rose-800 font-bold shadow-sm ${sizeClasses[size]}`}
        title="Agronomically incompatible pair. No layout or yield promises fabricated."
      >
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>UNSUPPORTED</span>
      </span>
      {showDetails && (
        <span className="text-[11px] text-rose-700 font-medium pl-1">
          Physiological competition / rule violation
        </span>
      )}
    </div>
  );
};
