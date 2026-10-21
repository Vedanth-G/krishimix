import React from 'react';
import { useTranslation } from 'react-i18next';
import { EvaluationResponse } from '../../types';
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck, Info } from 'lucide-react';

interface AgronomicChecksViewProps {
  evaluation: EvaluationResponse;
}

export const AgronomicChecksView: React.FC<AgronomicChecksViewProps> = ({ evaluation }) => {
  const { t, i18n } = useTranslation();

  const getStatusLabel = (status: string) => {
    if (i18n.language === 'kn') {
      return status === 'PASS' ? 'ಸುರಕ್ಷಿತ (PASS)' : status === 'WARNING' ? 'ಎಚ್ಚರಿಕೆ (WARNING)' : 'ಹೊಂದಾಣಿಕೆಯಿಲ್ಲ (FAIL)';
    } else if (i18n.language === 'hi') {
      return status === 'PASS' ? 'सफल (PASS)' : status === 'WARNING' ? 'सावधानी (WARNING)' : 'अस्वीकृत (FAIL)';
    }
    return status;
  };

  const getParameterPlainName = (param: string) => {
    if (param.toLowerCase().includes('maturity')) {
      return i18n.language === 'kn' ? 'ಬೆಳೆ ಕೊಯ್ಲಿನ ಅವಧಿ ಸಮತೋಲನ' : i18n.language === 'hi' ? 'फसल पकने की अवधि का संतुलन' : 'Harvest Timing Balance (Maturity Synchrony)';
    }
    if (param.toLowerCase().includes('canopy') || param.toLowerCase().includes('light')) {
      return i18n.language === 'kn' ? 'ಸೂರ್ಯನ ಬಿಸಿಲು ಹಂಚಿಕೆ' : i18n.language === 'hi' ? 'धूप और ऊंचाई का बंटवारा' : 'Sunlight Sharing Balance (Canopy Competition)';
    }
    if (param.toLowerCase().includes('root')) {
      return i18n.language === 'kn' ? 'ಬೇರಿನ ಆಳ ಮತ್ತು ನೀರಿನ ಹಂಚಿಕೆ' : i18n.language === 'hi' ? 'जड़ों की गहराई एवं नमी का बंटवारा' : 'Root Depth Separation (Moisture Sharing)';
    }
    if (param.toLowerCase().includes('water')) {
      return i18n.language === 'kn' ? 'ನೀರಿನ ಅಗತ್ಯತೆ ಹೊಂದಾಣಿಕೆ' : i18n.language === 'hi' ? 'पानी की मांग अनुकूलता' : 'Water Need Compatibility';
    }
    if (param.toLowerCase().includes('ph')) {
      return i18n.language === 'kn' ? 'ಮಣ್ಣಿನ ರಸಸಾರ ಸಹಿಷ್ಣುತೆ' : i18n.language === 'hi' ? 'मिट्टी का पीएच संतुलन' : 'Soil pH Tolerance';
    }
    return param;
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-950">
              {i18n.language === 'kn'
                ? `ಕೃಷಿ ಸುರಕ್ಷತೆ ಮತ್ತು ಜೈವಿಕ ಹೊಂದಾಣಿಕೆ ತಪಾಸಣೆ (${evaluation.checks.length} ನಿಯಮಗಳ ಪರಿಶೀಲನೆ)`
                : i18n.language === 'hi'
                ? `कृषि सुरक्षा एवं जैविक अनुकूलता जांच (${evaluation.checks.length} नियमों का परीक्षण)`
                : `Agronomic Safety & Biological Compatibility Checks (${evaluation.checks.length} Rules Evaluated)`}
            </h4>
            <p className="text-xs text-emerald-800">
              {i18n.language === 'kn'
                ? 'ಎರಡೂ ಬೆಳೆಗಳು ಪರಸ್ಪರ ಸ್ಪರ್ಧಿಸದೆ ಬೆಳೆಯಲು ಸಸ್ಯವಿಜ್ಞಾನದ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.'
                : i18n.language === 'hi'
                ? 'दोनों फसलें बिना किसी टकराव के साथ बढ़ सकें, इसके लिए वानस्पतिक नियमों की जांच की गई है।'
                : 'Every crop pair must satisfy botanical and microclimatic rules before layout recommendation.'}
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
                    {getParameterPlainName(chk.parameter)}
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
                    {getStatusLabel(chk.status)}
                  </span>
                </div>

                <p className="text-xs font-semibold text-stone-800 leading-snug">
                  {chk.farmer_message}
                </p>

                <p className="text-[11px] text-stone-500 font-normal italic pt-0.5">
                  {i18n.language === 'kn' ? 'ವೈಜ್ಞಾನಿಕ ಆಧಾರ: ' : i18n.language === 'hi' ? 'वैज्ञानिक आधार: ' : 'Scientific Basis: '}
                  {chk.scientific_detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
