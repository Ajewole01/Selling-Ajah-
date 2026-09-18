import { processConciergeTurn } from './ai/orchestrator.js';
import { ChatCard, Property, ServicedApartment, LuxuryVehicle } from '../src/types.js';

export interface AiChatInput {
  message: string;
  history?: Array<{ sender: 'user' | 'assistant'; text: string }>;
  userContactInfo?: { name?: string; phone?: string; email?: string };
  channel?: 'chat' | 'voice' | 'phone';
  sessionId?: string;
}

export interface AiChatResponse {
  reply: string;
  cards?: ChatCard[];
  actionButtons?: { label: string; action: string; value?: string }[];
  leadCaptured?: boolean;
  handoffRequested?: boolean;
  conversationId?: string;
  referenceNumber?: string;
}

export async function processAiMessage(input: AiChatInput): Promise<AiChatResponse> {
  const result = await processConciergeTurn({
    message: input.message,
    channel: input.channel || 'chat',
    sessionId: input.sessionId,
    history: input.history,
    userContactInfo: input.userContactInfo
  });

  return {
    reply: result.reply,
    cards: result.cards,
    actionButtons: result.actionButtons,
    leadCaptured: result.leadCaptured,
    handoffRequested: result.handoffRequested,
    conversationId: result.conversationId,
    referenceNumber: result.referenceNumber
  };
}

