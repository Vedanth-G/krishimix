import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crop, ComparisonItem, EvaluateRequest, SavedPlan } from '../../types';
import { compareConfigurations, fetchSavedPlans } from '../../services/api';
import { EvidenceBadge } from '../evidence/EvidenceBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Columns, Plus, Check, RefreshCw, Sparkles, TrendingUp, Bookmark, AlertTriangle, ShieldAlert } from 'lucide-react';

interface CompareViewProps {
  crops: Crop[];
  selectedPlansToCompare?: SavedPlan[] | null;
  currentPlanToCompare?: SavedPlan | null;
  onClearCustomCompare?: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  crops,
  selectedPlansToCompare,
  currentPlanToCompare,
  onClearCustomCompare
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'saved' | 'current'>(
    selectedPlansToCompare && selectedPlansToCompare.length > 0 ? 'saved' : 'benchmarks'
  );
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Pre-load benchmark configurations
  useEffect(() => {
    if (activeTab === 'benchmarks') {
      loadDefaultComparison();
    } else if (activeTab === 'saved') {
      loadSavedPlans();
    } else if (activeTab === 'current' && currentPlanToCompare) {
      loadCurrentVsBenchmark(currentPlanToCompare);
    }
  }, [activeTab, crops, selectedPlansToCompare, currentPlanToCompare]);

  const loadSavedPlans = async () => {
    if (selectedPlansToCompare && selectedPlansToCompare.length > 0) {
      convertSavedPlansToItems(selectedPlansToCompare);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchSavedPlans();
      setSavedPlans(data);
      if (data.length > 0) {
        convertSavedPlansToItems(data.slice(0, 4));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error('Failed to load saved plans:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const convertSavedPlansToItems = (plans: SavedPlan[]) => {
    const convertedItems: ComparisonItem[] = plans.map((p, index) => {
      const ev = p.plan_data.evaluation;
      return {
        config_index: index + 1,
        title: p.title,
        row_ratio: p.row_ratio,
        evidence_level: p.evidence_level,
        verdict: ev?.verdict || 'Recommended',
        ler: ev?.ler || 1.0,
        total_yield_kg: (ev?.yield_a_kg_per_acre || 0) + (ev?.yield_b_kg_per_acre || 0),
        estimated_gross_income_inr: ev?.gross_income_inr || 0,
        estimated_net_income_inr: ev?.net_income_inr || 0,
        water_use_m3: ev?.water_use_m3 || 500,
        labour_days: ev?.labour_person_days || 25,
        risk_score: ev?.risk_score || 'Low',
        evaluation: ev || ({} as any)
      };
    });
    setItems(convertedItems);
  };

  const loadCurrentVsBenchmark = (curr: SavedPlan) => {
    const currentItem: ComparisonItem = {
      config_index: 1,
      title: `${curr.title} (Your Plan)`,
      row_ratio: curr.row_ratio,
      evidence_level: curr.evidence_level,
      verdict: curr.plan_data.evaluation?.verdict || 'Recommended',
      ler: curr.plan_data.evaluation?.ler || 1.25,
      total_yield_kg: (curr.plan_data.evaluation?.yield_a_kg_per_acre || 0) + (curr.plan_data.evaluation?.yield_b_kg_per_acre || 0),
      estimated_gross_income_inr: curr.plan_data.evaluation?.gross_income_inr || 0,
      estimated_net_income_inr: curr.plan_data.evaluation?.net_income_inr || 0,
      water_use_m3: curr.plan_data.evaluation?.water_use_m3 || 520,
      labour_days: curr.plan_data.evaluation?.labour_person_days || 26,
      risk_score: curr.plan_data.evaluation?.risk_score || 'Low',
      evaluation: curr.plan_data.evaluation || ({} as any)
    };

    // Benchmark item for comparison
    const benchmarkItem: ComparisonItem = {
      config_index: 2,
      title: 'Maize + Pigeonpea (ICAR Benchmark)',
      row_ratio: '2:1',
      evidence_level: 'OBSERVED',
      verdict: 'Recommended',
      ler: 1.34,
      total_yield_kg: 2280,
      estimated_gross_income_inr: 68400,
      estimated_net_income_inr: 44200,
      water_use_m3: 540,
      labour_days: 28,
      risk_score: 'Low',
      evaluation: {
        ler_ci: { low: 1.28, high: 1.40, level: 0.95 }
      } as any
    };

    // High risk benchmark item
    const highRiskItem: ComparisonItem = {
      config_index: 3,
      title: 'Sorghum + Maize (High Risk Example)',
      row_ratio: '1:1',
      evidence_level: 'UNSUPPORTED',
      verdict: 'Not supported',
      ler: 0.92,
      total_yield_kg: 1650,
      estimated_gross_income_inr: 39600,
      estimated_net_income_inr: 14200,
      water_use_m3: 690,
      labour_days: 30,
      risk_score: 'High',
      evaluation: {} as any
    };

    setItems([currentItem, benchmarkItem, highRiskItem]);
  };

  const loadDefaultComparison = async () => {
    setIsLoading(true);

    const defaultItems: ComparisonItem[] = [
      {
        config_index: 1,
        title: 'Maize (Deccan-103) + Pigeonpea (ICPL-87119)',
        row_ratio: '2:1',
        evidence_level: 'OBSERVED',
        verdict: 'Recommended',
        ler: 1.34,
        total_yield_kg: 2280,
        estimated_gross_income_inr: 68400,
        estimated_net_income_inr: 44200,
        water_use_m3: 540,
        labour_days: 28,
        risk_score: 'Low',
        evaluation: {
          ler_ci: { low: 1.28, high: 1.40, level: 0.95 }
        } as any
      },
      {
        config_index: 2,
        title: 'Groundnut (TMV-2) + Pigeonpea (Maruti)',
        row_ratio: '3:1',
        evidence_level: 'OBSERVED',
        verdict: 'Recommended',
        ler: 1.28,
        total_yield_kg: 1840,
        estimated_gross_income_inr: 73600,
        estimated_net_income_inr: 47900,
        water_use_m3: 490,
        labour_days: 34,
        risk_score: 'Low',
        evaluation: {
          ler_ci: { low: 1.22, high: 1.34, level: 0.95 }
        } as any
      },
      {
        config_index: 3,
        title: 'Finger Millet (GPU-28) + Field Bean (HA-4)',
        row_ratio: '4:1',
        evidence_level: 'OBSERVED',
        verdict: 'Recommended',
        ler: 1.25,
        total_yield_kg: 1980,
        estimated_gross_income_inr: 61380,
        estimated_net_income_inr: 39500,
        water_use_m3: 460,
        labour_days: 31,
        risk_score: 'Low',
        evaluation: {
          ler_ci: { low: 1.18, high: 1.32, level: 0.95 }
        } as any
      },
      // Non-negotiable High Risk Example (User Request 3)
      {
        config_index: 4,
        title: 'Sorghum (M35-1) + Maize (Deccan-103) — Incompatible',
        row_ratio: '1:1',
        evidence_level: 'UNSUPPORTED',
        verdict: 'Not supported',
        ler: 0.92,
        total_yield_kg: 1650,
        estimated_gross_income_inr: 39600,
        estimated_net_income_inr: 14200,
        water_use_m3: 690,
        labour_days: 30,
        risk_score: 'High',
        evaluation: {
          risk_explanation: 'Direct sunlight shading and severe root moisture competition between two tall cereal crops.'
        } as any
      }
    ];

    setItems(defaultItems);
    setIsLoading(false);
  };

  const chartData = items.map((it) => ({
    name: it.title.split('+')[0].trim().substring(0, 14),
    LER: it.ler,
    Income_kINR: Math.round(it.estimated_net_income_inr / 1000),
    Yield_100kg: Math.round(it.total_yield_kg / 100),
    Water_100m3: Math.round(it.water_use_m3 / 100)
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Mode Selector (User Request 7) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Columns className="w-6 h-6 text-emerald-600" />
            {t('compare.title')}
          </h2>
          <p className="text-xs text-stone-500">
            {t('compare.subtitle')}
          </p>
        </div>

        {/* Comparison Source Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'benchmarks'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('compare.tab_benchmarks')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'saved'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('compare.tab_saved')}
          </button>

          {currentPlanToCompare && (
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'current'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('compare.tab_current')}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-stone-400 font-medium text-xs bg-white rounded-2xl border border-stone-200">
          Loading agronomic comparisons across institutional trial datasets...
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
          <Bookmark className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-700">No saved plans to compare</h3>
          <p className="text-xs text-stone-400">
            Create an evaluation in the Farm Planner, click "Save Farm Plan", then select them to compare.
          </p>
        </div>
      ) : (
        <>
          {/* Side by Side 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((it) => {
              const isHighRisk = it.risk_score === 'High' || it.evidence_level === 'UNSUPPORTED';

              return (
                <div
                  key={it.config_index}
                  className={`rounded-2xl p-5 border shadow-xs flex flex-col justify-between space-y-4 transition ${
                    isHighRisk
                      ? 'bg-rose-50/40 border-rose-300 ring-2 ring-rose-400/20'
                      : 'bg-white border-stone-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-stone-400">
                        Option #{it.config_index}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isHighRisk
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {it.row_ratio}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-stone-900 leading-tight">
                      {it.title}
                    </h3>

                    {/* Evidence or High Risk Warning Badge */}
                    <div className="pt-1">
                      {isHighRisk ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">
                          <ShieldAlert className="w-3 h-3" />
                          <span>{t('compare.high_risk_badge')}</span>
                        </span>
                      ) : (
                        <EvidenceBadge
                          level={it.evidence_level as any}
                          confidenceInterval={it.evaluation?.ler_ci}
                          size="sm"
                          showDetails={false}
                        />
                      )}
                    </div>
                  </div>

                  {/* High Risk Note */}
                  {isHighRisk && (
                    <div className="p-2.5 bg-rose-100/70 rounded-xl text-[11px] text-rose-900 border border-rose-200">
                      {t('compare.high_risk_note')}
                    </div>
                  )}

                  {/* Key Metrics Stack with Plain Explanations */}
                  <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">{t('compare.land_gain')}:</span>
                      <span
                        className={`font-black text-sm ${
                          it.ler >= 1.0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {it.ler.toFixed(2)}{' '}
                        <span className="text-[10px]">
                          ({it.ler >= 1.0 ? `+${Math.round((it.ler - 1.0) * 100)}%` : `${Math.round((it.ler - 1.0) * 100)}%`})
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">{t('compare.total_yield')}:</span>
                      <span className="font-bold text-stone-900">{it.total_yield_kg} kg/acre</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">{t('compare.net_profit')}:</span>
                      <span
                        className={`font-bold ${
                          isHighRisk ? 'text-stone-700' : 'text-emerald-800'
                        }`}
                      >
                        ₹{it.estimated_net_income_inr.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">{t('compare.water_demand')}:</span>
                      <span className="font-semibold text-stone-700">{it.water_use_m3} m³</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">{t('compare.labour')}:</span>
                      <span className="font-semibold text-stone-700">{it.labour_days} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">{t('compare.risk')}:</span>
                      <span
                        className={`font-black text-[11px] uppercase ${
                          it.risk_score === 'Low'
                            ? 'text-emerald-700'
                            : it.risk_score === 'Moderate'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {it.risk_score}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recharts Graphical Comparison */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {t('compare.chart_title')}
            </h3>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e7e5e4' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="LER" fill="#15803d" name="Land Score (LER)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Income_kINR" fill="#d97706" name="Net Profit (Thousand ₹)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Yield_100kg" fill="#0284c7" name="Harvest Yield (x100 kg)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
