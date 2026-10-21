import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlantingLayoutData } from '../../types';
import { Download, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, FileText, Check, AlertCircle, Compass, Layers } from 'lucide-react';
import { downloadSvgAsFile, downloadSvgAsPng, printFarmPlanSummary } from '../../utils/exportLayout';

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
  const { t } = useTranslation();
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showPhotoOverlay, setShowPhotoOverlay] = useState<boolean>(false);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.0, prev + 0.15));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.6, prev - 0.15));
  const handleResetZoom = () => setZoomLevel(1.0);

  return (
    <div className="space-y-6">
      {/* Header bar with controls & shape indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">
              {t('blueprint.title')}
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              {shapeType === 'Trapezoid'
                ? t('step2.shape_trapezoid')
                : shapeType === 'Contour'
                ? t('step2.shape_contour')
                : shapeType === 'Custom Boundary'
                ? t('step2.shape_custom')
                : t('step2.shape_regular')}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('blueprint.field_dims')}: {layout.field_length_m}m × {layout.field_breadth_m}m | {t('blueprint.orientation')}: {layout.orientation}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          {/* Photo Preview Toggle if uploaded */}
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

          {/* Export PNG */}
          <button
            type="button"
            onClick={() => downloadSvgAsPng(layout.svg_content, `krishimix-${cropAName}-${cropBName}-layout.png`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{t('blueprint.export_png')}</span>
          </button>

          {/* Export SVG */}
          <button
            type="button"
            onClick={() => downloadSvgAsFile(layout.svg_content, `krishimix-${cropAName}-${cropBName}-layout.svg`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            <span>SVG</span>
          </button>

          {/* Print PDF */}
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

      {/* Blueprint Canvas Container with Shape Boundary Styling */}
      <div className="relative overflow-auto max-h-[580px] p-6 bg-stone-100/90 rounded-3xl border border-stone-200 shadow-inner flex flex-col items-center justify-center">
        {/* Visual Shape Frame Indicator */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className={`w-full max-w-[900px] flex justify-center transition-all ${
            shapeType === 'Trapezoid'
              ? 'p-3 bg-emerald-50/40 rounded-2xl border-2 border-emerald-600/40'
              : shapeType === 'Contour'
              ? 'p-3 bg-emerald-50/40 rounded-3xl border-2 border-dashed border-emerald-600/50'
              : 'p-2'
          }`}
        >
          {showPhotoOverlay && photoPreview ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-center">
              <div
                className="w-full flex justify-center overflow-hidden"
                dangerouslySetInnerHTML={{ __html: layout.svg_content }}
              />
              <div className="flex flex-col items-center p-2 bg-white rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-700 mb-2">Uploaded Land Survey Photo</span>
                <img
                  src={photoPreview}
                  alt="Field Boundary"
                  className="max-h-[360px] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div
              className="w-full flex justify-center overflow-hidden"
              dangerouslySetInnerHTML={{ __html: layout.svg_content }}
            />
          )}
        </div>
      </div>

      {/* Dimension Table & Field Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center justify-between">
            <span>{t('blueprint.row_specs_title')}</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              {layout.total_rows} {t('blueprint.total_rows')}
            </span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/50">
                  <th className="py-2.5 px-3">{t('blueprint.col_crop')}</th>
                  <th className="py-2.5 px-3">{t('blueprint.col_rows')}</th>
                  <th className="py-2.5 px-3">{t('blueprint.col_plants_per_row')}</th>
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

          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> {t('blueprint.border_rows')}: {layout.border_rows_count}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> {t('blueprint.pathways')}: {layout.pathways_count} ({layout.pathway_width_m}m)
            </span>
          </div>
        </div>

        {/* Legend & Operation Tips */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-stone-900">{t('blueprint.legend_title')}</h4>
          <div className="space-y-2.5">
            {layout.legend.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 border border-stone-100">
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
              Rows are oriented {layout.orientation} to maximize solar illumination into the companion canopy. Always keep pathways clear for manual weeding passes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
