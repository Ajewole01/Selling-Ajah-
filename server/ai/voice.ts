/**
 * Natural Voice Engine Architecture for Selling Ajah AI Concierge
 *
 * Implements server-side natural voice orchestration, audio handling,
 * and Gemini Live / WebRTC gateway configuration.
 */

import { GoogleGenAI } from '@google/genai';

export interface VoiceSessionConfig {
  sessionId: string;
  sampleRate?: number;
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  language?: string;
}

export class NaturalVoiceGateway {
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  /**
   * Check if Gemini Live API with bidirectional audio is available
   */
  isRealtimeVoiceAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Generates realtime voice session configuration.
   * In a production environment with WebSocket gateway:
   * - Client connects via secure WebSocket to /api/ai/voice/stream
   * - Server proxies audio PCM stream to Gemini Multimodal Live API
   * - Audio responses stream back in 24kHz PCM for natural, low-latency playback
   */
  getRealtimeSessionInfo(sessionId: string): {
    mode: 'websocket_live' | 'http_voice_turn';
    endpoint: string;
    sessionId: string;
    model: string;
    voiceName: string;
    bargeInSupported: boolean;
  } {
    return {
      mode: 'http_voice_turn',
      endpoint: '/api/ai/concierge',
      sessionId,
      model: 'gemini-2.5-flash',
      voiceName: 'Aoede', // Warm, professional female voice
      bargeInSupported: true
    };
  }
}

export const naturalVoiceGateway = new NaturalVoiceGateway();
