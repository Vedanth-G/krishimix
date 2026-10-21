import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, CheckCircle2, Sparkles, AlertTriangle, X } from 'lucide-react';

export const EvidenceLegend: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isKn = i18n.language === 'kn';
  const isHi = i18n.language === 'hi';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-xs"
      >
        <Info className="w-4 h-4 text-emerald-600" />
        <span>{isKn ? 'ಸಾಕ್ಷ್ಯಾಧಾರ ವಿವರ (Legend)' : isHi ? 'प्रमाण विवरण (Legend)' : 'Evidence Legend'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                {isKn ? 'ಕೃಷಿಮಿಕ್ಸ್ ಸಾಕ್ಷ್ಯಾಧಾರ ಪಾರದರ್ಶಕತೆ' : isHi ? 'कृषिमिक्स प्रमाण पारदर्शिता' : 'KrishiMix Evidence Framework'}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mt-3 mb-4 leading-relaxed font-medium">
              {isKn
                ? 'ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರನ್ನು ನಷ್ಟದಿಂದ ರಕ್ಷಿಸಲು, ಕೃಷಿಮಿಕ್ಸ್ ಯಾವುದೇ ಅಂದಾಜನ್ನು ಸತ್ಯವೆಂದು ಎಂದಿಗೂ ಬಿಂಬಿಸುವುದಿಲ್ಲ. ಪ್ರತಿಯೊಂದು ತೀರ್ಪಿಗೂ ಸಾಕ್ಷ್ಯಾಧಾರ ನೀಡಲಾಗುತ್ತದೆ.'
                : isHi
                ? 'छोटे किसानों को फसल बर्बादी से बचाने के लिए, कृषिमिक्स कभी भी अनुमान को वास्तविक परीक्षण के रूप में प्रस्तुत नहीं करता है।'
                : 'To protect smallholder farmers from crop failure, KrishiMix strictly enforces transparency. Predictions are never disguised as observations.'}
            </p>

            <div className="space-y-3 text-xs">
              {/* Level 1: OBSERVED */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-600 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" /> OBSERVED
                  </span>
                  <span className="font-bold text-emerald-900">
                    {isKn ? 'ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ ಕ್ಷೇತ್ರ ಪ್ರಯೋಗಗಳು' : isHi ? 'कृषि विश्वविद्यालय क्षेत्रीय परीक्षण' : 'Empirical Trial Records'}
                  </span>
                </div>
                <p className="text-emerald-800 leading-relaxed font-medium">
                  {isKn
                    ? 'ಇಳುವರಿ ಮತ್ತು LER ಅಂಕಗಳು ನೇರವಾಗಿ ICAR ಅಥವಾ ಕೃಷಿ ಸಂಶೋಧನಾ ಕೇಂದ್ರಗಳ ಅಧಿಕೃತ ಕ್ಷೇತ್ರ ಪ್ರಯೋಗಗಳಿಂದ ಬಂದಿರುತ್ತವೆ. ಸಂಸ್ಥೆ, ವರ್ಷ ಮತ್ತು ಸ್ಥಳವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸಲಾಗುತ್ತದೆ.'
                    : isHi
                    ? 'उपज और LER मान सीधे कृषि विश्वविद्यालयों या ICAR के परीक्षणों से आते हैं। संस्थान, वर्ष और स्थान प्रदर्शित किया जाता है।'
                    : 'Yield and LER values come directly from peer-reviewed agricultural university or ICAR field experiments.'}
                </p>
              </div>

              {/* Level 2: MODEL-PREDICTED */}
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/70">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-sky-600 text-white">
                    <Sparkles className="w-3.5 h-3.5" /> MODEL-PREDICTED
                  </span>
                  <span className="font-bold text-sky-900">
                    {isKn ? 'ವೈಜ್ಞಾನಿಕ ಗಣಕೀಕೃತ ಅಂದಾಜು (ML)' : isHi ? 'मशीन लर्निंग मॉडल अनुमान' : 'Validated Machine Learning'}
                  </span>
                </div>
                <p className="text-sky-800 leading-relaxed font-medium">
                  {isKn
                    ? 'ಕೃಷಿ ನಿಯಮಗಳು (ಬಿಸಿಲು, ನೀರು, ಬೆಳವಣಿಗೆ ಅವಧಿ) ಹೊಂದಾಣಿಕೆಯಾಗಿದ್ದಾಗ, ೯೫% ನಿಖರತೆಯೊಂದಿಗೆ ಮುನ್ನೋಟ ನೀಡಲಾಗುತ್ತದೆ.'
                    : isHi
                    ? 'कृषि नियम अनुकूल होने पर ९५% विश्वसनीयता अंतराल के साथ अनुमान लगाया जाता है।'
                    : 'Applied when agronomic rules pass without conflict, accompanied by a 95% Confidence Interval.'}
                </p>
              </div>

              {/* Level 3: UNSUPPORTED */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-rose-600 text-white">
                    <AlertTriangle className="w-3.5 h-3.5" /> UNSUPPORTED
                  </span>
                  <span className="font-bold text-rose-900">
                    {isKn ? 'ಕೃಷಿ ವಿಜ್ಞಾನದಂತೆ ತಿರಸ್ಕೃತ' : isHi ? 'कृषि नियमों के अनुसार अस्वीकृत' : 'Agronomically Rejected'}
                  </span>
                </div>
                <p className="text-rose-800 leading-relaxed font-medium">
                  {isKn
                    ? 'ಬೆಳೆಗಳ ನಡುವೆ ತೀವ್ರ ಪೈಪೋಟಿ (ಬಿಸಿಲು ಮರೆಮಾಚುವಿಕೆ, ನೀರಿನ ಕೊರತೆ) ಇರುವ ಕಾರಣ ತಿರಸ್ಕರಿಸಲಾಗುತ್ತದೆ. ಯಾವುದೇ ನಕ್ಷೆ ನೀಡದೆ ಪರ್ಯಾಯ ತಳಿಗಳನ್ನು ಸೂಚಿಸಲಾಗುತ್ತದೆ.'
                    : isHi
                    ? 'जैविक संघर्ष के कारण अस्वीकृत। किसानों को झूठा नक्शा देने के बजाय उपयुक्त विकल्प दिए जाते हैं।'
                    : 'Rejected because of severe biological conflict. No layout is generated; closest supported alternatives are provided.'}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition shadow-xs"
              >
                {isKn ? 'ಅರ್ಥವಾಯಿತು (Close)' : isHi ? 'समझ गया (Close)' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
