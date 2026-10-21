import React from 'react';
import { useTranslation } from 'react-i18next';
import { EvaluationResponse } from '../../types';
import { HelpCircle, FileText, Layers, BookOpen, Sparkles, Scale } from 'lucide-react';

interface ExplainabilityViewProps {
  evaluation: EvaluationResponse;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({ evaluation }) => {
  const { t, i18n } = useTranslation();

  const isKn = i18n.language === 'kn';
  const isHi = i18n.language === 'hi';

  return (
    <div className="space-y-6">
      {/* Plain Language Summary */}
      <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs">
        <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          {isKn ? 'ಈ ಫಲಿತಾಂಶ ಏಕೆ? ಸರಳ ವಿವರಣೆ' : isHi ? 'यह परिणाम क्यों आया? सरल व्याख्या' : 'Why This Result? Plain Language Explanation'}
        </h4>
        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
          {evaluation.explainability_narrative}
        </p>
      </div>

      {/* LER Plain Math Card */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-600" />
          {isKn ? 'ಭೂಮಿ ದಕ್ಷತೆ (LER) ಲೆಕ್ಕಾಚಾರದ ವಿಧಾನ' : isHi ? 'भूमि दक्षता स्कोर (LER) की गणना विधि' : 'How Land Productivity (LER) Is Calculated'}
        </h4>
        <p className="text-xs text-stone-600 leading-relaxed font-mono bg-stone-50 p-2.5 rounded-xl border border-stone-200">
          <b>LER = (ಬೆಳೆ A ಮಿಶ್ರ ಇಳುವರಿ ÷ ಬೆಳೆ A ಪ್ರತ್ಯೇಕ ಇಳುವರಿ) + (ಬೆಳೆ B ಮಿಶ್ರ ಇಳುವರಿ ÷ ಬೆಳೆ B ಪ್ರತ್ಯೇಕ ಇಳುವರಿ)</b>
        </p>
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-700 space-y-1">
          <div>
            • <b>LER = 1.00</b>: {isKn ? 'ಮಿಶ್ರ ಬೆಳೆಯಿಂದ ಪ್ರತ್ಯೇಕ ಬೆಳೆಯಷ್ಟೇ ಇಳುವರಿ ಬರುತ್ತದೆ.' : isHi ? 'मिश्रित फसल से अलग-अलग उगाने जितनी ही उपज मिलती है।' : 'Intercropping produces the exact same harvest as growing the two crops separately.'}
          </div>
          <div>
            • <b>LER &gt; 1.00 (e.g. {evaluation.ler.toFixed(2)})</b>: {isKn ? `ಒಂದೇ ಹೊಲದಲ್ಲಿ +${Math.round((evaluation.ler - 1.0) * 100)}% ಹೆಚ್ಚಿನ ಒಟ್ಟು ಇಳುವರಿ ಸಿಗುತ್ತದೆ.` : isHi ? `उसी एक खेत से +${Math.round((evaluation.ler - 1.0) * 100)}% अधिक कुल उपज प्राप्त होगी।` : `Intercropping yields +${Math.round((evaluation.ler - 1.0) * 100)}% bonus harvest from the same field.`}
          </div>
        </div>
      </div>

      {/* Trial Citation Section (if OBSERVED) */}
      {evaluation.citation && (
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              {isKn ? 'ಕೃಷಿ ಸಂಶೋಧನಾ ಕೇಂದ್ರದ ಅಧಿಕೃತ ಪ್ರಯೋಗ ಉಲ್ಲೇಖ' : isHi ? 'कृषि अनुसंधान केंद्र का आधिकारिक परीक्षण संदर्भ' : 'Verified Agricultural Research Station Trial Citation'}
            </h4>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
              {evaluation.citation.is_sample_notice.split(':')[0]}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-500 font-medium">{isKn ? 'ಸಂಸ್ಥೆ' : isHi ? 'संस्थान' : 'Institution'}</span>
              <p className="font-bold text-stone-900 mt-0.5">{evaluation.citation.institution}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-500 font-medium">{isKn ? 'ಸ್ಥಳ' : isHi ? 'स्थान' : 'Location'}</span>
              <p className="font-bold text-stone-900 mt-0.5">{evaluation.citation.location}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-500 font-medium">{isKn ? 'ವರ್ಷ ಮತ್ತು ಹಂಗಾಮು' : isHi ? 'वर्ष और मौसम' : 'Year & Season'}</span>
              <p className="font-bold text-stone-900 mt-0.5">{evaluation.citation.year} ({evaluation.citation.season})</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-500 font-medium">{isKn ? 'ಮಣ್ಣು ಮತ್ತು ಮಳೆ' : isHi ? 'मिट्टी और वर्षा' : 'Soil & Rainfall'}</span>
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
            {isKn ? 'ಇಳುವರಿಯನ್ನು ನಿರ್ಧರಿಸುವ ಪ್ರಮುಖ ಅಂಶಗಳು' : isHi ? 'उपज अनुमान को प्रभावित करने वाले मुख्य कारक' : 'Top Factors Influencing Yield Projection'}
          </h4>
          <div className="space-y-3">
            {evaluation.top_features.map((feat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-stone-900">{feat.feature}</span>
                  <span className="font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                    {feat.importance_pct}% {isKn ? 'ಪ್ರಭಾವ' : isHi ? 'प्रभाव' : 'weight'}
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
    </div>
  );
};
