import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EvaluationResponse,
  PlantingLayoutData,
  ResourceEstimationResponse,
  AlternativeSuggestion
} from '../../types';
import { EvidenceBadge } from '../evidence/EvidenceBadge';
import { EvidenceLegend } from '../evidence/EvidenceLegend';
import { PlantingLayoutView } from '../layout-view/PlantingLayoutView';
import { ResourceEstimatorView } from '../resources/ResourceEstimatorView';
import { AgronomicChecksView } from '../explainability/AgronomicChecksView';
import { ExplainabilityView } from '../explainability/ExplainabilityView';
import { UnsupportedHandler } from '../unsupported/UnsupportedHandler';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Map,
  DollarSign,
  ShieldCheck,
  BookmarkCheck,
  Share2,
  TrendingUp,
  Volume2,
  Columns,
  CloudRain,
  Bug,
  Sun,
  Coins,
  FileCheck,
  Printer,
  Sparkles
} from 'lucide-react';
import { speechHelper } from '../../utils/speech';
import { printFarmPlanSummary } from '../../utils/exportLayout';
import { getLocalizedCropName, translateVerdict, translateVerdictSummary } from '../../utils/cropNames';

interface Step5Props {
  evaluation: EvaluationResponse;
  layout: PlantingLayoutData | null;
  resources: ResourceEstimationResponse | null;
  onSelectAlternative: (alt: AlternativeSuggestion) => void;
  onSavePlan: () => void;
  areaAcres: number;
  cropAId: number;
  varietyAId: number;
  cropBId: number;
  varietyBId: number;
  rowRatio: string;
  shapeType?: string;
  photoPreview?: string;
  onGoToCompare?: () => void;
}

export const Step5Results: React.FC<Step5Props> = ({
  evaluation,
  layout: initialLayout,
  resources,
  onSelectAlternative,
  onSavePlan,
  areaAcres,
  cropAId,
  varietyAId,
  cropBId,
  varietyBId,
  rowRatio,
  shapeType = 'Regular',
  photoPreview,
  onGoToCompare
}) => {
  const { t, i18n } = useTranslation();
  const [layout, setLayout] = useState<PlantingLayoutData | null>(initialLayout);
  const [activeTab, setActiveTab] = useState<'report' | 'layout' | 'resources' | 'checks' | 'explain'>('report');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const isKn = i18n.language === 'kn';
  const isHi = i18n.language === 'hi';

  const isUnsupported = evaluation.evidence_level === 'UNSUPPORTED';

  const rawCropAName = evaluation.crop_a_summary.name;
  const rawCropBName = evaluation.crop_b_summary.name;
  const cropAName = getLocalizedCropName(rawCropAName, i18n.language);
  const cropAVar = evaluation.crop_a_summary.variety;
  const cropBName = getLocalizedCropName(rawCropBName, i18n.language);
  const cropBVar = evaluation.crop_b_summary.variety;

  const translatedVerdict = translateVerdict(evaluation.verdict, i18n.language);
  const translatedSummary = translateVerdictSummary(evaluation.verdict_summary, i18n.language);

  const handleReadAloudVerdict = () => {
    let textToRead = '';
    const hasNativeKn = speechHelper.hasNativeVoiceForLang('kn');
    if (isKn && hasNativeKn) {
      textToRead = `ಕೃಷಿ ತೀರ್ಪು: ${translatedVerdict}. ${translatedSummary}. ಭೂಮಿ ದಕ್ಷತೆ ಅಂಕ ${evaluation.ler.toFixed(2)}. ${evaluation.explainability_narrative}`;
    } else if (isKn && !hasNativeKn) {
      textToRead = `Verdict: ${evaluation.verdict}. ${evaluation.verdict_summary}. Land Productivity Score is ${evaluation.ler.toFixed(2)}. Recommended intercrop configuration for ${rawCropAName} and ${rawCropBName}.`;
    } else if (isHi) {
      textToRead = `कृषि निर्णय: ${translatedVerdict}. ${translatedSummary}. भूमि दक्षता स्कोर ${evaluation.ler.toFixed(2)}. ${evaluation.explainability_narrative}`;
    } else {
      textToRead = `Verdict: ${evaluation.verdict}. ${evaluation.verdict_summary}. Land Productivity Score is ${evaluation.ler.toFixed(2)}. ${evaluation.explainability_narrative}`;
    }
    speechHelper.speak(textToRead, i18n.language);
  };

  const handleSave = () => {
    onSavePlan();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* 1. Realistic Profit & Harvest Disclaimer Notice */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 sm:gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-extrabold uppercase tracking-wide block">
            {t('disclaimer.title')}
          </span>
          <p className="text-amber-900 leading-relaxed font-medium">
            {t('disclaimer.text')}
          </p>
        </div>
      </div>

      {/* 2. Leading One-Line Verdict Banner */}
      <div
        className={`p-4 sm:p-6 rounded-3xl border shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          evaluation.verdict === 'Recommended'
            ? 'bg-gradient-to-r from-emerald-50 via-emerald-100/60 to-white border-emerald-300'
            : evaluation.verdict === 'Possible'
            ? 'bg-gradient-to-r from-sky-50 via-sky-100/60 to-white border-sky-300'
            : 'bg-gradient-to-r from-rose-50 via-rose-100/60 to-white border-rose-300'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-xs ${
                evaluation.verdict === 'Recommended'
                  ? 'bg-emerald-600 text-white'
                  : evaluation.verdict === 'Possible'
                  ? 'bg-sky-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {translatedVerdict}
            </span>

            {/* Evidence Badge */}
            <EvidenceBadge
              level={evaluation.evidence_level}
              confidenceInterval={evaluation.ler_ci}
              citationSource={evaluation.citation?.institution}
              size="md"
            />

            <EvidenceLegend />
          </div>

          <h2 className="text-lg sm:text-xl font-black text-stone-900 pt-1">
            {translatedSummary}
          </h2>

          <p className="text-xs text-stone-600 font-medium">
            {isKn ? 'ಮಿಶ್ರ ಬೆಳೆ ಜೋಡಣೆ:' : isHi ? 'संयोजन:' : 'Configuration:'}{' '}
            <b>{cropAName}</b> ({cropAVar}) + <b>{cropBName}</b> ({cropBVar}) — <b>{rowRatio}</b>
          </p>
        </div>

        {/* Read-Aloud Audio Helper, Compare Button & Save Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReadAloudVerdict}
            className="p-2.5 sm:p-3 bg-white hover:bg-stone-50 border border-stone-200 text-emerald-800 rounded-2xl shadow-xs transition flex items-center gap-1.5 text-xs font-bold"
            title="Read aloud verdict in audio"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span className="inline">{t('nav.read_aloud')}</span>
          </button>

          {onGoToCompare && !isUnsupported && (
            <button
              type="button"
              onClick={onGoToCompare}
              className="p-2.5 sm:p-3 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-emerald-800 rounded-2xl shadow-xs transition flex items-center gap-1.5 text-xs font-bold"
              title="Compare with benchmark combinations"
            >
              <Columns className="w-4 h-4 text-emerald-600" />
              <span className="inline">{t('wizard.compare_this_plan')}</span>
            </button>
          )}

          {!isUnsupported && (
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl shadow-sm text-xs font-bold transition flex items-center gap-2"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{isSaved ? (isKn ? 'ಉಳಿಸಲಾಗಿದೆ!' : 'Plan Saved!') : t('results.save_plan')}</span>
            </button>
          )}
        </div>
      </div>

      {/* If Unsupported, Render Unsupported Handler & Alternative Suggestions */}
      {isUnsupported ? (
        <UnsupportedHandler
          reasons={evaluation.unsupported_reasons}
          alternatives={evaluation.alternatives}
          onSelectAlternative={onSelectAlternative}
          cropAName={cropAName}
          cropBName={cropBName}
        />
      ) : (
        /* If Supported, Render Performance Cards, Realistic Risk Matrix, & Tabbed Views */
        <div className="space-y-5">
          {/* 4 Performance Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* LER Card */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block truncate">
                {t('results.ler_metric')}
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1 flex items-baseline gap-1">
                <span>{evaluation.ler.toFixed(2)}</span>
                <span className="text-xs font-semibold text-emerald-600">
                  (+{Math.round((evaluation.ler - 1.0) * 100)}%)
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 leading-tight">
                {t('results.ler_meaning')}
              </p>
            </div>

            {/* Total Yield */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block truncate">
                {isKn ? 'ಒಟ್ಟು ಕೊಯ್ಲು ಇಳುವರಿ' : isHi ? 'कुल फसल उपज' : 'Harvest Yield'}
              </span>
              <div className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                {(evaluation.yield_a_kg_per_acre + evaluation.yield_b_kg_per_acre).toFixed(0)}{' '}
                <span className="text-xs font-semibold text-stone-500">kg/acre</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
                {cropAName}: {evaluation.yield_a_kg_per_acre}kg | {cropBName}: {evaluation.yield_b_kg_per_acre}kg
              </p>
            </div>

            {/* Net Income */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block truncate">
                {t('results.net_return')}
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                ₹{evaluation.net_income_inr.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
                {isKn ? 'ಒಟ್ಟು ಆದಾಯ:' : 'Gross:'} ₹{evaluation.gross_income_inr.toLocaleString()}
              </p>
            </div>

            {/* Overall Biological Risk */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block truncate">
                {t('results.risk_level')}
              </span>
              <div
                className={`text-xl sm:text-2xl font-black mt-1 ${
                  evaluation.risk_score === 'Low'
                    ? 'text-emerald-700'
                    : evaluation.risk_score === 'Moderate'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {evaluation.risk_score === 'Low'
                  ? (isKn ? 'ಕಡಿಮೆ ಅಪಾಯ' : isHi ? 'कम जोखिम' : 'Low Risk')
                  : evaluation.risk_score === 'Moderate'
                  ? (isKn ? 'ಮಧ್ಯಮ ಅಪಾಯ' : isHi ? 'मध्यम जोखिम' : 'Moderate Risk')
                  : (isKn ? 'ಹೆಚ್ಚು ಅಪಾಯ' : isHi ? 'उच्च जोखिम' : 'High Risk')}
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1 truncate" title={evaluation.risk_explanation}>
                {evaluation.risk_explanation}
              </p>
            </div>
          </div>

          {/* Realistic Production Risk Assessment */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="text-sm font-black text-stone-900">{t('risks.title')}</h3>
                <p className="text-[11px] sm:text-xs text-stone-500">{t('risks.subtitle')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <CloudRain className="w-4 h-4 text-sky-600" />
                  <span>{t('risks.drought_title')}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{t('risks.drought_desc')}</p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Bug className="w-4 h-4 text-rose-600" />
                  <span>{t('risks.pest_title')}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{t('risks.pest_desc')}</p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>{t('risks.shading_title')}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{t('risks.shading_desc')}</p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>{t('risks.market_title')}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{t('risks.market_desc')}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Mobile Optimized Scrollable Bar */}
          <div className="flex border-b border-stone-200 gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'report'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{t('report.tab_title')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'layout'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>{t('results.tab_layout')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'resources'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{t('results.tab_resources')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checks')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'checks'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('results.tab_checks')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('explain')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'explain'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('results.tab_explain')}</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="pt-1">
            {/* Farmer One-Page Summary Report */}
            {activeTab === 'report' && (
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      {t('report.title')}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t('report.subtitle')} • {areaAcres} {t('step2.acres_unit')} ({layout?.field_length_m}m × {layout?.field_breadth_m}m)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => printFarmPlanSummary()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t('report.print_btn')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  {/* Step 1: What to sow */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-extrabold uppercase text-stone-800 text-xs block">
                      {t('report.sowing_plan_title')}
                    </span>
                    <p className="text-stone-700 font-semibold leading-relaxed">
                      {isKn ? (
                        <>ಮುಖ್ಯ ಬೆಳೆ <b>{cropAName} ({cropAVar})</b> ಮತ್ತು ಜೋಡಿ ಬೆಳೆ <b>{cropBName} ({cropBVar})</b> ಗಳನ್ನು <b>{rowRatio}</b> ಸಾಲಿನ ಅನುಪಾತದಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ.</>
                      ) : isHi ? (
                        <>मुख्य फसल <b>{cropAName} ({cropAVar})</b> और साथी फसल <b>{cropBName} ({cropBVar})</b> को <b>{rowRatio}</b> कतार अनुपात में बोएं।</>
                      ) : (
                        <>Sow <b>{cropAName} ({cropAVar})</b> and <b>{cropBName} ({cropBVar})</b> in a <b>{rowRatio}</b> arrangement.</>
                      )}
                    </p>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {isKn
                        ? `ಉದಾಹರಣೆಗೆ ${rowRatio} ಅನುಪಾತದಲ್ಲಿ: ${cropAName} ನ ಸಾಲುಗಳು ಮತ್ತು ${cropBName} ನ ಸಾಲುಗಳು. ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ಒಟ್ಟು ${layout?.total_rows || 40} ಸಾಲುಗಳು ಬರುತ್ತವೆ.`
                        : `For example in ${rowRatio} ratio: regular alternating lines of ${cropAName} and ${cropBName}. Total lines in field: ${layout?.total_rows || 40}.`}
                    </p>
                  </div>

                  {/* Step 2: Seed Quantity Needed */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-extrabold uppercase text-stone-800 text-xs block">
                      {t('report.seeds_title')}
                    </span>
                    <div className="space-y-1 font-semibold text-stone-700">
                      <div>• <b>{cropAName}:</b> {resources?.seed_crop_a_kg ? `${resources.seed_crop_a_kg} kg` : '8 kg'} {isKn ? 'ಪ್ರಮಾಣೀಕೃತ ಬೀಜ' : 'certified seeds'}</div>
                      <div>• <b>{cropBName}:</b> {resources?.seed_crop_b_kg ? `${resources.seed_crop_b_kg} kg` : '4 kg'} {isKn ? 'ಪ್ರಮಾಣೀಕೃತ ಬೀಜ' : 'certified seeds'}</div>
                      <div className="text-emerald-800 font-bold mt-1">
                        {isKn ? 'ಒಟ್ಟು ಬೀಜದ ಅಂದಾಜು ವೆಚ್ಚ:' : 'Total seed cost:'} ~₹{resources?.seed_cost_total_inr.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Spacing on ground */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-extrabold uppercase text-stone-800 text-xs block">
                      {t('report.spacing_title')}
                    </span>
                    <div className="space-y-1 font-semibold text-stone-700">
                      <div>• <b>{isKn ? 'ಸಾಲುಗಳ ಅಂತರ:' : 'Line spacing:'}</b> {isKn ? 'ಹೊಲದ ಅಗಲದುದ್ದಕ್ಕೂ ೪೫ ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಸಾಲುಗಳನ್ನು ಮಾಡಿ.' : 'Mark furrows 45 cm apart across the width of your field.'}</div>
                      <div>• <b>{isKn ? 'ಗಿಡಗಳ ಅಂತರ:' : 'Plant spacing:'}</b> {isKn ? 'ಪ್ರತಿ ಸಾಲಿನಲ್ಲಿ ೧೫ ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಬೀಜಗಳನ್ನು ಬಿತ್ತಿ.' : 'Place seeds 15 cm apart along each line.'}</div>
                      <div>• <b>{isKn ? 'ಸಾಲುಗಳ ದಿಕ್ಕು:' : 'Orientation:'}</b> {isKn ? `ಉತ್ತಮ ಸೂರ್ಯನ ಬೆಳಕಿಗಾಗಿ ಸಾಲುಗಳನ್ನು ${layout?.orientation || 'North-South'} ದಿಕ್ಕಿನಲ್ಲಿ ಇರಿಸಿ.` : `Run rows ${layout?.orientation || 'North-South'} for best solar illumination.`}</div>
                    </div>
                  </div>

                  {/* Step 4: Expected harvest & profit */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <span className="font-extrabold uppercase text-emerald-950 text-xs block">
                      {t('report.harvest_title')} &amp; {t('report.profit_title')}
                    </span>
                    <div className="space-y-1 font-semibold text-emerald-950">
                      <div>• <b>{cropAName}:</b> ~{evaluation.yield_a_kg_per_acre} kg {isKn ? 'ಇಳುವರಿ' : 'harvest'}</div>
                      <div>• <b>{cropBName}:</b> ~{evaluation.yield_b_kg_per_acre} kg {isKn ? 'ಇಳುವರಿ' : 'harvest'}</div>
                      <div className="text-emerald-800 font-black text-sm pt-1">
                        {isKn ? 'ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ:' : 'Estimated Net Earnings:'} ~₹{evaluation.net_income_inr.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 5: Golden Rules & Precautions */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                  <span className="font-extrabold uppercase text-amber-950 text-xs block">
                    {t('report.precautions_title')}
                  </span>
                  <ul className="space-y-1.5 text-amber-900 font-medium list-disc pl-5">
                    <li>{t('report.rule1')}</li>
                    <li>{t('report.rule2')}</li>
                    <li>{t('report.rule3')}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'layout' && layout && (
              <PlantingLayoutView
                layout={layout}
                cropAName={cropAName}
                cropBName={cropBName}
                shapeType={shapeType}
                photoPreview={photoPreview}
                onLayoutUpdated={(updated) => setLayout(updated)}
              />
            )}

            {activeTab === 'resources' && resources && (
              <ResourceEstimatorView
                initialResources={resources}
                areaAcres={areaAcres}
                cropAId={cropAId}
                varietyAId={varietyAId}
                cropBId={cropBId}
                varietyBId={varietyBId}
                rowRatio={rowRatio}
                yieldAKg={evaluation.yield_a_kg_per_acre}
                yieldBKg={evaluation.yield_b_kg_per_acre}
              />
            )}

            {activeTab === 'checks' && (
              <AgronomicChecksView evaluation={evaluation} />
            )}

            {activeTab === 'explain' && (
              <ExplainabilityView evaluation={evaluation} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
