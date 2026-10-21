import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlternativeSuggestion } from '../../types';
import { AlertTriangle, ArrowRight, ShieldAlert, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { speechHelper, buildRuralIncompatibleScript } from '../../utils/speech';

interface UnsupportedHandlerProps {
  reasons: string[];
  alternatives: AlternativeSuggestion[];
  onSelectAlternative: (alt: AlternativeSuggestion) => void;
  cropAName?: string;
  cropBName?: string;
}

export const UnsupportedHandler: React.FC<UnsupportedHandlerProps> = ({
  reasons,
  alternatives,
  onSelectAlternative,
  cropAName = 'Crop A',
  cropBName = 'Crop B'
}) => {
  const { t, i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const isKn = i18n.language === 'kn';
  const isHi = i18n.language === 'hi';

  const translateReason = (r: string): string => {
    if (isKn) {
      if (r.includes('Maturity gap')) return 'ಬೆಳವಣಿಗೆ ಅವಧಿ ವ್ಯತ್ಯಾಸ ಹೆಚ್ಚು. ಕೊಯ್ಲು ಮಾಡುವಾಗ ಚಿಕ್ಕ ಬೆಳೆಗೆ ಹಾನಿಯಾಗುತ್ತದೆ.';
      if (r.includes('solar competition') || r.includes('towers over')) return 'ಬಿಸಿಲಿಗಾಗಿ ತೀವ್ರ ಪೈಪೋಟಿ. ಎತ್ತರದ ಬೆಳೆಯು ನೆರಳು ಉಂಟುಮಾಡಿ ಗಿಡ್ಡ ಬೆಳೆಯನ್ನು ಹಾನಿಗೊಳಿಸುತ್ತದೆ.';
      if (r.includes('Dense canopy') || r.includes('shadow')) return 'ದಟ್ಟವಾದ ನೆರಳು ಕೆಳಗಿನ ಹರಡುವ ರೆಂಬೆಗಳಿಗೆ ಬಿಸಿಲು ತಲುಪದಂತೆ ಮಾಡುತ್ತದೆ.';
      if (r.includes('water needs') || r.includes('irrigation')) return 'ನೀರಿನ ಅಗತ್ಯಗಳಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯಿಲ್ಲ. ಅತಿಯಾದ ನೀರು ಒಣ ಬೇಸಾಯ ಬೆಳೆಯನ್ನು ಕೊಳೆಯಿಸುತ್ತದೆ.';
      if (r.includes('pH')) return 'ಮಣ್ಣಿನ ಪಿಎಚ್ ಅಗತ್ಯಗಳಲ್ಲಿ ವ್ಯತ್ಯಾಸವಿದೆ.';
    }
    if (isHi) {
      if (r.includes('Maturity gap')) return 'पकने के समय में भारी अंतर। कटाई के समय दूसरी फसल को नुकसान होगा।';
      if (r.includes('solar competition') || r.includes('towers over')) return 'धूप के लिए तीव्र प्रतिस्पर्धा। लंबी फसल छोटी फसल को ढक लेती है।';
      if (r.includes('water needs')) return 'पानी की आवश्यकताओं में अंतर। अधिक पानी से सूखा-सहनशील फसल को नुकसान होगा।';
    }
    return r;
  };

  const handleSpeakWarning = () => {
    if (isSpeaking) {
      speechHelper.stop();
      setIsSpeaking(false);
    } else {
      const primaryReason = reasons.length > 0 ? translateReason(reasons[0]) : 'ಅನುಪಯುಕ್ತ ಹೊಂದಾಣಿಕೆ';
      const hasNativeKn = speechHelper.hasNativeVoiceForLang('kn');
      const warningText = buildRuralIncompatibleScript(cropAName, cropBName, primaryReason, i18n.language, hasNativeKn);
      setIsSpeaking(true);
      speechHelper.speak(warningText, i18n.language, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Red Alert Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-sm text-rose-950 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-xs shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-200 px-2.5 py-0.5 rounded-full">
                {isKn ? 'ಅನುಪಯುಕ್ತ ಮಿಶ್ರ ಬೆಳೆ' : isHi ? 'अस्वीकृत अंतरफसल' : 'UNSUPPORTED COMBINATION'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-rose-950 mt-1">
                {isKn
                  ? 'ಕೃಷಿ ನಿಯಮಗಳ ಉಲ್ಲಂಘನೆ: ಈ ಬೆಳೆ ಜೋಡಿಯನ್ನು ಶಿಫಾರಸು ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ'
                  : isHi
                  ? 'जैविक संघर्ष: इस फसल संयोजन की सिफारिश नहीं की जा सकती'
                  : 'Agronomic Conflict: This Crop Combination Cannot Be Recommended'}
              </h3>
            </div>
          </div>

          {/* Audio Warning Button */}
          <button
            type="button"
            onClick={handleSpeakWarning}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition active:scale-95 ${
              isSpeaking
                ? 'bg-rose-700 text-white animate-pulse'
                : 'bg-white hover:bg-rose-100 text-rose-800 border border-rose-300'
            }`}
            title="Listen to incompatibility advisory"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{isKn ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-rose-700" />
                <span>🔊 {isKn ? 'ಎಚ್ಚರಿಕೆ ಕೇಳಿ' : 'Listen'}</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-rose-900 leading-relaxed font-medium">
          {isKn
            ? 'ರೈತರಿಗೆ ಬೆಳೆ ನಷ್ಟ ಮತ್ತು ಆರ್ಥಿಕ ಹೊರೆ ತಪ್ಪಿಸಲು, ಕೃಷಿಮಿಕ್ಸ್ ಹೊಂದಾಣಿಕೆಯಾಗದ ತಳಿಗಳಿಗೆ ತಪ್ಪು ನಕ್ಷೆಯನ್ನು ಅಥವಾ ಸುಳ್ಳು ಇಳುವರಿ ಭರವಸೆಯನ್ನು ಸೃಷ್ಟಿಸುವುದಿಲ್ಲ.'
            : isHi
            ? 'किसानों को आर्थिक नुकसान से बचाने के लिए, कृषिमिक्स असंगत फसलों के लिए कोई गलत नक्शा या भ्रामक उपज उत्पन्न नहीं करता है।'
            : 'To prevent catastrophic yield loss or wasted investment, KrishiMix refuses to generate false planting maps or fabricate yield projections for agronomically incompatible varieties.'}
        </p>

        {/* List of Failure Reasons */}
        <div className="mt-3 pt-3 border-t border-rose-200">
          <h4 className="text-xs font-bold text-rose-950 mb-2 uppercase tracking-wide">
            {isKn ? 'ಕಂಡುಬಂದ ಕೃಷಿ ನಿಯಮ ಉಲ್ಲಂಘನೆಗಳು:' : isHi ? 'पहचाने गए जैविक संघर्ष:' : 'Identified Agronomic Rule Violations:'}
          </h4>
          <ul className="space-y-2">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 bg-white/80 p-3 rounded-xl border border-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{translateReason(reason)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Supported Alternatives */}
      {alternatives.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                {isKn ? 'ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತವಾದ ಪರ್ಯಾಯ ಬೆಳೆಗಳು' : isHi ? 'आपके खेत के लिए अनुशंसित विकल्प' : 'Validated Alternatives for Your Field'}
              </h4>
              <p className="text-xs text-stone-500">
                {isKn
                  ? 'ಈ ಬೆಳೆ ಜೋಡಿಗಳು ಪರಸ್ಪರ ಸಹಕರಿಸಿ ಬೆಳೆಯುತ್ತವೆ ಮತ್ತು ಸಂಶೋಧನಾ ಕೇಂದ್ರಗಳಲ್ಲಿ ಪರೀಕ್ಷಿಸಲ್ಪಟ್ಟಿವೆ.'
                  : isHi
                  ? 'इन फसल युग्मों में जैविक तालमेल है और विश्वविद्यालय परीक्षणों में सिद्ध हैं।'
                  : 'These companion pairings have proven biological synergy and verified trials.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-stone-200 hover:border-emerald-500 bg-stone-50/50 hover:bg-emerald-50/30 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-stone-900">{alt.crop_a_name} + {alt.crop_b_name}</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      LER {alt.expected_ler.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    {alt.variety_a_name} &amp; {alt.variety_b_name} ({alt.row_ratio})
                  </div>
                  <p className="text-xs text-stone-600 mt-2 italic">
                    "{alt.rationale}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectAlternative(alt)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <span>{isKn ? 'ಈ ಪರ್ಯಾಯ ಬೆಳೆಯನ್ನು ಆರಿಸಿ' : isHi ? 'इस विकल्प को चुनें' : 'Switch to This Alternative'}</span>
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
