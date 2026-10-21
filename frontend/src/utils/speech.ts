/**
 * Web Speech API wrapper for low-literacy farmers:
 * 1. Read-aloud: Text-to-Speech in English, Kannada, or Hindi.
 * 2. Voice-input: Speech Recognition for selecting crops or asking questions.
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
    // Map language
    if (lang === 'kn') {
      utterance.lang = 'kn-IN';
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95; // Slightly slower, clearer for rural users
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
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
