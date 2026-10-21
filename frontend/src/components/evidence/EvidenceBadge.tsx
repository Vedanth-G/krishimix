import React from 'react';
import { useTranslation } from 'react-i18next';
import { EvidenceLevel, ConfidenceInterval } from '../../types';
import { CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';

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
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';
  const isHi = i18n.language === 'hi';

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
          <span>{isKn ? 'ಪ್ರಯೋಗ ದೃಢೀಕೃತ (OBSERVED)' : isHi ? 'परीक्षित ट्रायल (OBSERVED)' : 'OBSERVED TRIAL'}</span>
        </span>
        {showDetails && citationSource && (
          <span className="text-[11px] text-emerald-700 font-medium pl-1 italic">
            {isKn ? 'ಮೂಲ: ' : isHi ? 'स्रोत: ' : 'Source: '}{citationSource}
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
          <span>{isKn ? 'ಮಾಡೆಲ್ ಮುನ್ನೋಟ (PREDICTED)' : isHi ? 'मॉडल अनुमान (PREDICTED)' : 'MODEL-PREDICTED'}</span>
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
        <span>{isKn ? 'ಶಿಫಾರಸು ಇಲ್ಲ (UNSUPPORTED)' : isHi ? 'अनुशंसित नहीं (UNSUPPORTED)' : 'UNSUPPORTED'}</span>
      </span>
      {showDetails && (
        <span className="text-[11px] text-rose-700 font-medium pl-1">
          {isKn ? 'ಬೆಳೆಗಳ ನಡುವೆ ತೀವ್ರ ಪೈಪೋಟಿ' : isHi ? 'फसलों के बीच जैविक संघर्ष' : 'Physiological competition / rule violation'}
        </span>
      )}
    </div>
  );
};
