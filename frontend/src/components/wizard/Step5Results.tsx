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
  Coins
} from 'lucide-react';
import { speechHelper } from '../../utils/speech';

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
  onGoToCompare?: () => void;
}

export const Step5Results: React.FC<Step5Props> = ({
  evaluation,
  layout,
  resources,
  onSelectAlternative,
  onSavePlan,
  areaAcres,
  cropAId,
  varietyAId,
  cropBId,
  varietyBId,
  rowRatio,
  onGoToCompare
}) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'layout' | 'resources' | 'checks' | 'explain'>('layout');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const isUnsupported = evaluation.evidence_level === 'UNSUPPORTED';

  const handleReadAloudVerdict = () => {
    let textToRead = '';
    if (i18n.language === 'kn') {
      textToRead = `ಕೃಷಿ ತೀರ್ಪು: ${evaluation.verdict}. ${evaluation.verdict_summary}. ಭೂಮಿ ಸಮಾನ ಅನುಪಾತ ${evaluation.ler.toFixed(2)}. ${evaluation.explainability_narrative}`;
    } else if (i18n.language === 'hi') {
      textToRead = `कृषि निर्णय: ${evaluation.verdict}. ${evaluation.verdict_summary}. भूमि समतुल्य अनुपात ${evaluation.ler.toFixed(2)}. ${evaluation.explainability_narrative}`;
    } else {
      textToRead = `Verdict: ${evaluation.verdict}. ${evaluation.verdict_summary}. Land Equivalent Ratio is ${evaluation.ler.toFixed(2)}. ${evaluation.explainability_narrative}`;
    }
    speechHelper.speak(textToRead, i18n.language);
  };

  const handleSave = () => {
    onSavePlan();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Realistic Profit & Harvest Disclaimer Notice (Non-Negotiable Reality Notice) */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
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

      {/* 2. Leading One-Line Verdict Banner (Critical UX Requirement) */}
      <div
        className={`p-6 rounded-3xl border shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          evaluation.verdict === 'Recommended'
            ? 'bg-gradient-to-r from-emerald-50 via-emerald-100/60 to-white border-emerald-300'
            : evaluation.verdict === 'Possible'
            ? 'bg-gradient-to-r from-sky-50 via-sky-100/60 to-white border-sky-300'
            : 'bg-gradient-to-r from-rose-50 via-rose-100/60 to-white border-rose-300'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-xs ${
                evaluation.verdict === 'Recommended'
                  ? 'bg-emerald-600 text-white'
                  : evaluation.verdict === 'Possible'
                  ? 'bg-sky-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              Verdict: {evaluation.verdict}
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

          <h2 className="text-xl font-black text-stone-900 pt-1">
            {evaluation.verdict_summary}
          </h2>

          <p className="text-xs text-stone-600 font-medium">
            Configuration: {evaluation.crop_a_summary.name} ({evaluation.crop_a_summary.variety}) +{' '}
            {evaluation.crop_b_summary.name} ({evaluation.crop_b_summary.variety}) in {rowRatio} arrangement.
          </p>
        </div>

        {/* Read-Aloud Audio Helper, Compare Button & Save Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReadAloudVerdict}
            className="p-3 bg-white hover:bg-stone-50 border border-stone-200 text-emerald-800 rounded-2xl shadow-xs transition flex items-center gap-1.5 text-xs font-bold"
            title="Read aloud verdict in audio"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">{t('nav.read_aloud')}</span>
          </button>

          {onGoToCompare && !isUnsupported && (
            <button
              type="button"
              onClick={onGoToCompare}
              className="p-3 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-emerald-800 rounded-2xl shadow-xs transition flex items-center gap-1.5 text-xs font-bold"
              title="Compare with benchmark combinations"
            >
              <Columns className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{t('wizard.compare_this_plan')}</span>
            </button>
          )}

          {!isUnsupported && (
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl shadow-sm text-xs font-bold transition flex items-center gap-2"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{isSaved ? 'Plan Saved!' : t('results.save_plan')}</span>
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
        />
      ) : (
        /* If Supported, Render Performance Cards, Honest Risk Matrix, & Tabbed Views */
        <div className="space-y-6">
          {/* 4 Performance Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* LER Card */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                {t('results.ler_metric')}
              </span>
              <div className="text-2xl font-black text-emerald-800 mt-1 flex items-baseline gap-1">
                <span>{evaluation.ler.toFixed(2)}</span>
                <span className="text-xs font-semibold text-emerald-600">
                  (+{Math.round((evaluation.ler - 1.0) * 100)}% land gain)
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {t('results.ler_meaning')}
              </p>
            </div>

            {/* Total Yield */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                Harvest Yield
              </span>
              <div className="text-2xl font-black text-stone-900 mt-1">
                {(evaluation.yield_a_kg_per_acre + evaluation.yield_b_kg_per_acre).toFixed(0)}{' '}
                <span className="text-xs font-semibold text-stone-500">kg/acre</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {evaluation.crop_a_summary.name}: {evaluation.yield_a_kg_per_acre}kg | {evaluation.crop_b_summary.name}: {evaluation.yield_b_kg_per_acre}kg
              </p>
            </div>

            {/* Net Income */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                {t('results.net_return')}
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                ₹{evaluation.net_income_inr.toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Gross: ₹{evaluation.gross_income_inr.toLocaleString()}
              </p>
            </div>

            {/* Overall Biological Risk */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                {t('results.risk_level')}
              </span>
              <div
                className={`text-2xl font-black mt-1 ${
                  evaluation.risk_score === 'Low'
                    ? 'text-emerald-700'
                    : evaluation.risk_score === 'Moderate'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {evaluation.risk_score}
              </div>
              <p className="text-[11px] text-stone-400 mt-1 truncate" title={evaluation.risk_explanation}>
                {evaluation.risk_explanation}
              </p>
            </div>
          </div>

          {/* Real-World Risk Assessment (Un-Sugarcoated) */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="text-sm font-black text-stone-900">{t('risks.title')}</h3>
                <p className="text-xs text-stone-500">{t('risks.subtitle')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <CloudRain className="w-4 h-4 text-sky-600" />
                  <span>{t('risks.drought_title')}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{t('risks.drought_desc')}</p>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Bug className="w-4 h-4 text-rose-600" />
                  <span>{t('risks.pest_title')}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{t('risks.pest_desc')}</p>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>{t('risks.shading_title')}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{t('risks.shading_desc')}</p>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>{t('risks.market_title')}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{t('risks.market_desc')}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-200 gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition shrink-0 ${
                activeTab === 'layout'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>{t('results.tab_layout')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition shrink-0 ${
                activeTab === 'resources'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{t('results.tab_resources')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checks')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition shrink-0 ${
                activeTab === 'checks'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('results.tab_checks')} ({evaluation.checks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('explain')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition shrink-0 ${
                activeTab === 'explain'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('results.tab_explain')}</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="pt-2">
            {activeTab === 'layout' && layout && (
              <PlantingLayoutView
                layout={layout}
                cropAName={evaluation.crop_a_summary.name}
                cropBName={evaluation.crop_b_summary.name}
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
