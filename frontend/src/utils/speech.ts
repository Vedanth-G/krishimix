/**
 * Web Speech API wrapper for low-literacy farmers:
 * 1. Read-aloud: Text-to-Speech in English, Kannada, or Hindi.
 * 2. Voice matching for regional Indian languages.
 */

class SpeechHelper {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  speak(text: string, lang: string = 'en', onEnd?: () => void): boolean {
    if (!this.synth) {
      console.warn('Speech synthesis not available in this browser');
      return false;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = targetLang;

    // Try finding matching voice
    try {
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        const matchingVoice = voices.find(
          v => v.lang.toLowerCase().startsWith(lang.toLowerCase()) ||
               (lang === 'kn' && v.name.toLowerCase().includes('kannada')) ||
               (lang === 'hi' && v.name.toLowerCase().includes('hindi'))
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }
    } catch (e) {
      // fallback
    }

    utterance.rate = 0.95; // Clearer pace for rural farmers
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
