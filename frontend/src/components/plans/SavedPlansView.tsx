import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SavedPlan } from '../../types';
import { fetchSavedPlans } from '../../services/api';
import { Bookmark, Calendar, ArrowRight, Share2, Check, Printer, Columns, CheckSquare, Square } from 'lucide-react';
import { EvidenceBadge } from '../evidence/EvidenceBadge';
import { printFarmPlanSummary } from '../../utils/exportLayout';

interface SavedPlansViewProps {
  onLoadPlan: (plan: SavedPlan) => void;
  onComparePlans?: (plans: SavedPlan[]) => void;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({ onLoadPlan, onComparePlans }) => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSavedPlans();
      setPlans(data);
    } catch (e) {
      console.error('Failed to load plans:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyShareLink = (id: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/#plan-${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleSelectPlan = (id: number) => {
    setSelectedPlanIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= 4) {
          alert('You can select a maximum of 4 plans to compare simultaneously.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleCompareClick = () => {
    if (!onComparePlans) return;
    const selected = plans.filter(p => selectedPlanIds.includes(p.id));
    onComparePlans(selected);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-600" />
            {t('saved_plans.title')}
          </h2>
          <p className="text-xs text-stone-500">
            {t('saved_plans.desc')}
          </p>
        </div>

        {/* Multi-Select Compare Action Bar */}
        {selectedPlanIds.length >= 2 && onComparePlans && (
          <button
            type="button"
            onClick={handleCompareClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black shadow-md transition animate-bounce-short"
          >
            <Columns className="w-4 h-4" />
            <span>{t('saved_plans.compare_selected', { count: selectedPlanIds.length })}</span>
          </button>
        )}
      </div>

      {plans.length > 1 && (
        <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-600 flex items-center justify-between">
          <span>{t('saved_plans.select_to_compare')}</span>
          <span className="font-bold text-emerald-800">{selectedPlanIds.length} / 4 Selected</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-stone-400 font-medium text-xs bg-white rounded-2xl border border-stone-200">
          Loading saved farm plans...
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
          <Bookmark className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-700">{t('saved_plans.empty_title')}</h3>
          <p className="text-xs text-stone-400">
            {t('saved_plans.empty_desc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => {
            const evalData = p.plan_data?.evaluation;
            const isSelected = selectedPlanIds.includes(p.id);

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between space-y-4 transition ${
                  isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-stone-200 hover:border-emerald-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <button
                      type="button"
                      onClick={() => toggleSelectPlan(p.id)}
                      className="flex items-center gap-1.5 font-bold text-stone-700 hover:text-emerald-700"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                      <span>Compare</span>
                    </button>

                    <span className="font-bold text-stone-700">{p.land_area_acres} Acre(s)</span>
                  </div>

                  <h3 className="text-sm font-black text-stone-900 leading-tight">
                    {p.title}
                  </h3>

                  <div className="pt-1">
                    <EvidenceBadge
                      level={p.evidence_level as any}
                      size="sm"
                      showDetails={false}
                    />
                  </div>

                  {evalData && (
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Land Score (LER)</span>
                        <span className="font-extrabold text-emerald-800">{evalData.ler?.toFixed(2) || '1.00'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Net Income</span>
                        <span className="font-extrabold text-stone-900">₹{evalData.net_income_inr?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => onLoadPlan(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <span>View Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyShareLink(p.id)}
                    className="p-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl transition"
                    title="Share summary link"
                  >
                    {copiedId === p.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => printFarmPlanSummary()}
                    className="p-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl transition"
                    title="Print summary"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
