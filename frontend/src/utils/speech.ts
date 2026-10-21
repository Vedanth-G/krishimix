/**
 * Enhanced Web Speech API wrapper for rural farmers (ಕನ್ನಡ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ):
 * 1. Prioritizes natural neural regional voices (kn-IN: Google kn-IN, Microsoft Gagan/Sapna).
 * 2. Graceful phonetic fallback to Indian English (en-IN) at 0.85 rate if Kannada pack is missing on mobile.
 * 3. Authentic Rural Agricultural Kannada scripting (ಗ್ರಾಮೀಣ ಕೃಷಿ ಉಪಭಾಷಾ ಶೈಲಿ).
 * 4. Audio wave and speech controls.
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
}

export function buildRuralLayoutScript(params: RuralLayoutScriptParams): string {
  const lang = params.lang || 'kn';
  // Rural farmers often visualize spacing in feet (e.g. 45cm ~ 1.5 feet, 30cm ~ 1 foot, 60cm ~ 2 feet)
  const spacingAFeet = (params.spacingACm / 30.48).toFixed(1).replace('.0', '');
  const spacingBFeet = (params.spacingBCm / 30.48).toFixed(1).replace('.0', '');
  const firstLen = params.firstRowLengthM.toFixed(1);
  const lastLen = params.lastRowLengthM.toFixed(1);

  if (lang === 'kn') {
    return (
      `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ. ನಿಮ್ಮ ಜಮೀನಿನ ಆಕಾರಕ್ಕೆ ತಕ್ಕಂತೆ ಸಾಲುಗಳ ನಕ್ಷೆ ಸಿದ್ಧವಾಗಿದೆ. ` +
      `${params.cerealName} ಮತ್ತು ${params.legumeName} ಬೆಳೆಗಳಿಗೆ ${params.ratio} ಸಾಲಿನ ಪದ್ಧತಿ ಅತ್ಯುತ್ತಮವಾಗಿದೆ. ` +
      `${params.cerealName} ನಡುವೆ ${spacingAFeet} ಅಡಿ ಮತ್ತು ${params.legumeName} ನಡುವೆ ${spacingBFeet} ಅಡಿ ಅಂತರ ಕಾಪಾಡಿ. ` +
      `ಸಾಲುಗಳ ನಡುವೆ ತಿರುಗಾಡಲು ಮತ್ತು ಔಷಧ ಸಿಂಪರಣೆಗೆ ದಾರಿ ಬಿಡಲಾಗಿದೆ. ಬದುವಿನ ಸಮೀಪ ಸಾಲುಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಜೋಡಿಸಿ. ` +
      `ಬದುವಿನ ಅಂಚುಗಳಿಗೆ ತಕ್ಕಂತೆ ಸಾಲುಗಳ ಉದ್ದ ಬದಲಾಗುತ್ತದೆ. ${firstLen} ಮೀಟರ್‌ನಿಂದ ${lastLen} ಮೀಟರ್‌ವರೆಗೆ ಸಾಲುಗಳಿವೆ. ` +
      `ಒಟ್ಟು ${params.totalRows} ಸಾಲುಗಳು ಬರುತ್ತವೆ.`
    );
  } else if (lang === 'hi') {
    return (
      `नमस्ते किसान भाइयों। आपके खेत के आकार के अनुसार कतारों का नक्शा तैयार है। ` +
      `${params.cerealName} और ${params.legumeName} के लिए ${params.ratio} कतार प्रणाली सबसे उपयुक्त है। ` +
      `${params.cerealName} के बीच ${spacingAFeet} फीट और ${params.legumeName} के बीच ${spacingBFeet} फीट की दूरी रखें। ` +
      `निगरानी और कीटनाशक छिड़काव के लिए कतारों के बीच रास्ता दिया गया है। खेत की मेड़ के पास कतारों को सावधानी से व्यवस्थित करें। ` +
      `मेड़ के किनारों के अनुसार कतारों की लंबाई ${firstLen} मीटर से ${lastLen} मीटर तक है। ` +
      `कुल मिलाकर ${params.totalRows} कतारें आती हैं।`
    );
  } else {
    return (
      `Hello farmer friends. Your planting layout map is ready according to your field boundary shape. ` +
      `The ${params.ratio} row pattern is optimal for ${params.cerealName} and ${params.legumeName}. ` +
      `Maintain ${spacingAFeet} feet between ${params.cerealName} rows and ${spacingBFeet} feet for ${params.legumeName}. ` +
      `Clear walking alleys are reserved for intercultural spraying. Rows adjust neatly along the farm bund. ` +
      `Row lengths adapt to boundary edges from ${firstLen} meters to ${lastLen} meters. ` +
      `There are ${params.totalRows} rows in total.`
    );
  }
}

export function buildRuralIncompatibleScript(
  cerealName: string,
  legumeName: string,
  reason: string,
  lang: string = 'kn'
): string {
  if (lang === 'kn') {
    return `ಎಚ್ಚರಿಕೆ! ನೀವು ಆಯ್ದುಕೊಂಡ ${cerealName} ಮತ್ತು ${legumeName} ತಳಿಗಳು ಒಟ್ಟಿಗೆ ಬೆಳೆಯಲು ಸೂಕ್ತವಲ್ಲ. ${reason}. ದಯವಿಟ್ಟು ಪರ್ಯಾಯ ತಳಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`;
  } else if (lang === 'hi') {
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

  private cleanTextForSpeech(text: string, lang: string): string {
    let cleaned = text;

    if (lang === 'kn') {
      cleaned = cleaned
        .replace(/₹\s*([0-9,]+)/g, '$1 ರೂಪಾಯಿ')
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

      // 3. Graceful Fallback: Clear phonetic Indian English (en-IN)
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

    const spokenText = this.cleanTextForSpeech(text, lang);
    const utterance = new SpeechSynthesisUtterance(spokenText);

    const { voice, isFallback } = this.findBestVoice(lang);

    if (voice) {
      utterance.voice = voice;
      // If falling back to en-IN voice because kn-IN is missing on the device,
      // use en-IN lang tag and slow rate 0.85
      if (isFallback) {
        utterance.lang = 'en-IN';
        utterance.rate = 0.85;
      } else {
        utterance.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.88; // Relaxed tempo for rural clarity
      }
    } else {
      utterance.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.88;
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
