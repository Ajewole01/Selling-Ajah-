import { processConciergeTurn } from '../ai/orchestrator.js';
import * as repo from '../repositories/index.js';

export interface TelephonyIncomingPayload {
  CallSid?: string;
  From?: string;
  To?: string;
  SpeechResult?: string;
  CallStatus?: string;
  Duration?: string;
}

export class TelephonyAdapter {
  /**
   * Generates initial TwiML when an incoming call connects to Selling Ajah phone number.
   */
  public async handleIncomingCall(params: TelephonyIncomingPayload): Promise<string> {
    const caller = params.From || 'Unknown Caller';
    const settings = await repo.getAiConciergeSettings();
    const siteSettings = await repo.getSettings();

    // Log start of call conversation
    if (params.CallSid) {
      await repo.saveConversation({
        id: `tel-${params.CallSid}`,
        channel: 'phone',
        customerPhone: caller,
        intent: 'Incoming Voice Call',
        outcome: 'ongoing',
        summary: `Call initiated from ${caller}.`,
        messageCount: 1,
        startedAt: new Date().toISOString()
      });
    }

    const greeting = settings.phoneGreeting ||
      "Thank you for calling Selling Ajah. You are speaking with Selling Ajah's AI Concierge. I can assist with property inquiries, serviced shortlets, or taking an inspection request. How can I direct your inquiry today?";

    // Returns standard TwiML XML with speech gathering
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/telephony/gather" method="POST" speechTimeout="auto" timeout="4" language="en-NG">
    <Say voice="Polly.Ayanda" language="en-ZA">${escapeXml(greeting)}</Say>
  </Gather>
  <Say voice="Polly.Ayanda" language="en-ZA">We did not hear a response. Transferring you to our office desk now.</Say>
  <Dial>${escapeXml(siteSettings.phone || '+2348109012192')}</Dial>
</Response>`;
  }

  /**
   * Processes speech gathered from the caller, runs it through the AI Orchestrator,
   * and returns the spoken reply or dials the human executive line.
   */
  public async handleSpeechGather(params: TelephonyIncomingPayload): Promise<string> {
    const caller = params.From || '';
    const speech = params.SpeechResult || '';
    const callSid = params.CallSid || `tel-${Date.now()}`;
    const siteSettings = await repo.getSettings();

    if (!speech.trim()) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/telephony/gather" method="POST" speechTimeout="auto" timeout="5" language="en-NG">
    <Say voice="Polly.Ayanda" language="en-ZA">I didn't quite catch that. Could you please repeat how I may assist you?</Say>
  </Gather>
  <Dial>${escapeXml(siteSettings.phone || '+2348109012192')}</Dial>
</Response>`;
    }

    // Call Central AI Concierge Orchestrator in phone mode
    const aiResult = await processConciergeTurn({
      message: speech,
      channel: 'phone',
      sessionId: `tel-${callSid}`,
      userContactInfo: { phone: caller }
    });

    // Check if human handoff requested or call should be transferred
    if (aiResult.handoffRequested || /speak to human|transfer me|operator|agent/i.test(speech)) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ayanda" language="en-ZA">Certainly. Connecting you to our office now. Please hold.</Say>
  <Dial callerId="${escapeXml(params.To || siteSettings.phone || '+2348109012192')}">${escapeXml(siteSettings.phone || '+2348109012192')}</Dial>
</Response>`;
    }

    // Spoken reply with follow-up gather
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/telephony/gather" method="POST" speechTimeout="auto" timeout="5" language="en-NG">
    <Say voice="Polly.Ayanda" language="en-ZA">${escapeXml(aiResult.reply)}</Say>
  </Gather>
  <Say voice="Polly.Ayanda" language="en-ZA">Thank you for calling Selling Ajah. Have a wonderful day.</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Handles call status callbacks (completed, busy, no-answer, duration).
   */
  public async handleCallStatus(params: TelephonyIncomingPayload): Promise<void> {
    if (!params.CallSid) return;
    const duration = params.Duration ? `${params.Duration} seconds` : 'Completed';
    await repo.saveConversation({
      id: `tel-${params.CallSid}`,
      channel: 'phone',
      endedAt: new Date().toISOString(),
      summary: `Phone call ended. Status: ${params.CallStatus || 'completed'}. Duration: ${duration}.`
    });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export const telephonyAdapter = new TelephonyAdapter();
