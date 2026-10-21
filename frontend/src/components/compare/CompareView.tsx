import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crop, ComparisonItem, EvaluateRequest, SavedPlan } from '../../types';
import { compareConfigurations } from '../../services/api';
import { EvidenceBadge } from '../evidence/EvidenceBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Columns, Plus, Check, RefreshCw, Sparkles, TrendingUp, Bookmark } from 'lucide-react';

interface CompareViewProps {
  crops: Crop[];
  selectedPlansToCompare?: SavedPlan[] | null;
  onClearCustomCompare?: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  crops,
  selectedPlansToCompare,
  onClearCustomCompare
}) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // If custom saved plans are passed, convert them to ComparisonItems
  useEffect(() => {
    if (selectedPlansToCompare && selectedPlansToCompare.length > 0) {
      loadSavedPlansComparison(selectedPlansToCompare);
    } else {
      loadDefaultComparison();
    }
  }, [selectedPlansToCompare, crops]);

  const loadSavedPlansComparison = (plans: SavedPlan[]) => {
    const convertedItems: ComparisonItem[] = plans.map((p, index) => {
      const ev = p.plan_data.evaluation;
      const res = p.plan_data.resources;
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

  const loadDefaultComparison = async () => {
    if (crops.length < 4) return;
    setIsLoading(true);

    const maize = crops.find(c => c.name === 'Maize') || crops[0];
    const pigeonpea = crops.find(c => c.name === 'Pigeonpea') || crops[1];
    const groundnut = crops.find(c => c.name === 'Groundnut') || crops[2];
    const ragi = crops.find(c => c.name.includes('Millet')) || crops[3];
    const cowpea = crops.find(c => c.name === 'Cowpea') || crops[1];
    const sorghum = crops.find(c => c.name.includes('Sorghum')) || crops[0];

    const configs: EvaluateRequest[] = [
      {
        crop_a_id: maize.id,
        variety_a_id: maize.varieties[0]?.id || 1,
        crop_b_id: pigeonpea.id,
        variety_b_id: pigeonpea.varieties[0]?.id || 2,
        row_ratio: '2:1',
        land: { area_acres: 1.0, length_m: 63.6, breadth_m: 63.6, shape: 'Rectangular', orientation: 'North-South', irrigation: 'Rainfed', soil_type: 'Black Clay', soil_ph: 6.8, season: 'Kharif' }
      },
      {
        crop_a_id: groundnut.id,
        variety_a_id: groundnut.varieties[0]?.id || 3,
        crop_b_id: pigeonpea.id,
        variety_b_id: pigeonpea.varieties[0]?.id || 2,
        row_ratio: '3:1',
        land: { area_acres: 1.0, length_m: 63.6, breadth_m: 63.6, shape: 'Rectangular', orientation: 'North-South', irrigation: 'Rainfed', soil_type: 'Red Sandy Loam', soil_ph: 6.5, season: 'Kharif' }
      },
      {
        crop_a_id: ragi.id,
        variety_a_id: ragi.varieties[0]?.id || 4,
        crop_b_id: crops.find(c => c.name.includes('Bean'))?.id || cowpea.id,
        variety_b_id: crops.find(c => c.name.includes('Bean'))?.varieties[0]?.id || cowpea.varieties[0]?.id || 2,
        row_ratio: '4:1',
        land: { area_acres: 1.0, length_m: 63.6, breadth_m: 63.6, shape: 'Rectangular', orientation: 'North-South', irrigation: 'Rainfed', soil_type: 'Red Sandy Loam', soil_ph: 6.8, season: 'Kharif' }
      },
      {
        crop_a_id: sorghum.id,
        variety_a_id: sorghum.varieties[0]?.id || 5,
        crop_b_id: cowpea.id,
        variety_b_id: cowpea.varieties[0]?.id || 6,
        row_ratio: '2:1',
        land: { area_acres: 1.0, length_m: 63.6, breadth_m: 63.6, shape: 'Rectangular', orientation: 'North-South', irrigation: 'Rainfed', soil_type: 'Medium Black Soil', soil_ph: 7.0, season: 'Kharif' }
      }
    ];

    try {
      const res = await compareConfigurations(configs);
      setItems(res);
    } catch (e) {
      console.error('Failed to load comparison:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = items.map((it) => ({
    name: it.title.split('(')[0].trim(),
    LER: it.ler,
    Income_kINR: Math.round(it.estimated_net_income_inr / 1000),
    Yield_100kg: Math.round(it.total_yield_kg / 100),
    Water_100m3: Math.round(it.water_use_m3 / 100)
  }));

  const isCustomPlans = selectedPlansToCompare && selectedPlansToCompare.length > 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Columns className="w-6 h-6 text-emerald-600" />
            {isCustomPlans ? 'Comparing Your Selected Saved Plans' : 'Side-by-Side Intercrop Configuration Comparison'}
          </h2>
          <p className="text-xs text-stone-500">
            Compare Land Equivalent Ratio, net returns, water demand, and biological risk across up to 4 configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCustomPlans && onClearCustomCompare && (
            <button
              type="button"
              onClick={onClearCustomCompare}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
            >
              Reset to Benchmark Pairs
            </button>
          )}

          <button
            type="button"
            onClick={loadDefaultComparison}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Benchmark Pairs</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-stone-400 font-medium text-xs bg-white rounded-2xl border border-stone-200">
          Loading agronomic comparisons across institutional trial datasets...
        </div>
      ) : (
        <>
          {/* Side by Side Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <div
                key={it.config_index}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-stone-400">
                      Option #{it.config_index}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {it.row_ratio}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-stone-900 leading-tight">
                    {it.title}
                  </h3>

                  {/* Evidence Badge */}
                  <div className="pt-1">
                    <EvidenceBadge
                      level={it.evidence_level as any}
                      confidenceInterval={it.evaluation?.ler_ci}
                      size="sm"
                      showDetails={false}
                    />
                  </div>
                </div>

                {/* Key Metrics Stack with Plain Explanations */}
                <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Land Gain (LER):</span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      {it.ler.toFixed(2)} (+{Math.round((it.ler - 1.0) * 100)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Total Yield:</span>
                    <span className="font-bold text-stone-900">{it.total_yield_kg} kg/acre</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Est. Net Profit:</span>
                    <span className="font-bold text-emerald-800">₹{it.estimated_net_income_inr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Water Demand:</span>
                    <span className="font-semibold text-stone-700">{it.water_use_m3} m³</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Labour:</span>
                    <span className="font-semibold text-stone-700">{it.labour_days} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Biological Risk:</span>
                    <span
                      className={`font-black text-[11px] uppercase ${
                        it.risk_score === 'Low' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {it.risk_score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recharts Graphical Comparison */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Agronomic &amp; Economic Benchmark Comparison
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
                  <Bar dataKey="Yield_100kg" fill="#0284c7" name="Yield (x100 kg)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
