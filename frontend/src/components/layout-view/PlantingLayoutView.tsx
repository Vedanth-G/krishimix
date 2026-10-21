import React, { useState } from 'react';
import { PlantingLayoutData } from '../../types';
import { Download, ZoomIn, ZoomOut, RotateCcw, Image, FileText, Check, AlertCircle } from 'lucide-react';
import { downloadSvgAsFile, downloadSvgAsPng, printFarmPlanSummary } from '../../utils/exportLayout';

interface PlantingLayoutViewProps {
  layout: PlantingLayoutData;
  cropAName: string;
  cropBName: string;
}

export const PlantingLayoutView: React.FC<PlantingLayoutViewProps> = ({
  layout,
  cropAName,
  cropBName
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.0, prev + 0.15));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.6, prev - 0.15));
  const handleResetZoom = () => setZoomLevel(1.0);

  return (
    <div className="space-y-6">
      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Planting Layout Map (To-Scale)
          </h3>
          <p className="text-xs text-stone-500">
            Field Dimensions: {layout.field_length_m}m × {layout.field_breadth_m}m | Orientation: {layout.orientation}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 hover:bg-stone-200 text-stone-600 transition"
              title="Zoom Out"
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
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-2 hover:bg-stone-200 text-stone-500 border-l border-stone-200 transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export PNG */}
          <button
            type="button"
            onClick={() => downloadSvgAsPng(layout.svg_content, `krishimix-${cropAName}-${cropBName}-layout.png`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Image className="w-4 h-4" />
            <span>Export PNG</span>
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
            <span>PDF Print</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container with Zoom and Pan Scroll */}
      <div className="relative overflow-auto max-h-[560px] p-4 bg-stone-100/80 rounded-2xl border border-stone-200 shadow-inner flex justify-center">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}
          className="w-full max-w-[900px] flex justify-center"
          dangerouslySetInnerHTML={{ __html: layout.svg_content }}
        />
      </div>

      {/* Dimension Table & Field Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center justify-between">
            <span>Planting Dimension & Spacing Specifications</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              {layout.total_rows} Total Rows Planted
            </span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/50">
                  <th className="py-2.5 px-3">Crop & Variety</th>
                  <th className="py-2.5 px-3">Row Density</th>
                  <th className="py-2.5 px-3">Plants/Row</th>
                  <th className="py-2.5 px-3">Total Population</th>
                  <th className="py-2.5 px-3">Row Spacing</th>
                  <th className="py-2.5 px-3">Area Share</th>
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
                    <td className="py-3 px-3 font-bold text-stone-900">{row.total_rows} rows</td>
                    <td className="py-3 px-3">{row.plants_per_row.toLocaleString()} plants</td>
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
              <Check className="w-4 h-4 text-emerald-600" /> Border Protection: {layout.border_rows_count} Rows
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Pathways / Walkways: {layout.pathways_count} ({layout.pathway_width_m}m width)
            </span>
          </div>
        </div>

        {/* Legend & Operation Tips */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-stone-900">Map Legend</h4>
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
              <AlertCircle className="w-4 h-4 text-amber-700" /> Agronomic Spacing Note
            </div>
            <p className="text-[11px] leading-relaxed">
              Rows are oriented {layout.orientation} to maximize solar illumination into the companion canopy. Always keep walkways clear for weeding passes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
