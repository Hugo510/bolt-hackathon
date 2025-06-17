// Utilidades para verificar contraste de colores según WCAG

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

export function suggestAccessibleColor(
  originalColor: string, 
  backgroundColor: string, 
  targetRatio: number = 4.5
): string {
  const bgRgb = hexToRgb(backgroundColor);
  const origRgb = hexToRgb(originalColor);
  
  if (!bgRgb || !origRgb) return originalColor;
  
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  // Determinar si necesitamos un color más claro o más oscuro
  const needsDarker = bgLum > 0.5;
  
  let adjustedColor = originalColor;
  let currentRatio = getContrastRatio(originalColor, backgroundColor);
  
  // Ajustar el color hasta alcanzar el ratio deseado
  let adjustment = needsDarker ? -10 : 10;
  let iterations = 0;
  const maxIterations = 25;
  
  while (currentRatio < targetRatio && iterations < maxIterations) {
    const newRgb = {
      r: Math.max(0, Math.min(255, origRgb.r + adjustment * iterations)),
      g: Math.max(0, Math.min(255, origRgb.g + adjustment * iterations)),
      b: Math.max(0, Math.min(255, origRgb.b + adjustment * iterations)),
    };
    
    adjustedColor = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
    currentRatio = getContrastRatio(adjustedColor, backgroundColor);
    iterations++;
  }
  
  return adjustedColor;
}