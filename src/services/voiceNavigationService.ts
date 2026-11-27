import { NativeModules, Platform } from 'react-native';

class VoiceNavigationService {
  private muted = false;
  private lastSpokenKey: string | null = null;
  private lastSpokenAt = 0;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(nextMuted: boolean): void {
    this.muted = nextMuted;
    if (nextMuted) {
      this.stop();
    }
  }

  public resetSession(): void {
    this.lastSpokenKey = null;
    this.lastSpokenAt = 0;
    this.stop();
  }

  public stop(): void {
    if (Platform.OS === 'web') {
      try {
        const synth = (globalThis as any)?.window?.speechSynthesis;
        synth?.cancel?.();
      } catch {}
      return;
    }

    try {
      const NativeTracking = (NativeModules as any)?.NativeTrackingModule;
      NativeTracking?.stopSpeech?.().catch?.(() => {});
    } catch {}
  }

  public speak(text: string): void {
    if (this.muted || !text.trim()) return;

    if (Platform.OS === 'web') {
      try {
        const win = (globalThis as any)?.window;
        if (win?.speechSynthesis && typeof (globalThis as any).SpeechSynthesisUtterance !== 'undefined') {
          win.speechSynthesis.cancel();
          const utterance = new (globalThis as any).SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          win.speechSynthesis.speak(utterance);
        }
      } catch {}
      return;
    }

    try {
      const NativeTracking = (NativeModules as any)?.NativeTrackingModule;
      NativeTracking?.speakInstruction?.(text).catch?.(() => {});
    } catch {}
  }

  /**
   * Speaks turn-by-turn instruction at appropriate distance thresholds without repeating stale cues.
   */
  public announceManeuver(params: {
    stepIndex: number;
    instruction: string;
    distanceToManeuverMeters: number;
    isArriving?: boolean;
  }): void {
    if (this.muted || !params.instruction) return;

    const { stepIndex, instruction, distanceToManeuverMeters, isArriving } = params;
    if (isArriving) {
      const arrivalKey = `arrive:${stepIndex}`;
      if (this.lastSpokenKey === arrivalKey) return;
      this.lastSpokenKey = arrivalKey;
      this.lastSpokenAt = Date.now();
      this.speak('You have reached your destination.');
      return;
    }

    let tier: 'PREVIEW' | 'UPCOMING' | 'IMMEDIATE' | null = null;
    if (distanceToManeuverMeters <= 70) {
      tier = 'IMMEDIATE';
    } else if (distanceToManeuverMeters <= 300) {
      tier = 'UPCOMING';
    } else if (Date.now() - this.lastSpokenAt > 15_000 || !this.lastSpokenKey?.startsWith(`${stepIndex}:`)) {
      tier = 'PREVIEW';
    }

    if (!tier) return;

    const spokenKey = `${stepIndex}:${tier}:${instruction}`;
    if (this.lastSpokenKey === spokenKey) return;

    this.lastSpokenKey = spokenKey;
    this.lastSpokenAt = Date.now();

    if (tier === 'IMMEDIATE') {
      this.speak(instruction);
    } else if (tier === 'UPCOMING') {
      const rounded = Math.max(50, Math.round(distanceToManeuverMeters / 50) * 50);
      this.speak(`In ${rounded} metres, ${instruction}`);
    } else {
      this.speak(instruction);
    }
  }
}

export const voiceNavigationService = new VoiceNavigationService();
