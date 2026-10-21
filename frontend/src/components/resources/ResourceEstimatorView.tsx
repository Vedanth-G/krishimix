import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceEstimationResponse, ResourceAssumptions } from '../../types';
import { DollarSign, Droplets, Users, Sprout, Settings, RefreshCw } from 'lucide-react';
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
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<ResourceEstimationResponse>(initialResources);
  const [assumptions, setAssumptions] = useState<ResourceAssumptions>(initialResources.assumptions);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const isKn = i18n.language === 'kn';
  const isHi = i18n.language === 'hi';

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Seeds */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold mb-1">
            <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{t('resources.seeds_needed')}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            {(data.seed_crop_a_kg + data.seed_crop_b_kg).toFixed(1)} <span className="text-xs font-medium text-stone-500">kg</span>
          </div>
          <div className="text-xs text-emerald-700 font-bold mt-1">
            ₹{data.seed_cost_total_inr.toLocaleString()}
          </div>
        </div>

        {/* Fertilizer */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold mb-1">
            <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">{t('resources.fertilizer_title')}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            {(data.fertilizer_n_kg + data.fertilizer_p_kg + data.fertilizer_k_kg).toFixed(0)} <span className="text-xs font-medium text-stone-500">kg</span>
          </div>
          <div className="text-xs text-stone-500 mt-1 truncate">
            N: {data.fertilizer_n_kg}kg | P: {data.fertilizer_p_kg}kg | K: {data.fertilizer_k_kg}kg
          </div>
        </div>

        {/* Irrigation Water */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold mb-1">
            <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate">{t('resources.water_needed')}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            {data.water_total_m3.toLocaleString()} <span className="text-xs font-medium text-stone-500">m³</span>
          </div>
          <div className="text-xs text-sky-700 font-medium mt-1 truncate">
            {isKn ? '~೧೨% ನೀರು ಉಳಿತಾಯ' : isHi ? '~१२% जल बचत' : '~12% saved via soil cover'}
          </div>
        </div>

        {/* Labour Days */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold mb-1">
            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">{t('resources.labour_days')}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            {data.labour_total_days.toFixed(1)} <span className="text-xs font-medium text-stone-500">{isKn ? 'ದಿನಗಳು' : isHi ? 'दिन' : 'days'}</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            ₹{data.labour_cost_total_inr.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Financial Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">{t('resources.net_income')}</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            ₹{data.net_profit_inr.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-200 mt-1">
            {t('resources.gross_revenue')} ₹{data.gross_revenue_inr.toLocaleString()} − {t('resources.total_input_cost')} ₹{data.total_input_cost_inr.toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-center px-4 py-2 bg-white/10 rounded-xl backdrop-blur-xs">
            <div className="text-xs text-emerald-200 font-semibold">{isKn ? 'ಲಾಭ-ವೆಚ್ಚ ಅನುಪಾತ' : isHi ? 'लाभ-लागत अनुपात' : 'Benefit-Cost Ratio'}</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">{data.benefit_cost_ratio} : 1</div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-50 transition"
          >
            <Settings className="w-4 h-4 text-emerald-700" />
            <span>{isEditing ? t('resources.cancel') : t('resources.edit_assumptions')}</span>
          </button>
        </div>
      </div>

      {/* Editable Assumptions Drawer */}
      {isEditing && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-700" />
              {t('resources.assumptions_title')}
            </h4>
            <span className="text-xs text-amber-800 font-medium">
              {isKn ? 'ಬದಲಾವಣೆಗಳು ಈ ಬೆಳೆಗೆ ತಕ್ಷಣ ಅನ್ವಯವಾಗುತ್ತವೆ' : isHi ? 'परिवर्तन तुरंत लागू होंगे' : 'Changes apply immediately to this field plan'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">{t('resources.labour_wage_day')} (₹)</label>
              <input
                type="number"
                value={assumptions.labour_rate_inr_per_day}
                onChange={(e) => setAssumptions({ ...assumptions, labour_rate_inr_per_day: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">{t('resources.fertilizer_per_kg')} (₹)</label>
              <input
                type="number"
                value={assumptions.fertilizer_cost_inr_per_kg}
                onChange={(e) => setAssumptions({ ...assumptions, fertilizer_cost_inr_per_kg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">{isKn ? 'ನೀರಿನ ದರ (₹/m³)' : isHi ? 'जल दर (₹/m³)' : 'Water Cost (₹/m³)'}</label>
              <input
                type="number"
                value={assumptions.water_cost_inr_per_m3}
                onChange={(e) => setAssumptions({ ...assumptions, water_cost_inr_per_m3: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-bold"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleRecalculate}
                disabled={isUpdating}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{t('resources.save_recalculate')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Itemized Cost Breakdown Table */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <h4 className="text-sm font-bold text-stone-900 mb-3">{t('resources.cost_breakdown')}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[500px]">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/50">
                <th className="py-2.5 px-3">{isKn ? 'ವೆಚ್ಚದ ಬಾಬ್ತು' : isHi ? 'व्यय श्रेणी' : 'Expense Category'}</th>
                <th className="py-2.5 px-3">{isKn ? 'ಅಗತ್ಯ ಪ್ರಮಾಣ' : isHi ? 'इनपुट मात्रा' : 'Input Quantity'}</th>
                <th className="py-2.5 px-3">{isKn ? 'ಉಪ-ಮೊತ್ತ (₹)' : isHi ? 'उप-कुल (₹)' : 'Subtotal (₹)'}</th>
                <th className="py-2.5 px-3">{isKn ? 'ವೆಚ್ಚದ ಪಾಲು' : isHi ? 'कुल लागत में हिस्सा' : 'Share of Total Cost'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-3 px-3 font-semibold">{t('resources.seed_cost')}</td>
                <td className="py-3 px-3">{(data.seed_crop_a_kg + data.seed_crop_b_kg).toFixed(1)} kg</td>
                <td className="py-3 px-3 font-bold text-stone-900">₹{data.seed_cost_total_inr.toLocaleString()}</td>
                <td className="py-3 px-3">{((data.seed_cost_total_inr / data.total_input_cost_inr) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold">{t('resources.fertilizer_cost')}</td>
                <td className="py-3 px-3">{(data.fertilizer_n_kg + data.fertilizer_p_kg + data.fertilizer_k_kg).toFixed(0)} kg</td>
                <td className="py-3 px-3 font-bold text-stone-900">₹{data.fertilizer_cost_total_inr.toLocaleString()}</td>
                <td className="py-3 px-3">{((data.fertilizer_cost_total_inr / data.total_input_cost_inr) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold">{t('resources.irrigation_cost')}</td>
                <td className="py-3 px-3">{data.water_total_m3.toLocaleString()} m³</td>
                <td className="py-3 px-3 font-bold text-stone-900">₹{data.water_cost_total_inr.toLocaleString()}</td>
                <td className="py-3 px-3">{((data.water_cost_total_inr / data.total_input_cost_inr) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold">{t('resources.labour_cost')}</td>
                <td className="py-3 px-3">{data.labour_total_days.toFixed(1)} {isKn ? 'ದಿನಗಳು' : isHi ? 'दिन' : 'days'}</td>
                <td className="py-3 px-3 font-bold text-stone-900">₹{data.labour_cost_total_inr.toLocaleString()}</td>
                <td className="py-3 px-3">{((data.labour_cost_total_inr / data.total_input_cost_inr) * 100).toFixed(1)}%</td>
              </tr>
              <tr className="bg-stone-50 font-black text-stone-900">
                <td className="py-3 px-3">{t('resources.total_input_cost')}</td>
                <td className="py-3 px-3">—</td>
                <td className="py-3 px-3 text-emerald-800">₹{data.total_input_cost_inr.toLocaleString()}</td>
                <td className="py-3 px-3">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
