import { describe, it, expect } from 'vitest';
import { buildRuralLayoutScript, buildRuralIncompatibleScript } from './speech';

describe('Rural Speech Script Builder', () => {
  it('generates authentic rural Kannada advisory when native Kannada voice is present', () => {
    const script = buildRuralLayoutScript({
      cerealName: 'ಜೋಳ',
      legumeName: 'ತೊಗರಿ',
      ratio: '2:1',
      spacingACm: 45,
      spacingBCm: 45,
      firstRowLengthM: 42.5,
      lastRowLengthM: 61.2,
      totalRows: 40,
      lang: 'kn'
    }, true);

    expect(script).toContain('ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ');
    expect(script).toContain('ಜೋಳ ಮತ್ತು ತೊಗರಿ');
    expect(script).toContain('ಎರಡಕ್ಕೆ ಒಂದು ಸಾಲಿನ ಪದ್ಧತಿ ಅತ್ಯುತ್ತಮವಾಗಿದೆ');
    expect(script).toContain('ಬದುವಿನ ಅಂಚುಗಳಿಗೆ ತಕ್ಕಂತೆ ಸಾಲುಗಳ ಉದ್ದ');
    expect(script).toContain('ಒಟ್ಟು 40 ಸಾಲುಗಳು ಬರುತ್ತವೆ');
  });

  it('generates clear English phonetic fallback when Kannada TTS voice is missing on device', () => {
    const script = buildRuralLayoutScript({
      cerealName: 'Sorghum',
      legumeName: 'Pigeonpea',
      ratio: '2:1',
      spacingACm: 45,
      spacingBCm: 45,
      firstRowLengthM: 42.5,
      lastRowLengthM: 61.2,
      totalRows: 40,
      lang: 'kn'
    }, false); // isNativeVoice = false

    expect(script).toContain('Namaskara Raitha Bandhavare!');
    expect(script).toContain('Sorghum and Pigeonpea');
    expect(script).toContain('2:1 rows');
    expect(script).not.toContain('ನಮಸ್ಕಾರ'); // Must not pass Kannada unicode to English TTS engine!
  });

  it('generates authentic rural warning for incompatible varieties', () => {
    const warning = buildRuralIncompatibleScript('ಮೆಕ್ಕೆಜೋಳ', 'ಕಡಲೆ', 'ಬೆಳವಣಿಗೆ ಅವಧಿ ವ್ಯತ್ಯಾಸ ಹೆಚ್ಚು', 'kn', true);
    expect(warning).toContain('ಎಚ್ಚರಿಕೆ!');
    expect(warning).toContain('ಮೆಕ್ಕೆಜೋಳ ಮತ್ತು ಕಡಲೆ');
  });
});
