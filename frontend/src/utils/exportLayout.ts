/**
 * Export helpers for planting layout SVG, PNG, and PDF summary.
 */

export function downloadSvgAsFile(svgContent: string, fileName: string = 'krishimix-layout.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSvgAsPng(svgContent: string, fileName: string = 'krishimix-layout.png') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = Math.round((img.height / img.width) * 1200) || 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fafaf9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  };

  img.src = url;
}

export function printFarmPlanSummary() {
  window.print();
}
