import React, { useState } from 'react';
import { ResourceEstimationResponse, ResourceAssumptions } from '../../types';
import { DollarSign, Droplets, Users, Sprout, Settings, RefreshCw, CheckCircle2 } from 'lucide-react';
import { estimateResources } from '../../services/api';

interface ResourceEstimatorViewProps {
  initialResources: ResourceEstimationResponse;
  areaAcres: number;
  cropAId: number;
  varietyAId: number;
  cropBId: number;
  varietyBId: number;
  rowRatio: string;
  yieldAKg: number;
  yieldBKg: number;
}

export const ResourceEstimatorView: React.FC<ResourceEstimatorViewProps> = ({
  initialResources,
  areaAcres,
  cropAId,
  varietyAId,
  cropBId,
  varietyBId,
  rowRatio,
  yieldAKg,
  yieldBKg
}) => {
  const [data, setData] = useState<ResourceEstimationResponse>(initialResources);
  const [assumptions, setAssumptions] = useState<ResourceAssumptions>(initialResources.assumptions);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleRecalculate = async () => {
    setIsUpdating(true);
    try {
      const updated = await estimateResources({
        area_acres: areaAcres,
        crop_a_id: cropAId,
        variety_a_id: varietyAId,
        crop_b_id: cropBId,
        variety_b_id: varietyBId,
        row_ratio: rowRatio,
        yield_a_kg: yieldAKg,
        yield_b_kg: yieldBKg,
        assumptions
      });
      setData(updated);
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to recalculate resources:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Seeds */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
            <Sprout className="w-4 h-4 text-emerald-600" /> Total Seeds Needed
          </div>
          <div className="text-xl font-bold text-stone-900">
            {(data.seed_crop_a_kg + data.seed_crop_b_kg).toFixed(1)} <span className="text-xs font-medium text-stone-500">kg</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            ₹{data.seed_cost_total_inr.toLocaleString()}
          </div>
        </div>

        {/* Fertilizer */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
            <DollarSign className="w-4 h-4 text-amber-600" /> Fertilizer (N:P:K)
          </div>
          <div className="text-xl font-bold text-stone-900">
            {(data.fertilizer_n_kg + data.fertilizer_p_kg + data.fertilizer_k_kg).toFixed(0)} <span className="text-xs font-medium text-stone-500">kg</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            N: {data.fertilizer_n_kg}kg | P: {data.fertilizer_p_kg}kg | K: {data.fertilizer_k_kg}kg
          </div>
        </div>

        {/* Irrigation Water */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
            <Droplets className="w-4 h-4 text-sky-600" /> Water Requirement
          </div>
          <div className="text-xl font-bold text-stone-900">
            {data.water_total_m3.toLocaleString()} <span className="text-xs font-medium text-stone-500">m³</span>
          </div>
          <div className="text-xs text-sky-700 font-medium mt-1">
            ~12% saved via soil cover
          </div>
        </div>

        {/* Labour Days */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
            <Users className="w-4 h-4 text-indigo-600" /> Total Farm Labour
          </div>
          <div className="text-xl font-bold text-stone-900">
            {data.labour_total_days.toFixed(1)} <span className="text-xs font-medium text-stone-500">days</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            ₹{data.labour_cost_total_inr.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Financial Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">Estimated Net Return</span>
          <div className="text-3xl font-extrabold text-white mt-1">
            ₹{data.net_profit_inr.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-200 mt-1">
            Gross Revenue ₹{data.gross_revenue_inr.toLocaleString()} − Total Input Costs ₹{data.total_input_cost_inr.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-white/10 rounded-xl backdrop-blur-xs">
            <div className="text-xs text-emerald-200">Benefit-Cost Ratio</div>
            <div className="text-2xl font-black text-amber-300">{data.benefit_cost_ratio} : 1</div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-50 transition"
          >
            <Settings className="w-4 h-4 text-emerald-700" />
            <span>{isEditing ? 'Close Assumptions' : 'Customize Costs'}</span>
          </button>
        </div>
      </div>

      {/* Editable Assumptions Drawer / Modal */}
      {isEditing && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-700" />
              Customize Unit Costs & Input Rates
            </h4>
            <span className="text-xs text-amber-800">Changes apply immediately to this field plan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Labour Rate (₹/day)</label>
              <input
                type="number"
                value={assumptions.labour_rate_inr_per_day}
                onChange={(e) => setAssumptions({ ...assumptions, labour_rate_inr_per_day: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Fertilizer Rate (₹/kg)</label>
              <input
                type="number"
                value={assumptions.fertilizer_cost_inr_per_kg}
                onChange={(e) => setAssumptions({ ...assumptions, fertilizer_cost_inr_per_kg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Crop A Seed (₹/kg)</label>
              <input
                type="number"
                value={assumptions.seed_cost_a_inr_per_kg}
                onChange={(e) => setAssumptions({ ...assumptions, seed_cost_a_inr_per_kg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Crop B Seed (₹/kg)</label>
              <input
                type="number"
                value={assumptions.seed_cost_b_inr_per_kg}
                onChange={(e) => setAssumptions({ ...assumptions, seed_cost_b_inr_per_kg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleRecalculate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>Update Calculations</span>
            </button>
          </div>
        </div>
      )}

      {/* Detailed Itemized Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <h4 className="text-sm font-bold text-stone-900 mb-3">Itemized Agricultural Expenditure</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Unit Cost</th>
                <th className="py-2.5 px-3">Total Cost</th>
                <th className="py-2.5 px-3">Agronomic Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {data.breakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-stone-50/70 transition">
                  <td className="py-3 px-3 font-semibold text-emerald-800">{item.category}</td>
                  <td className="py-3 px-3 font-bold text-stone-900">{item.item_name}</td>
                  <td className="py-3 px-3">{item.quantity} {item.unit}</td>
                  <td className="py-3 px-3">₹{item.unit_cost_inr.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-stone-900">₹{item.total_cost_inr.toLocaleString()}</td>
                  <td className="py-3 px-3 text-stone-500 italic">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
