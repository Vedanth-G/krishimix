import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Crop,
  EvaluateRequest,
  EvaluationResponse,
  PlantingLayoutData,
  ResourceEstimationResponse,
  AlternativeSuggestion,
  SavedPlan
} from './types';
import { fetchCrops, evaluateIntercrop, generatePlantingLayout, estimateResources, savePlan } from './services/api';
import { Step1LocationSeason } from './components/wizard/Step1LocationSeason';
import { Step2LandDimensions } from './components/wizard/Step2LandDimensions';
import { Step3SoilWater } from './components/wizard/Step3SoilWater';
import { Step4CropSelection } from './components/wizard/Step4CropSelection';
import { Step5Results } from './components/wizard/Step5Results';
import { CompareView } from './components/compare/CompareView';
import { SavedPlansView } from './components/plans/SavedPlansView';
import { AdminView } from './components/admin/AdminView';
import {
  Sprout,
  Compass,
  ArrowRight,
  ArrowLeft,
  Columns,
  Bookmark,
  Database,
  Globe,
  Volume2,
  VolumeX,
  Mic,
  Wifi,
  Sparkles,
  Layers,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { speechHelper } from './utils/speech';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Navigation State: 'wizard' | 'compare' | 'saved' | 'admin'
  const [navTab, setNavTab] = useState<'wizard' | 'compare' | 'saved' | 'admin'>('wizard');

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Crops Data
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState<boolean>(true);

  // Step 1: Location & Season
  const [season, setSeason] = useState<string>('Kharif');
  const [location, setLocation] = useState<string>('Dharwad, Karnataka');
  const [zone, setZone] = useState<string>('Northern Transitional Zone');

  // Step 2: Land Dimensions
  const [areaAcres, setAreaAcres] = useState<number>(1.0);
  const [lengthM, setLengthM] = useState<number>(63.6);
  const [breadthM, setBreadthM] = useState<number>(63.6);
  const [orientation, setOrientation] = useState<string>('North-South');

  // Step 3: Soil & Water
  const [soilType, setSoilType] = useState<string>('Red Sandy Loam');
  const [soilPh, setSoilPh] = useState<number>(6.8);
  const [irrigation, setIrrigation] = useState<string>('Rainfed (Dryland)');

  // Step 4: Crops & Varieties
  const [cropAId, setCropAId] = useState<number>(1);
  const [varietyAId, setVarietyAId] = useState<number>(1);
  const [cropBId, setCropBId] = useState<number>(2);
  const [varietyBId, setVarietyBId] = useState<number>(3);
  const [rowRatio, setRowRatio] = useState<string>('2:1');

  // Step 5: Evaluation Results
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [layout, setLayout] = useState<PlantingLayoutData | null>(null);
  const [resources, setResources] = useState<ResourceEstimationResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Load initial crops
  useEffect(() => {
    async function init() {
      try {
        const data = await fetchCrops();
        setCrops(data);
        if (data.length >= 2) {
          setCropAId(data[0].id);
          if (data[0].varieties.length > 0) setVarietyAId(data[0].varieties[0].id);

          setCropBId(data[1].id);
          if (data[1].varieties.length > 0) setVarietyBId(data[1].varieties[0].id);
        }
      } catch (err) {
        console.error('Failed to load crops:', err);
      } finally {
        setIsLoadingCrops(false);
      }
    }
    init();
  }, []);

  // Language switch handler
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Audio Read Aloud
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      speechHelper.stop();
      setIsSpeaking(false);
    } else {
      let promptText = '';
      if (currentStep === 1) promptText = 'Step 1: Choose season and your field district location.';
      else if (currentStep === 2) promptText = `Step 2: Field is ${areaAcres} acres, length ${lengthM} meters, breadth ${breadthM} meters.`;
      else if (currentStep === 3) promptText = `Step 3: Soil type is ${soilType}, with pH ${soilPh}.`;
      else if (currentStep === 4) promptText = 'Step 4: Select primary and companion crops, and row proportion.';
      else if (currentStep === 5 && evaluation) promptText = `Verdict: ${evaluation.verdict}. ${evaluation.verdict_summary}. Land Equivalent Ratio is ${evaluation.ler}.`;

      setIsSpeaking(true);
      speechHelper.speak(promptText, i18n.language, () => setIsSpeaking(false));
    }
  };

  // Run Evaluation & Layout Generation
  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const evalReq: EvaluateRequest = {
        crop_a_id: cropAId,
        variety_a_id: varietyAId,
        crop_b_id: cropBId,
        variety_b_id: varietyBId,
        row_ratio: rowRatio,
        land: {
          area_acres: areaAcres,
          length_m: lengthM,
          breadth_m: breadthM,
          shape: 'Rectangular',
          orientation,
          irrigation,
          soil_type: soilType,
          soil_ph: soilPh,
          season
        }
      };

      const evalRes = await evaluateIntercrop(evalReq);
      setEvaluation(evalRes);

      // If supported, generate layout and resources
      if (evalRes.evidence_level !== 'UNSUPPORTED') {
        const layoutRes = await generatePlantingLayout({
          field_length_m: lengthM,
          field_breadth_m: breadthM,
          crop_a_name: evalRes.crop_a_summary.name,
          variety_a_name: evalRes.crop_a_summary.variety,
          crop_b_name: evalRes.crop_b_summary.name,
          variety_b_name: evalRes.crop_b_summary.variety,
          row_ratio: rowRatio,
          orientation
        });
        setLayout(layoutRes);

        const resRes = await estimateResources({
          area_acres: areaAcres,
          crop_a_id: cropAId,
          variety_a_id: varietyAId,
          crop_b_id: cropBId,
          variety_b_id: varietyBId,
          row_ratio: rowRatio,
          yield_a_kg: evalRes.yield_a_kg_per_acre,
          yield_b_kg: evalRes.yield_b_kg_per_acre
        });
        setResources(resRes);
      } else {
        setLayout(null);
        setResources(null);
      }

      setCurrentStep(5);
    } catch (e: any) {
      alert(`Evaluation error: ${e.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle switching to a supported alternative from unsupported handler
  const handleSelectAlternative = (alt: AlternativeSuggestion) => {
    const cA = crops.find(c => c.name === alt.crop_a_name);
    const cB = crops.find(c => c.name === alt.crop_b_name);
    if (cA && cB) {
      setCropAId(cA.id);
      const vA = cA.varieties.find(v => v.name === alt.variety_a_name) || cA.varieties[0];
      if (vA) setVarietyAId(vA.id);

      setCropBId(cB.id);
      const vB = cB.varieties.find(v => v.name === alt.variety_b_name) || cB.varieties[0];
      if (vB) setVarietyBId(vB.id);

      setRowRatio(alt.row_ratio);
      setTimeout(() => {
        handleRunEvaluation();
      }, 100);
    }
  };

  // Save current farm plan
  const handleSavePlan = async () => {
    if (!evaluation) return;
    const cropAName = crops.find(c => c.id === cropAId)?.name || 'Crop A';
    const cropBName = crops.find(c => c.id === cropBId)?.name || 'Crop B';

    await savePlan({
      title: `${cropAName} + ${cropBName} (${rowRatio}) - ${areaAcres} Acre(s)`,
      farmer_name: 'Farmer',
      land_area_acres: areaAcres,
      field_length_m: lengthM,
      field_breadth_m: breadthM,
      soil_type: soilType,
      irrigation_source: irrigation,
      season,
      crop_a_id: cropAId,
      variety_a_id: varietyAId,
      crop_b_id: cropBId,
      variety_b_id: varietyBId,
      row_ratio: rowRatio,
      evidence_level: evaluation.evidence_level,
      plan_data: {
        evaluation,
        layout,
        resources,
        land: {
          area_acres: areaAcres,
          length_m: lengthM,
          breadth_m: breadthM,
          orientation,
          soil_type: soilType,
          season
        }
      }
    });
  };

  // Load a saved plan
  const handleLoadPlan = (plan: SavedPlan) => {
    setAreaAcres(plan.land_area_acres);
    setCropAId(plan.crop_a_id);
    if (plan.variety_a_id) setVarietyAId(plan.variety_a_id);
    setCropBId(plan.crop_b_id);
    if (plan.variety_b_id) setVarietyBId(plan.variety_b_id);
    setRowRatio(plan.row_ratio);
    if (plan.plan_data.evaluation) setEvaluation(plan.plan_data.evaluation);
    if (plan.plan_data.layout) setLayout(plan.plan_data.layout);
    if (plan.plan_data.resources) setResources(plan.plan_data.resources);
    setNavTab('wizard');
    setCurrentStep(5);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 font-sans flex flex-col">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => { setNavTab('wizard'); setCurrentStep(1); }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-stone-900">KrishiMix</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium hidden sm:block">
                Agronomy Decision Support &amp; Planting Layouts
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => setNavTab('wizard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                navTab === 'wizard'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t('nav.wizard')}</span>
            </button>

            <button
              type="button"
              onClick={() => setNavTab('compare')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                navTab === 'compare'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{t('nav.compare')}</span>
            </button>

            <button
              type="button"
              onClick={() => setNavTab('saved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                navTab === 'saved'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t('nav.saved')}</span>
            </button>

            <button
              type="button"
              onClick={() => setNavTab('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                navTab === 'admin'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{t('nav.admin')}</span>
            </button>
          </nav>

          {/* Right Action Tools: Language, Audio Read-Aloud, Offline Pill */}
          <div className="flex items-center gap-2">
            {/* Audio Read-Aloud Button */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
                isSpeaking
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read aloud page in audio'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden text-xs font-bold shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1.5 transition ${i18n.language === 'en' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('kn')}
                className={`px-2.5 py-1.5 transition ${i18n.language === 'kn' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                ಕನ್ನಡ
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('hi')}
                className={`px-2.5 py-1.5 transition ${i18n.language === 'hi' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                हिन्दी
              </button>
            </div>

            {/* Offline PWA Pill */}
            <span
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-600 border border-stone-200 rounded-full text-[10px] font-semibold shrink-0"
              title="PWA Offline Storage Active"
            >
              <Wifi className="w-3 h-3 text-emerald-600" />
              <span>{t('app.offline_ready')}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {navTab === 'compare' && <CompareView crops={crops} />}
        {navTab === 'saved' && <SavedPlansView onLoadPlan={handleLoadPlan} />}
        {navTab === 'admin' && <AdminView />}

        {navTab === 'wizard' && (
          <div className="space-y-6">
            {/* 5-Step Progress Bar with Large Touch Indicators */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
                <span>{t('wizard.step', { current: currentStep, total: 5 })}</span>
                <span className="text-emerald-700">
                  {currentStep === 1 && t('wizard.step1_title')}
                  {currentStep === 2 && t('wizard.step2_title')}
                  {currentStep === 3 && t('wizard.step3_title')}
                  {currentStep === 4 && t('wizard.step4_title')}
                  {currentStep === 5 && t('wizard.step5_title')}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>

              {/* 5 Step Step Pills */}
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {[
                  { num: 1, label: t('pills.season') },
                  { num: 2, label: t('pills.land') },
                  { num: 3, label: t('pills.soil_water') },
                  { num: 4, label: t('pills.crops') },
                  { num: 5, label: t('pills.results') }
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => {
                      if (s.num < currentStep || evaluation) setCurrentStep(s.num);
                    }}
                    className={`py-2 px-1 rounded-xl text-center transition text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      currentStep === s.num
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : s.num < currentStep
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-stone-50 text-stone-400'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/10">
                      {s.num}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Wizard Step Component */}
            <div className="py-2">
              {currentStep === 1 && (
                <Step1LocationSeason
                  season={season}
                  setSeason={setSeason}
                  location={location}
                  setLocation={setLocation}
                  zone={zone}
                  setZone={setZone}
                />
              )}

              {currentStep === 2 && (
                <Step2LandDimensions
                  areaAcres={areaAcres}
                  setAreaAcres={setAreaAcres}
                  lengthM={lengthM}
                  setLengthM={setLengthM}
                  breadthM={breadthM}
                  setBreadthM={setBreadthM}
                  orientation={orientation}
                  setOrientation={setOrientation}
                />
              )}

              {currentStep === 3 && (
                <Step3SoilWater
                  soilType={soilType}
                  setSoilType={setSoilType}
                  soilPh={soilPh}
                  setSoilPh={setSoilPh}
                  irrigation={irrigation}
                  setIrrigation={setIrrigation}
                />
              )}

              {currentStep === 4 && (
                <Step4CropSelection
                  crops={crops}
                  selectedCropAId={cropAId}
                  setSelectedCropAId={setCropAId}
                  selectedVarietyAId={varietyAId}
                  setSelectedVarietyAId={setVarietyAId}
                  selectedCropBId={cropBId}
                  setSelectedCropBId={setCropBId}
                  selectedVarietyBId={varietyBId}
                  setSelectedVarietyBId={setVarietyBId}
                  rowRatio={rowRatio}
                  setRowRatio={setRowRatio}
                  season={season}
                  soilType={soilType}
                />
              )}

              {currentStep === 5 && evaluation && (
                <Step5Results
                  evaluation={evaluation}
                  layout={layout}
                  resources={resources}
                  onSelectAlternative={handleSelectAlternative}
                  onSavePlan={handleSavePlan}
                  areaAcres={areaAcres}
                  cropAId={cropAId}
                  varietyAId={varietyAId}
                  cropBId={cropBId}
                  varietyBId={varietyBId}
                  rowRatio={rowRatio}
                />
              )}
            </div>

            {/* Bottom Step Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs hover:bg-stone-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('wizard.back')}</span>
                </button>
              ) : <div />}

              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition"
                >
                  <span>{t('wizard.next')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentStep === 4 && (
                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={handleRunEvaluation}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white text-sm font-black shadow-md transition"
                >
                  <Sparkles className={`w-4 h-4 text-amber-300 ${isEvaluating ? 'animate-spin' : ''}`} />
                  <span>{isEvaluating ? t('wizard.evaluating') : t('wizard.evaluate_now')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-stone-800">KrishiMix</span>
            <span>&copy; 2026 Smallholder Decision Support</span>
          </div>
          <p className="text-[11px] text-stone-400">
            Evidence-Backed Variety Pairing • Dimensioned Planting Layouts • Precision Economics
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
