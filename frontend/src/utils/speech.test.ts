import { describe, it, expect } from 'vitest';
import { buildRuralLayoutScript, buildRuralIncompatibleScript } from './speech';

describe('Rural Kannada Speech Script Builder', () => {
  it('generates authentic rural Kannada advisory with correct dimensions and spacing', () => {
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
    });

    expect(script).toContain('ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ');
    expect(script).toContain('ಜೋಳ ಮತ್ತು ತೊಗರಿ');
    expect(script).toContain('2:1 ಸಾಲಿನ ಪದ್ಧತಿ ಅತ್ಯುತ್ತಮವಾಗಿದೆ');
    expect(script).toContain('ಬದುವಿನ ಅಂಚುಗಳಿಗೆ ತಕ್ಕಂತೆ ಸಾಲುಗಳ ಉದ್ದ ಬದಲಾಗುತ್ತದೆ');
    expect(script).toContain('42.5 ಮೀಟರ್‌ನಿಂದ 61.2 ಮೀಟರ್‌ವರೆಗೆ');
    expect(script).toContain('ಒಟ್ಟು 40 ಸಾಲುಗಳು ಬರುತ್ತವೆ');
    expect(script).toContain('ಬದುವಿನ ಸಮೀಪ ಸಾಲುಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಜೋಡಿಸಿ');
  });

  it('generates authentic rural warning for incompatible varieties', () => {
    const warning = buildRuralIncompatibleScript('ಮೆಕ್ಕೆಜೋಳ', 'ಕಡಲೆ', 'ಬೆಳವಣಿಗೆ ಅವಧಿ ವ್ಯತ್ಯಾಸ ಹೆಚ್ಚು', 'kn');
    expect(warning).toContain('ಎಚ್ಚರಿಕೆ!');
    expect(warning).toContain('ಮೆಕ್ಕೆಜೋಳ ಮತ್ತು ಕಡಲೆ');
    expect(warning).toContain('ಬೆಳವಣಿಗೆ ಅವಧಿ ವ್ಯತ್ಯಾಸ ಹೆಚ್ಚು');
    expect(warning).toContain('ದಯವಿಟ್ಟು ಪರ್ಯಾಯ ತಳಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ');
  });

  it('generates English and Hindi scripts cleanly', () => {
    const en = buildRuralLayoutScript({
      cerealName: 'Sorghum',
      legumeName: 'Pigeonpea',
      ratio: '2:1',
      spacingACm: 45,
      spacingBCm: 45,
      firstRowLengthM: 42.5,
      lastRowLengthM: 61.2,
      totalRows: 40,
      lang: 'en'
    });
    expect(en).toContain('Hello farmer friends');
    expect(en).toContain('42.5 meters to 61.2 meters');

    const hi = buildRuralLayoutScript({
      cerealName: 'ज्वार',
      legumeName: 'अरहर',
      ratio: '2:1',
      spacingACm: 45,
      spacingBCm: 45,
      firstRowLengthM: 42.5,
      lastRowLengthM: 61.2,
      totalRows: 40,
      lang: 'hi'
    });
    expect(hi).toContain('नमस्ते किसान भाइयों');
  });
});
