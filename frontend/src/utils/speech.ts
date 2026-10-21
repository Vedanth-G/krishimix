/**
 * Web Speech API wrapper for rural farmers:
 * 1. Read-aloud: Text-to-Speech in English, Kannada, or Hindi.
 * 2. Natural phonetic text cleaning (cleans currency, units, punctuation).
 * 3. Voice matching for regional Indian languages with graceful fallbacks.
 */

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

  speak(text: string, lang: string = 'en', onEnd?: () => void): boolean {
    if (!this.synth) {
      console.warn('Speech synthesis not available in this browser');
      return false;
    }

    this.stop();

    const spokenText = this.cleanTextForSpeech(text, lang);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    const targetLang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = targetLang;

    // Try finding matching voice
    try {
      if (this.voices.length === 0) {
        this.voices = this.synth.getVoices();
      }

      if (this.voices.length > 0) {
        let matchingVoice = this.voices.find(v => {
          const vLang = v.lang.toLowerCase();
          const vName = v.name.toLowerCase();
          if (lang === 'kn') {
            return vLang.startsWith('kn') || vName.includes('kannada');
          } else if (lang === 'hi') {
            return vLang.startsWith('hi') || vName.includes('hindi');
          } else {
            return vLang.includes('en-in') || vName.includes('india');
          }
        });

        // Fallback for Kannada if OS has no Kannada voice: use clear Indian English voice
        if (!matchingVoice && lang === 'kn') {
          matchingVoice = this.voices.find(v => v.lang.toLowerCase().includes('en-in'));
        }

        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }
    } catch (e) {
      // ignore
    }

    utterance.rate = 0.90; // Slower, relaxed tempo for maximum clarity
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
