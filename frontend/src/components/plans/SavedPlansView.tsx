import React, { useState, useEffect } from 'react';
import { SavedPlan } from '../../types';
import { fetchSavedPlans } from '../../services/api';
import { Bookmark, Calendar, ArrowRight, Share2, Check, Printer } from 'lucide-react';
import { EvidenceBadge } from '../evidence/EvidenceBadge';
import { printFarmPlanSummary } from '../../utils/exportLayout';

interface SavedPlansViewProps {
  onLoadPlan: (plan: SavedPlan) => void;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({ onLoadPlan }) => {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-600" />
            Saved Farm Planting Plans
          </h2>
          <p className="text-xs text-stone-500">
            Revisit your custom layouts, seed requirements, and economic returns offline.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-stone-400 font-medium text-xs bg-white rounded-2xl border border-stone-200">
          Loading saved farm plans...
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
          <Bookmark className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-700">No saved plans yet</h3>
          <p className="text-xs text-stone-400">
            Create an evaluation in the Farm Planner and click "Save Farm Plan" to store it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => {
            const evalData = p.plan_data?.evaluation;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-stone-700">{p.land_area_acres} Acre(s)</span>
                  </div>

                  <h3 className="text-sm font-black text-stone-900">
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
                        <span className="text-stone-500 block text-[10px]">LER Advantage</span>
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
