import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrialRecord } from '../../types';
import { fetchAdminTrials, uploadTrialsCsv, retrainModel, fetchModelMetrics } from '../../services/api';
import { Upload, RefreshCw, CheckCircle2, AlertTriangle, Database, Cpu, Layers } from 'lucide-react';

export const AdminView: React.FC = () => {
  const { t } = useTranslation();
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
            {t('admin.title')}
          </h2>
          <p className="text-xs text-stone-500">
            {t('admin.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRetrain}
          disabled={isRetraining}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? t('admin.retraining') : t('admin.retrain_btn')}</span>
        </button>
      </div>

      {/* Model Metrics & Governance Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
              <Cpu className="w-4 h-4 text-emerald-600" /> {t('admin.model_architecture')}
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t('admin.r2_score')}
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {metrics.r2_score}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Prediction accuracy across trials
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
              <Layers className="w-4 h-4 text-sky-600" /> {t('admin.mae_score')}
            </div>
            <div className="text-2xl font-black text-stone-900">
              {metrics.mae}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Mean absolute deviation
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
              <Database className="w-4 h-4 text-amber-600" /> {t('admin.total_trials')}
            </div>
            <div className="text-2xl font-black text-amber-700">
              {metrics.total_training_samples}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              University station trials
            </div>
          </div>
        </div>
      )}

      {/* Upload CSV Section */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-600" />
          {t('admin.upload_title')}
        </h3>
        <p className="text-xs text-stone-500">
          {t('admin.upload_hint')}
        </p>

        <div className="p-6 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 text-center space-y-3">
          <Upload className="w-8 h-8 text-stone-400 mx-auto" />
          <div>
            <label className="cursor-pointer">
              <span className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline">
                Select CSV file from computer
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-stone-400 mt-1">
              Required headers: crop_a, variety_a, crop_b, variety_b, row_ratio, yield_a, yield_b, institution, year, location
            </p>
          </div>
        </div>

        {uploadResult && (
          <div className={`p-4 rounded-xl border text-xs ${
            uploadResult.errors && uploadResult.errors.length > 0
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="font-bold">{uploadResult.status}</div>
            {uploadResult.records_ingested && (
              <p className="mt-1">Ingested {uploadResult.records_ingested} records.</p>
            )}
            {uploadResult.errors && (
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                {uploadResult.errors.map((err: string, idx: number) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Trial Database Table */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">
            {t('admin.trials_table_title')}
          </h3>
          <span className="text-xs text-stone-500 font-semibold">{trials.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/50">
                <th className="py-2.5 px-3">{t('admin.col_id')}</th>
                <th className="py-2.5 px-3">{t('admin.col_crop_a')}</th>
                <th className="py-2.5 px-3">{t('admin.col_crop_b')}</th>
                <th className="py-2.5 px-3">{t('admin.col_ratio')}</th>
                <th className="py-2.5 px-3">{t('admin.col_yield_a')}</th>
                <th className="py-2.5 px-3">{t('admin.col_yield_b')}</th>
                <th className="py-2.5 px-3">{t('admin.col_ler')}</th>
                <th className="py-2.5 px-3">{t('admin.col_source')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">Loading trial records...</td>
                </tr>
              ) : trials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">No trial records in database.</td>
                </tr>
              ) : (
                trials.slice(0, 20).map((tRecord) => (
                  <tr key={tRecord.id} className="hover:bg-stone-50 transition">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-400">#{tRecord.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{tRecord.crop_a_name} ({tRecord.variety_a_name})</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{tRecord.crop_b_name} ({tRecord.variety_b_name})</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-800">{tRecord.row_ratio}</td>
                    <td className="py-2.5 px-3">{tRecord.yield_a_kg_ha} kg/ha</td>
                    <td className="py-2.5 px-3">{tRecord.yield_b_kg_ha} kg/ha</td>
                    <td className="py-2.5 px-3 font-black text-emerald-700">{tRecord.ler.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-stone-500 truncate max-w-44" title={tRecord.source}>
                      {tRecord.institution} ({tRecord.year})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
