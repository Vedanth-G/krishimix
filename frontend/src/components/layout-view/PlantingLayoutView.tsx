import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlantingLayoutData } from '../../types';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
  FileText,
  Check,
  AlertCircle,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { downloadSvgAsFile, downloadSvgAsPng, printFarmPlanSummary } from '../../utils/exportLayout';
import { speechHelper, buildRuralLayoutScript } from '../../utils/speech';

interface PlantingLayoutViewProps {
  layout: PlantingLayoutData;
  cropAName: string;
  cropBName: string;
  shapeType?: string;
  photoPreview?: string;
}

export const PlantingLayoutView: React.FC<PlantingLayoutViewProps> = ({
  layout,
  cropAName,
  cropBName,
  shapeType = 'Regular',
  photoPreview
}) => {
  const { t, i18n } = useTranslation();
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showPhotoOverlay, setShowPhotoOverlay] = useState<boolean>(false);
  const [isSpeakingGuide, setIsSpeakingGuide] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      speechHelper.stop();
    };
  }, []);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.0, prev + 0.15));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.6, prev - 0.15));
  const handleResetZoom = () => setZoomLevel(1.0);

  // Audio Guide Trigger: Rural Authentic Advisory
  const handleToggleVoiceGuide = () => {
    if (isSpeakingGuide) {
      speechHelper.stop();
      setIsSpeakingGuide(false);
    } else {
      const dimA = layout.dimension_table.find(d => d.crop_key === 'A');
      const dimB = layout.dimension_table.find(d => d.crop_key === 'B');

      const plantedRows = layout.rows.filter(r => r.crop_key === 'A' || r.crop_key === 'B');
      const firstRowLen = plantedRows.length > 0 ? plantedRows[0].length_m : (layout.min_row_length_m || 50);
      const lastRowLen = plantedRows.length > 0 ? plantedRows[plantedRows.length - 1].length_m : (layout.max_row_length_m || 50);

      const ratio = dimA && dimB ? `${dimA.total_rows > dimB.total_rows ? Math.round(dimA.total_rows / Math.max(dimB.total_rows, 1)) : 1}:${dimB.total_rows > dimA.total_rows ? Math.round(dimB.total_rows / Math.max(dimA.total_rows, 1)) : 1}` : '2:1';

      const script = buildRuralLayoutScript({
        cerealName: cropAName,
        legumeName: cropBName,
        ratio,
        spacingACm: dimA ? dimA.row_spacing_m * 100 : 45,
        spacingBCm: dimB ? dimB.row_spacing_m * 100 : 45,
        firstRowLengthM: firstRowLen,
        lastRowLengthM: lastRowLen,
        totalRows: layout.total_rows,
        lang: i18n.language
      });

      setIsSpeakingGuide(true);
      speechHelper.speak(script, i18n.language, () => {
        setIsSpeakingGuide(false);
      });
    }
  };

  const shapeLabel =
    shapeType === 'Trapezoid'
      ? t('step2.shape_trapezoid')
      : shapeType === 'Contour'
      ? t('step2.shape_contour')
      : shapeType === 'Custom Boundary'
      ? t('step2.shape_custom')
      : t('step2.shape_regular');

  const plantedRows = layout.rows.filter(r => r.crop_key === 'A' || r.crop_key === 'B');
  const hasVaryingLengths = layout.min_row_length_m && layout.max_row_length_m && layout.min_row_length_m !== layout.max_row_length_m;

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Thumb-Friendly Kannada/Multilingual Audio Guide */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-emerald-900 via-stone-900 to-amber-950 text-white rounded-3xl shadow-md border border-stone-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>🌾 {t('blueprint.title')}</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {shapeLabel}
            </span>
          </div>
          <p className="text-xs text-stone-300 font-medium">
            {t('blueprint.field_dims')}: {layout.field_length_m}m × {layout.field_breadth_m}m • {t('blueprint.orientation')}: {layout.orientation}
          </p>
        </div>

        {/* THUMB-FRIENDLY AUDIO PILL BUTTON WITH ANIMATED SOUND PULSE */}
        <button
          type="button"
          onClick={handleToggleVoiceGuide}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 ${
            isSpeakingGuide
              ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-400/30 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title="ನಕ್ಷೆಯ ಧ್ವನಿ ವಿವರ ಕೇಳಿ (Listen to Field Layout Voice Advisory)"
        >
          {isSpeakingGuide ? (
            <>
              <VolumeX className="w-5 h-5 text-stone-950 animate-bounce" />
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-stone-950 rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-stone-950 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-stone-950 rounded-full animate-pulse delay-150" />
              </div>
              <span>ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop Audio)</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-amber-200" />
              <span>🔊 ನಕ್ಷೆಯ ವಿವರ ಕೇಳಿ (Listen to Layout Guide)</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Controls Toolbar & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-xs">
        {/* Zoom Controls */}
        <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 hover:bg-stone-200 text-stone-600 transition"
            title={t('blueprint.zoom_out')}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-semibold text-stone-700 min-w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 hover:bg-stone-200 text-stone-600 transition"
            title={t('blueprint.zoom_in')}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 hover:bg-stone-200 text-stone-500 border-l border-stone-200 transition"
            title={t('blueprint.reset_zoom')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {photoPreview && (
            <button
              type="button"
              onClick={() => setShowPhotoOverlay(!showPhotoOverlay)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition ${
                showPhotoOverlay ? 'bg-emerald-700 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{showPhotoOverlay ? 'Hide Photo' : 'Field Photo'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => downloadSvgAsPng(layout.svg_content, `krishimix-${cropAName}-${cropBName}-layout.png`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{t('blueprint.export_png')}</span>
          </button>

          <button
            type="button"
            onClick={() => downloadSvgAsFile(layout.svg_content, `krishimix-${cropAName}-${cropBName}-layout.svg`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            <span>SVG</span>
          </button>

          <button
            type="button"
            onClick={() => printFarmPlanSummary()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
          >
            <FileText className="w-4 h-4" />
            <span>{t('blueprint.print_pdf')}</span>
          </button>
        </div>
      </div>

      {/* 3. Tapering Cut-Row Length Advisory Banner (if trapezoid / irregular) */}
      {hasVaryingLengths && (
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <b>ಜಮೀನಿನ ಆಕಾರ ಹೊಂದಾಣಿಕೆ (Boundary Conformation):</b> ಬದುವಿನ ಓರೆಯಾದ ಅಂಚುಗಳಿಗೆ ತಕ್ಕಂತೆ ಸಾಲುಗಳ ಉದ್ದ <b>{layout.min_row_length_m} ಮೀಟರ್‌ನಿಂದ {layout.max_row_length_m} ಮೀಟರ್‌ವರೆಗೆ</b> ಬದಲಾಗುತ್ತದೆ. ಕಡಿಮೆ ಉದ್ದದ ಸಾಲುಗಳಲ್ಲಿ ಬೀಜಗಳ ಪ್ರಮಾಣ ಕಡಿಮೆಯಿರುತ್ತದೆ.
          </p>
        </div>
      )}

      {/* 4. Farmer-Centric SVG Blueprint Canvas */}
      <div className="relative overflow-auto max-h-[620px] p-6 bg-stone-100/90 rounded-3xl border border-stone-200 shadow-inner flex flex-col items-center justify-center">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="w-full max-w-[920px] flex justify-center transition-all p-2"
        >
          {showPhotoOverlay && photoPreview ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-center">
              <div
                className="w-full flex justify-center overflow-hidden rounded-2xl shadow-sm"
                dangerouslySetInnerHTML={{ __html: layout.svg_content }}
              />
              <div className="flex flex-col items-center p-3 bg-white rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-800 mb-2">Uploaded Land Survey Photo</span>
                <img
                  src={photoPreview}
                  alt="Field Boundary"
                  className="max-h-[380px] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div
              className="w-full flex justify-center overflow-hidden rounded-2xl shadow-sm"
              dangerouslySetInnerHTML={{ __html: layout.svg_content }}
            />
          )}
        </div>
      </div>

      {/* 5. Dimension Table & Field Metrics with Cut Row Lengths */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dimension Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-stone-900">
              {t('blueprint.row_specs_title')}
            </h4>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              {layout.total_rows} {t('blueprint.total_rows')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/50">
                  <th className="py-2.5 px-3">{t('blueprint.col_crop')}</th>
                  <th className="py-2.5 px-3">{t('blueprint.col_rows')}</th>
                  <th className="py-2.5 px-3">{t('blueprint.col_plants_per_row')} (ಸರಾಸರಿ)</th>
                  <th className="py-2.5 px-3">{t('blueprint.col_total_pop')}</th>
                  <th className="py-2.5 px-3">{t('blueprint.col_spacing')}</th>
                  <th className="py-2.5 px-3">{t('blueprint.col_area_share')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {layout.dimension_table.map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-3 font-semibold flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-xs"
                        style={{ backgroundColor: row.color }}
                      />
                      <span>{row.crop_name}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">{row.total_rows}</td>
                    <td className="py-3 px-3">{row.plants_per_row.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{row.total_plants.toLocaleString()}</td>
                    <td className="py-3 px-3">{(row.row_spacing_m * 100).toFixed(0)} cm</td>
                    <td className="py-3 px-3 font-semibold text-stone-900">{row.percentage_area}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sample Cut Row Lengths for low-literacy clarity */}
          {plantedRows.length > 0 && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-stone-600 block">
                ಸಾಲುಗಳ ಮಾದರಿ ಉದ್ದ (Sample Cut Row Lengths):
              </span>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium text-stone-700">
                <span className="px-2 py-1 bg-white rounded-md border border-stone-200">
                  ಸಾಲು 1 (ಮೊದಲ ಸಾಲು): <b>{plantedRows[0].length_m} ಮೀ</b> ({plantedRows[0].plants_in_row} ಗಿಡಗಳು)
                </span>
                {plantedRows.length > 5 && (
                  <span className="px-2 py-1 bg-white rounded-md border border-stone-200">
                    ಸಾಲು {Math.floor(plantedRows.length / 2)} (ಮಧ್ಯ ಸಾಲು): <b>{plantedRows[Math.floor(plantedRows.length / 2)].length_m} ಮೀ</b>
                  </span>
                )}
                <span className="px-2 py-1 bg-white rounded-md border border-stone-200">
                  ಸಾಲು {plantedRows.length} (ಕೊನೆಯ ಸಾಲು): <b>{plantedRows[plantedRows.length - 1].length_m} ಮೀ</b> ({plantedRows[plantedRows.length - 1].plants_in_row} ಗಿಡಗಳು)
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> {t('blueprint.border_rows')}: {layout.border_rows_count} (ವರಂಬಿನ ಸಾಲುಗಳು)
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> {t('blueprint.pathways')}: {layout.pathways_count} ({layout.pathway_width_m}m ತಿರುಗಾಡುವ ಹಾದಿ)
            </span>
          </div>
        </div>

        {/* Legend & Operations */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-stone-900">{t('blueprint.legend_title')}</h4>
          <div className="space-y-2.5">
            {layout.legend.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <span
                  className="w-5 h-5 rounded-md shrink-0 shadow-xs border border-white"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-xs">
                  <div className="font-semibold text-stone-900">{item.label}</div>
                  <div className="text-[11px] text-stone-500">{item.type}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700" /> {t('blueprint.between_lines')}
            </div>
            <p className="text-[11px] leading-relaxed">
              ಸಾಲುಗಳು {layout.orientation} ದಿಕ್ಕಿನಲ್ಲಿ ಹೊಂದಿಸಲ್ಪಟ್ಟಿದ್ದು, ಸೂರ್ಯನ ಬೆಳಕು ಎರಡೂ ಬೆಳೆಗಳಿಗೆ ಸಮೃದ್ಧವಾಗಿ ತಲುಪುತ್ತದೆ. ಔಷಧ ಸಿಂಪರಣೆಯ ಹಾದಿಗಳಲ್ಲಿ ಗಿಡಗಳನ್ನು ತುಳಿಯದಂತೆ ಜಾಗ್ರತೆ ವಹಿಸಿ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
