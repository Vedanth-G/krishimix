/**
 * Enhanced Web Speech API wrapper for rural farmers (ಕನ್ನಡ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ):
 * 1. Checks for native Kannada neural voice (Google kn-IN, Microsoft Gagan/Sapna, Samsung kn-IN).
 * 2. If native Kannada voice exists: speaks authentic rural Kannada with phonetic pause markers.
 * 3. CRITICAL FALLBACK: If device lacks Kannada TTS, it NEVER sends Kannada script to an English voice (which causes robotic gibberish). Instead, it speaks in warm, slow, clear Indian English (0.80 rate) with familiar Indian agricultural terms!
 * 4. Converts ratios and numbers to spoken words for natural flow.
 */

export interface RuralLayoutScriptParams {
  cerealName: string;
  legumeName: string;
  ratio: string;
  spacingACm: number;
  spacingBCm: number;
  firstRowLengthM: number;
  lastRowLengthM: number;
  totalRows: number;
  lang?: string;
  shapeName?: string;
}

// Convert numbers to spoken Kannada for smooth cadence
function spokenNumberKn(num: number): string {
  const rounded = Math.round(num);
  const map: Record<number, string> = {
    1: 'ಒಂದು', 2: 'ಎರಡು', 3: 'ಮೂರು', 4: 'ನಾಲ್ಕು', 5: 'ಐದು',
    6: 'ಆರು', 7: 'ಏಳು', 8: 'ಎಂಟು', 9: 'ಒಂಬತ್ತು', 10: 'ಹತ್ತು',
    12: 'ಹನ್ನೆರಡು', 15: 'ಹದಿನೈದು', 20: 'ಇಪ್ಪತ್ತು', 25: 'ಇಪ್ಪತ್ತೈದು',
    30: 'ಮೂವತ್ತು', 40: 'ನಲವತ್ತು', 45: 'ನಲವತ್ತೈದು', 50: 'ಐವತ್ತು',
    60: 'ಅರವತ್ತು', 70: 'ಎಪ್ಪತ್ತು', 80: 'ಎಂಬತ್ತು', 90: 'ತೊಂಬತ್ತು', 100: 'ನೂರು'
  };
  return map[rounded] || String(rounded);
}

// Convert ratio "2:1" to spoken text
function spokenRatioKn(ratio: string): string {
  const parts = ratio.split(':');
  if (parts.length === 2) {
    const a = parseInt(parts[0]) || 2;
    const b = parseInt(parts[1]) || 1;
    const aStr = a === 2 ? 'ಎರಡಕ್ಕೆ' : a === 3 ? 'ಮೂರಕ್ಕೆ' : a === 4 ? 'ನಾಲ್ಕಕ್ಕೆ' : a === 1 ? 'ಒಂದಕ್ಕೆ' : `${spokenNumberKn(a)}ಕ್ಕೆ`;
    const bStr = spokenNumberKn(b);
    return `${aStr} ${bStr} ಸಾಲಿನ ಪದ್ಧತಿ`;
  }
  return `${ratio} ಸಾಲಿನ ಪದ್ಧತಿ`;
}

export function buildRuralLayoutScript(params: RuralLayoutScriptParams, isNativeVoice: boolean = true): string {
  const lang = params.lang || 'kn';
  const spacingAFeet = (params.spacingACm / 30.48).toFixed(1).replace('.0', '');
  const spacingBFeet = (params.spacingBCm / 30.48).toFixed(1).replace('.0', '');
  const firstLen = Math.round(params.firstRowLengthM);
  const lastLen = Math.round(params.lastRowLengthM);
  const shapeText = params.shapeName ? `ನಿಮ್ಮ ${params.shapeName} ಆಕಾರದ ಜಮೀನಿಗೆ` : 'ನಿಮ್ಮ ಜಮೀನಿನ ಆಕಾರಕ್ಕೆ';

  // If user selected Kannada AND device HAS a native Kannada TTS voice
  if (lang === 'kn' && isNativeVoice) {
    const spokenRatio = spokenRatioKn(params.ratio);
    return (
      `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ. ${shapeText} ತಕ್ಕಂತೆ ಸಾಲುಗಳ ನಕ್ಷೆ ಸಿದ್ಧವಾಗಿದೆ. ` +
      `${params.cerealName} ಮತ್ತು ${params.legumeName} ಬೆಳೆಗಳಿಗೆ, ${spokenRatio} ಅತ್ಯುತ್ತಮವಾಗಿದೆ. ` +
      `${params.cerealName} ಸಾಲುಗಳ ನಡುವೆ ${spacingAFeet} ಅಡಿ, ಮತ್ತು ${params.legumeName} ಸಾಲುಗಳ ನಡುವೆ ${spacingBFeet} ಅಡಿ ಅಂತರ ಕಾಪಾಡಿ. ` +
      `ಸಾಲುಗಳ ನಡುವೆ ನಡೆದಾಡಲು, ಮತ್ತು ಔಷಧ ಸಿಂಪಡಿಸಲು ದಾರಿ ಬಿಡಲಾಗಿದೆ. ` +
      `ಜಮೀನಿನ ಬದುವಿನ ಅಂಚುಗಳಿಗೆ ತಕ್ಕಂತೆ ಸಾಲುಗಳ ಉದ್ದ, ${firstLen} ಮೀಟರ್‌ನಿಂದ ${lastLen} ಮೀಟರ್‌ವರೆಗೆ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ. ` +
      `ಒಟ್ಟು ${params.totalRows} ಸಾಲುಗಳು ಬರುತ್ತವೆ. ಬದುವಿನ ಸಮೀಪ ಸಾಲುಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಜೋಡಿಸಿ.`
    );
  }

  // If user selected Kannada BUT device LACKS native Kannada voice:
  // Speak in warm, clear, slow Indian English with local terms so it NEVER sounds like broken noise!
  if (lang === 'kn' && !isNativeVoice) {
    return (
      `Namaskara Raitha Bandhavare! Your field planting map is ready according to your land shape. ` +
      `The recommended pattern for ${params.cerealName} and ${params.legumeName} is ${params.ratio} rows. ` +
      `Keep ${spacingAFeet} feet distance for ${params.cerealName}, and ${spacingBFeet} feet distance for ${params.legumeName}. ` +
      `Walking paths are kept open between rows for spraying and weeding. ` +
      `Row lengths adjust to your farm bund edges from ${firstLen} meters to ${lastLen} meters. ` +
      `Total ${params.totalRows} planting rows will fit cleanly in your field. Thank you.`
    );
  }

  if (lang === 'hi') {
    return (
      `नमस्ते किसान भाइयों। आपके खेत के आकार के अनुसार कतारों का नक्शा तैयार है। ` +
      `${params.cerealName} और ${params.legumeName} के लिए, ${params.ratio} कतार प्रणाली सबसे बढ़िया है। ` +
      `${params.cerealName} की कतारों के बीच ${spacingAFeet} फीट, और ${params.legumeName} के बीच ${spacingBFeet} फीट की दूरी रखें। ` +
      `निगरानी और कीटनाशक छिड़काव के लिए कतारों के बीच रास्ता दिया गया है। ` +
      `मेड़ के किनारों के अनुसार कतारों की लंबाई ${firstLen} मीटर से ${lastLen} मीटर तक है। ` +
      `कुल मिलाकर ${params.totalRows} कतारें बनती हैं।`
    );
  }

  return (
    `Hello farmer friends. Your planting layout map is ready according to your land boundary shape. ` +
    `The ${params.ratio} row pattern is optimal for ${params.cerealName} and ${params.legumeName}. ` +
    `Maintain ${spacingAFeet} feet between ${params.cerealName} rows, and ${spacingBFeet} feet for ${params.legumeName}. ` +
    `Clear walking tracks are reserved for intercultural spraying. ` +
    `Row lengths adapt naturally along your farm bund from ${firstLen} meters to ${lastLen} meters. ` +
    `There are ${params.totalRows} total rows in your field.`
  );
}

export function buildRuralIncompatibleScript(
  cerealName: string,
  legumeName: string,
  reason: string,
  lang: string = 'kn',
  isNativeVoice: boolean = true
): string {
  if (lang === 'kn' && isNativeVoice) {
    return `ಎಚ್ಚರಿಕೆ! ನೀವು ಆಯ್ದುಕೊಂಡ ${cerealName} ಮತ್ತು ${legumeName} ತಳಿಗಳು ಒಟ್ಟಿಗೆ ಬೆಳೆಯಲು ಸೂಕ್ತವಲ್ಲ. ${reason}. ದಯವಿಟ್ಟು ಪರ್ಯಾಯ ತಳಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`;
  }
  if (lang === 'kn' && !isNativeVoice) {
    return `Warning! The selected varieties of ${cerealName} and ${legumeName} are not compatible together. ${reason}. Please select recommended alternatives.`;
  }
  if (lang === 'hi') {
    return `चेतावनी! आपके द्वारा चुनी गई ${cerealName} और ${legumeName} किस्में एक साथ उगाने के लिए उपयुक्त नहीं हैं। ${reason}। कृपया सुझाई गई वैकल्पिक किस्मों की जांच करें।`;
  }
  return `Warning! The selected varieties of ${cerealName} and ${legumeName} are not suitable for intercropping together. ${reason}. Please review supported alternatives.`;
}

class SpeechHelper {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (this.synth) {
      try {
        this.voices = this.synth.getVoices();
      } catch (e) {
        this.voices = [];
      }
    }
  }

  hasNativeVoiceForLang(lang: string): boolean {
    if (!this.synth) return false;
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    const target = lang.toLowerCase();
    return this.voices.some(v => v.lang.toLowerCase().startsWith(target) || v.name.toLowerCase().includes(target));
  }

  private cleanTextForSpeech(text: string, lang: string): string {
    let cleaned = text;

    if (lang === 'kn') {
      cleaned = cleaned
        .replace(/₹\s*([0-9,]+)/g, '$1 ರೂಪಾಯಿಗಳು')
        .replace(/kg\/acre/gi, 'ಕೆಜಿ ಪ್ರತಿ ಎಕರೆಗೆ')
        .replace(/kg/gi, 'ಕೆಜಿ')
        .replace(/LER/gi, 'ಭೂಮಿ ದಕ್ಷತೆ ಅಂಕ')
        .replace(/pH/gi, 'ಪಿ ಎಚ್')
        .replace(/m²/gi, 'ಚದರ ಮೀಟರ್')
        .replace(/m\b/gi, 'ಮೀಟರ್')
        .replace(/[•\-\*]/g, ' ')
        .replace(/[:]/g, ', ');
    } else if (lang === 'hi') {
      cleaned = cleaned
        .replace(/₹\s*([0-9,]+)/g, '$1 रुपये')
        .replace(/kg\/acre/gi, 'किलोग्राम प्रति एकड़')
        .replace(/kg/gi, 'किलो')
        .replace(/LER/gi, 'भूमि दक्षता स्कोर')
        .replace(/pH/gi, 'पी एच')
        .replace(/m²/gi, 'वर्ग मीटर')
        .replace(/m\b/gi, 'मीटर')
        .replace(/[•\-\*]/g, ' ')
        .replace(/[:]/g, ', ');
    } else {
      cleaned = cleaned
        .replace(/₹\s*([0-9,]+)/g, '$1 Rupees')
        .replace(/kg\/acre/gi, 'kilograms per acre')
        .replace(/kg/gi, 'kilograms')
        .replace(/LER/gi, 'Land Score')
        .replace(/pH/gi, 'P H')
        .replace(/m²/gi, 'square meters')
        .replace(/[•\-\*]/g, ' ')
        .replace(/[:]/g, ', ');
    }

    return cleaned.trim();
  }

  /**
   * Prioritize high quality regional neural voices with fallback.
   */
  private findBestVoice(lang: string): { voice: SpeechSynthesisVoice | null; isFallback: boolean } {
    if (!this.synth) return { voice: null, isFallback: false };
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }

    const all = this.voices;
    if (all.length === 0) return { voice: null, isFallback: false };

    if (lang === 'kn') {
      // 1. High-priority neural / natural Kannada voices
      const knNeural = all.find(v => {
        const vl = v.lang.toLowerCase();
        const vn = v.name.toLowerCase();
        return (
          (vl === 'kn-in' || vl.startsWith('kn')) &&
          (vn.includes('natural') || vn.includes('online') || vn.includes('gagan') || vn.includes('sapna') || vn.includes('google'))
        );
      });
      if (knNeural) return { voice: knNeural, isFallback: false };

      // 2. Any standard Kannada voice
      const knAny = all.find(v => v.lang.toLowerCase().startsWith('kn') || v.name.toLowerCase().includes('kannada'));
      if (knAny) return { voice: knAny, isFallback: false };

      // 3. Fallback: Clear phonetic Indian English (en-IN)
      const enIn = all.find(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
      if (enIn) return { voice: enIn, isFallback: true };
    } else if (lang === 'hi') {
      const hiNeural = all.find(v => {
        const vl = v.lang.toLowerCase();
        const vn = v.name.toLowerCase();
        return (
          (vl === 'hi-in' || vl.startsWith('hi')) &&
          (vn.includes('natural') || vn.includes('online') || vn.includes('swara') || vn.includes('madhur') || vn.includes('google'))
        );
      });
      if (hiNeural) return { voice: hiNeural, isFallback: false };

      const hiAny = all.find(v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hiAny) return { voice: hiAny, isFallback: false };

      const enIn = all.find(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
      if (enIn) return { voice: enIn, isFallback: true };
    } else {
      const enIn = all.find(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
      if (enIn) return { voice: enIn, isFallback: false };
    }

    return { voice: all[0] || null, isFallback: false };
  }

  speak(text: string, lang: string = 'en', onEnd?: () => void): boolean {
    if (!this.synth) {
      console.warn('Speech synthesis not available in this browser');
      return false;
    }

    this.stop();

    const { voice, isFallback } = this.findBestVoice(lang);

    // If Kannada was requested but device has no Kannada voice pack,
    // ensure text is spoken in clear Indian English fallback script
    const spokenText = this.cleanTextForSpeech(text, isFallback ? 'en' : lang);
    const utterance = new SpeechSynthesisUtterance(spokenText);

    if (voice) {
      utterance.voice = voice;
      if (isFallback) {
        utterance.lang = 'en-IN';
        utterance.rate = 0.82; // Slower cadence for maximum phonetic clarity
      } else {
        utterance.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.86; // Natural calm tempo for rural phrasing
      }
    } else {
      utterance.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.85;
    }

    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis event:', e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechHelper = new SpeechHelper();
