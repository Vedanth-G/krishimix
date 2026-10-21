import React, { useState, useEffect } from 'react';
import { TrialRecord } from '../../types';
import { fetchAdminTrials, uploadTrialsCsv, retrainModel, fetchModelMetrics } from '../../services/api';
import { Upload, RefreshCw, CheckCircle2, AlertTriangle, Database, Cpu, Layers } from 'lucide-react';

export const AdminView: React.FC = () => {
  const [trials, setTrials] = useState<TrialRecord[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tData, mData] = await Promise.all([fetchAdminTrials(), fetchModelMetrics()]);
      setTrials(tData);
      setMetrics(mData);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const result = await uploadTrialsCsv(file);
      setUploadResult(result);
      loadData();
    } catch (err: any) {
      setUploadResult({ status: 'Error', errors: [err.message || 'Upload failed'] });
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const res = await retrainModel();
      setMetrics(res.metrics);
      setUploadResult({ status: 'Model retrained successfully with current trial records!' });
    } catch (err: any) {
      alert(`Retraining failed: ${err.message}`);
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            Agronomic Trial Data &amp; ML Model Governance
          </h2>
          <p className="text-xs text-stone-500">
            Audit empirical research trials, upload verified university CSV datasets, and inspect ML regressor metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRetrain}
          disabled={isRetraining}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Retraining Regressor...' : 'Retrain ML Model'}</span>
        </button>
      </div>

      {/* Model Metrics & Governance Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
              <Cpu className="w-4 h-4 text-emerald-600" /> Model Architecture
            </div>
            <div className="text-sm font-bold text-stone-900 truncate" title={metrics.model_type}>
              Random Forest Regressor
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              100 estimators | depth 6
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> R² Goodness-of-Fit
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {metrics.r2_score}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Cross-validated coefficient</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
              <Layers className="w-4 h-4 text-sky-600" /> Mean Absolute Error
            </div>
            <div className="text-2xl font-black text-sky-700">
              ±{metrics.mae} LER
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Average deviation on test fold</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
              <Database className="w-4 h-4 text-amber-600" /> Trial Ingestion Count
            </div>
            <div className="text-2xl font-black text-amber-800">
              {metrics.training_samples || trials.length} <span className="text-xs font-normal text-stone-500">records</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Verified trial observations</div>
          </div>
        </div>
      )}

      {/* CSV Ingestion Portal */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-600" />
          Ingest Institutional Field Trial CSV
        </h3>
        <p className="text-xs text-stone-500">
          Upload verified multi-year trial results from ICAR, State Agricultural Universities, or KVKs. Must include yields, solo baselines, and citation sources.
        </p>

        <div className="p-6 border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50 text-center space-y-2 hover:border-emerald-500 transition">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            id="csv-upload"
            className="hidden"
          />
          <label htmlFor="csv-upload" className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-300 rounded-xl font-bold text-xs text-stone-800 shadow-xs hover:bg-stone-50">
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Choose Research CSV File</span>
          </label>
          <div className="text-[11px] text-stone-400">
            Required headers: crop_a_name, variety_a_name, crop_b_name, variety_b_name, row_ratio, yield_a_kg_ha, solo_yield_a_kg_ha, source, year, location
          </div>
        </div>

        {/* Upload feedback */}
        {uploadResult && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
            <div className="font-bold text-emerald-800">{uploadResult.status}</div>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="space-y-1 text-rose-700">
                <div className="font-semibold">Validation Warnings:</div>
                {uploadResult.errors.map((e: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trial Records Table */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">
            Cataloged Empirical Trial Records ({trials.length})
          </h3>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
            Labelled SAMPLE Data
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50 sticky top-0">
                <th className="py-2.5 px-3">Crop Combination</th>
                <th className="py-2.5 px-3">Ratio</th>
                <th className="py-2.5 px-3">Yield A (kg/ha)</th>
                <th className="py-2.5 px-3">Yield B (kg/ha)</th>
                <th className="py-2.5 px-3">LER</th>
                <th className="py-2.5 px-3">Location &amp; Year</th>
                <th className="py-2.5 px-3">Source Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {trials.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/70 transition">
                  <td className="py-3 px-3 font-bold text-stone-900">
                    {t.crop_a_name} ({t.variety_a_name}) + {t.crop_b_name} ({t.variety_b_name})
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-800">{t.row_ratio}</td>
                  <td className="py-3 px-3">{t.yield_a_kg_ha.toLocaleString()}</td>
                  <td className="py-3 px-3">{t.yield_b_kg_ha.toLocaleString()}</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-700">{t.ler.toFixed(2)}</td>
                  <td className="py-3 px-3">{t.location} ({t.year})</td>
                  <td className="py-3 px-3 text-stone-500 italic max-w-xs truncate" title={t.source}>
                    {t.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
