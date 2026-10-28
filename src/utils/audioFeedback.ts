/**
 * CampusIQ Pro — Audio & Voice Feedback System
 * Uses Web Audio API and Web Speech API:
 * - 'playNfcBeepSound': ISO 14443A contactless smartcard tap chirp (2093 Hz C7 + 2637 Hz E7 confirmation).
 * - 'playSuccessSound': Dual-tone verified harmonic chime (1046.5 Hz C6 -> 1318.5 Hz E6).
 * - 'playErrorSound': Descending reject buzz (220 Hz -> 130 Hz).
 * - 'speakAttendanceMarked': Real-time voice speech announcement stating student name and/or marked roll number.
 * Completely self-contained: no external audio dependencies, works offline.
 */

export type VoiceAnnouncementMode = 'both' | 'roll' | 'name';

class AudioFeedbackService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private voiceEnabled: boolean = true;
  private voiceMode: VoiceAnnouncementMode = 'both';
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('campusiq_audio_feedback_muted');
        if (stored !== null) {
          this.muted = stored === 'true';
        }

        const voiceStored = localStorage.getItem('campusiq_voice_enabled');
        if (voiceStored !== null) {
          this.voiceEnabled = voiceStored === 'true';
        }

        const modeStored = localStorage.getItem('campusiq_voice_mode') as VoiceAnnouncementMode;
        if (modeStored && ['both', 'roll', 'name'].includes(modeStored)) {
          this.voiceMode = modeStored;
        }

        if ('speechSynthesis' in window) {
          this.cachedVoices = window.speechSynthesis.getVoices();
          window.speechSynthesis.onvoiceschanged = () => {
            this.cachedVoices = window.speechSynthesis.getVoices();
          };
        }
      } catch {
        this.muted = false;
        this.voiceEnabled = true;
        this.voiceMode = 'both';
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    try {
      localStorage.setItem('campusiq_audio_feedback_muted', mute ? 'true' : 'false');
    } catch {}
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled && !this.muted;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    try {
      localStorage.setItem('campusiq_voice_enabled', enabled ? 'true' : 'false');
    } catch {}
  }

  public toggleVoice(): boolean {
    this.setVoiceEnabled(!this.voiceEnabled);
    return this.voiceEnabled;
  }

  public getVoiceMode(): VoiceAnnouncementMode {
    return this.voiceMode;
  }

  public setVoiceMode(mode: VoiceAnnouncementMode) {
    this.voiceMode = mode;
    try {
      localStorage.setItem('campusiq_voice_mode', mode);
    } catch {}
  }

  private activeUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Cleans roll numbers for smooth, intelligible speech synthesis.
   * e.g., '241FA04001' becomes '2 4 1, F A, 0 4 0 0 1'
   * e.g., 'STU-2024-001' becomes 'S T U, 2 0 2 4, 0 0 1'
   */
  public formatRollNumberForSpeech(rollNumber: string): string {
    if (!rollNumber) return '';
    const clean = rollNumber.trim().toUpperCase();

    // Check if format matches 241FA04001 / 241FAO4001 pattern
    const collegeRollMatch = clean.match(/^(\d{3})([A-Z]{2})([0-9A-Z]{4,6})$/);
    if (collegeRollMatch) {
      const p1 = collegeRollMatch[1].split('').join(' ');
      const p2 = collegeRollMatch[2].split('').join(' ');
      const p3 = collegeRollMatch[3].split('').join(' ');
      return `${p1}, ${p2}, ${p3}`;
    }

    return clean
      .replace(/-/g, ' ')
      .replace(/([A-Z]+)/g, ' $1 ')
      .replace(/([0-9])/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Real-time Voice Announcement: announces student name, roll number, or both automatically upon scan.
   */
  public speakAttendanceMarked(
    studentName?: string,
    rollNumber?: string,
    overrideMode?: VoiceAnnouncementMode
  ): string {
    if (this.muted || !this.voiceEnabled) return '';
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return '';

    try {
      const mode = overrideMode || this.voiceMode;
      const cleanRoll = rollNumber ? this.formatRollNumberForSpeech(rollNumber) : '';
      let spokenText = '';

      const trimmedName = studentName?.trim() || '';

      if (mode === 'roll') {
        if (cleanRoll) {
          spokenText = `Roll number ${cleanRoll}, Present.`;
        } else if (trimmedName) {
          spokenText = `${trimmedName}, Present.`;
        } else {
          spokenText = 'Attendance marked Present.';
        }
      } else if (mode === 'name') {
        if (trimmedName) {
          spokenText = `${trimmedName}, Present.`;
        } else if (cleanRoll) {
          spokenText = `Roll number ${cleanRoll}, Present.`;
        } else {
          spokenText = 'Attendance marked Present.';
        }
      } else {
        // Mode 'both': announce both Student Name and Roll Number
        if (trimmedName && cleanRoll) {
          spokenText = `${trimmedName}. Roll number ${cleanRoll}. Present.`;
        } else if (trimmedName) {
          spokenText = `${trimmedName}, Present.`;
        } else if (cleanRoll) {
          spokenText = `Roll number ${cleanRoll}, Present.`;
        } else {
          spokenText = 'Attendance marked Present.';
        }
      }

      // Safe utterance creation
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 0.96;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      // Keep utterance in global and instance references to prevent Chrome GC bug
      this.activeUtterance = utterance;
      if (typeof window !== 'undefined') {
        (window as any).__campusiq_utterance = utterance;
      }

      utterance.onend = () => {
        this.activeUtterance = null;
        if (typeof window !== 'undefined') {
          (window as any).__campusiq_utterance = null;
        }
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis playback error:', e);
        this.activeUtterance = null;
      };

      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find(
          v =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('David') ||
              v.name.includes('Daniel') ||
              v.name.includes('English'))
        ) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      // Cancel any ongoing speaking safely and dispatch with brief delay to avoid Chrome cancel bug
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }

      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (speakErr) {
          console.warn('speechSynthesis.speak error:', speakErr);
        }
      }, 35);

      return spokenText;
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
      return '';
    }
  }

  /**
   * Universal announcement for any scanned QR code / NFC tag / Barcode.
   * Automatically extracts student name & roll number from verification payload and speaks immediately.
   */
  public announceScan(result: { student?: any; data?: any; type?: string; message?: string }): string {
    if (this.muted || !this.voiceEnabled) return '';

    const student = result.student || result.data?.student || (result.data?.rollNumber ? result.data : null);
    const studentName = student?.name || student?.studentName || result.data?.studentName || '';
    const rollNumber = student?.rollNumber || result.data?.rollNumber || student?.id || '';

    if (studentName || rollNumber) {
      return this.speakAttendanceMarked(studentName, rollNumber);
    } else if (result.data?.title || result.data?.name) {
      const title = result.data.title || result.data.name;
      this.speakText(`${title}, Verified.`);
      return `${title}, Verified.`;
    } else if (result.message) {
      this.speakText(result.message);
      return result.message;
    }
    return '';
  }

  public speakText(text: string) {
    if (this.muted || !this.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      this.activeUtterance = utterance;
      if (typeof window !== 'undefined') {
        (window as any).__campusiq_utterance = utterance;
      }
      utterance.onend = () => {
        this.activeUtterance = null;
      };

      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (voice) utterance.voice = voice;

      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch {}
      }, 35);
    } catch (err) {
      console.warn('speakText error:', err);
    }
  }

  /**
   * Realistic Contactless NFC SmartCard reader sound (ISO 14443A POS / Turnstile beep).
   * Generates a rapid carrier detection chirp (2093 Hz - C7) followed by an uplifting confirmation chime (2637 Hz - E7).
   */
  public playNfcBeepSound() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const executeBeep = () => {
      try {
        const now = ctx.currentTime;

        // Note 1: Immediate high-purity NFC chip detection blip (2093 Hz - C7)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2093.0, now);

        gain1.gain.setValueAtTime(0.0001, now);
        gain1.gain.linearRampToValueAtTime(0.35, now + 0.015);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.1);

        // Note 2: Secondary resonant harmonic (2637 Hz - E7) — classic NFC turnstile signature
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2637.0, now + 0.07);

        gain2.gain.setValueAtTime(0.0001, now + 0.07);
        gain2.gain.linearRampToValueAtTime(0.38, now + 0.085);
        gain2.gain.exponentialRampToValueAtTime(0.00001, now + 0.32);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(now + 0.07);
        osc2.stop(now + 0.35);
      } catch (err) {
        console.warn('NFC audio feedback playback failed:', err);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(executeBeep).catch(executeBeep);
    } else {
      executeBeep();
    }
  }

  /**
   * Subtle, crisp high-tone chime indicating verified credentials or pass.
   * Chime 1: C6 (1046.5 Hz) -> Chime 2: E6 (1318.5 Hz) with gentle exponential decay.
   */
  public playSuccessSound() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Note 1: 1046.5 Hz (C6)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.18);

      // Note 2: 1318.5 Hz (E6) - harmonious, uplifting resolution
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.08);

      gain2.gain.setValueAtTime(0.0001, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.22, now + 0.095);
      gain2.gain.exponentialRampToValueAtTime(0.00001, now + 0.36);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.08);
      osc2.stop(now + 0.38);
    } catch (err) {
      console.warn('Audio feedback playback failed:', err);
    }
  }

  /**
   * Subtle, warm double reject buzz for invalid, expired, revoked, or unauthenticated tokens.
   * Pulse 1: 220Hz -> 160Hz, Pulse 2: 180Hz -> 130Hz
   */
  public playErrorSound() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // First pulse: 220Hz descending to 160Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(160, now + 0.12);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.14);

      // Second pulse: 180Hz descending to 130Hz
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(180, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(130, now + 0.28);

      gain2.gain.setValueAtTime(0.0001, now + 0.14);
      gain2.gain.linearRampToValueAtTime(0.2, now + 0.155);
      gain2.gain.exponentialRampToValueAtTime(0.00001, now + 0.34);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.14);
      osc2.stop(now + 0.36);
    } catch (err) {
      console.warn('Audio feedback playback failed:', err);
    }
  }

  /**
   * Real-Time Digital POS Terminal & Payment Confirmation Chime.
   * Signature 3-tone arpeggio: E6 (1318 Hz) -> G#6 (1661 Hz) -> B6 (1975 Hz) with gentle resonance.
   */
  public playPaymentSuccessSound() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 1318.51, start: 0, dur: 0.12 },
        { freq: 1661.22, start: 0.08, dur: 0.14 },
        { freq: 1975.53, start: 0.17, dur: 0.35 }
      ];

      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.linearRampToValueAtTime(0.3, now + start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });
    } catch (err) {
      console.warn('Payment success sound playback failed:', err);
    }
  }

  /**
   * Voice announcement for completed real-time payment.
   */
  public announcePaymentSuccess(orderNumber: string, amount: number, method?: string) {
    if (this.muted || !this.voiceEnabled) return;
    const cleanNum = orderNumber.replace('#', 'Order ');
    const methodStr = method ? ` via ${method}` : '';
    this.speakText(`Payment of $${amount.toFixed(2)}${methodStr} confirmed. ${cleanNum} placed successfully.`);
  }
}

export const audioFeedback = new AudioFeedbackService();
