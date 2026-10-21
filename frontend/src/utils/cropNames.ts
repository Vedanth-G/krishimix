/**
 * Localized crop and agronomic terminology helper for low-literacy farmers.
 */

export const CROP_LOCALIZED_NAMES: Record<string, { kn: string; hi: string; en: string }> = {
  'Sorghum': { kn: 'ಜೋಳ (Sorghum)', hi: 'ज्वार (Sorghum)', en: 'Sorghum' },
  'Pigeonpea': { kn: 'ತೊಗರಿ (Pigeonpea)', hi: 'अरहर / तुअर (Pigeonpea)', en: 'Pigeonpea' },
  'Maize': { kn: 'ಮೆಕ್ಕೆಜೋಳ (Maize)', hi: 'मक्का (Maize)', en: 'Maize' },
  'Groundnut': { kn: 'ಕಡಲೆಕಾಯಿ (Groundnut)', hi: 'मूंगफली (Groundnut)', en: 'Groundnut' },
  'Soybean': { kn: 'ಸೋಯಾಬೀನ್ (Soybean)', hi: 'सोयाबीन (Soybean)', en: 'Soybean' },
  'Cowpea': { kn: 'ಅಲಸಂದಿ (Cowpea)', hi: 'लोबिया (Cowpea)', en: 'Cowpea' },
  'Chickpea': { kn: 'ಕಡಲೆ (Chickpea)', hi: 'चना (Chickpea)', en: 'Chickpea' },
  'Pearl Millet': { kn: 'ಸಜ್ಜೆ (Bajra)', hi: 'बाजरा (Bajra)', en: 'Pearl Millet' },
  'Sunflower': { kn: 'ಸೂರ್ಯಕಾಂತಿ (Sunflower)', hi: 'सूरजमुखी (Sunflower)', en: 'Sunflower' },
  'Green Gram': { kn: 'ಹೆಸರು ಕಾಳು (Moong)', hi: 'मूंग (Moong)', en: 'Green Gram' },
  'Black Gram': { kn: 'ಉದ್ದು (Urad)', hi: 'उड़द (Urad)', en: 'Black Gram' },
  'Finger Millet': { kn: 'ರಾಗಿ (Ragi)', hi: 'रागी (Ragi)', en: 'Finger Millet' }
};

export function getLocalizedCropName(name: string, lang: string = 'en'): string {
  if (!name) return '';
  const item = CROP_LOCALIZED_NAMES[name];
  if (!item) return name;
  if (lang === 'kn') return item.kn;
  if (lang === 'hi') return item.hi;
  return item.en;
}

export function translateVerdict(verdict: string, lang: string = 'en'): string {
  if (lang === 'kn') {
    if (verdict === 'Recommended') return 'ಉತ್ತಮ ಶಿಫಾರಸು (Recommended)';
    if (verdict === 'Possible') return 'ಸಾಧ್ಯವಿದೆ / ಪರೀಕ್ಷಿಸಿ (Possible)';
    return 'ಶಿಫಾರಸು ಇಲ್ಲ (Unsupported)';
  }
  if (lang === 'hi') {
    if (verdict === 'Recommended') return 'अनुशंसित (Recommended)';
    if (verdict === 'Possible') return 'संभव है (Possible)';
    return 'अनुशंसित नहीं (Unsupported)';
  }
  return verdict;
}

export function translateVerdictSummary(summary: string, lang: string = 'en'): string {
  if (lang === 'kn') {
    if (summary.includes('Highly Recommended')) return 'ಅತ್ಯುತ್ತಮ ಇಳುವರಿ ನೀಡುವ ವೈಜ್ಞಾನಿಕ ಮಿಶ್ರ ಬೆಳೆ ಜೋಡಿ';
    if (summary.includes('Viable')) return 'ಮಧ್ಯಮ ಇಳುವರಿ ನೀಡುವ ಸಾಧ್ಯತೆಯಿರುವ ಮಿಶ್ರ ಬೆಳೆ';
    if (summary.includes('Incompatible')) return 'ಬೆಳೆಗಳ ನಡುವೆ ತೀವ್ರ ಪೈಪೋಟಿ. ಒಟ್ಟಿಗೆ ಬೆಳೆಯಲು ಸೂಕ್ತವಲ್ಲ';
  }
  if (lang === 'hi') {
    if (summary.includes('Highly Recommended')) return 'अत्यधिक अनुशंसित और लाभदायक अंतरफसल संयोजन';
    if (summary.includes('Viable')) return 'मध्यम लाभप्रदता वाला व्यावहारिक अंतरफसल संयोजन';
    if (summary.includes('Incompatible')) return 'फसलों के बीच जैविक संघर्ष। एक साथ उगाने के लिए उपयुक्त नहीं';
  }
  return summary;
}
