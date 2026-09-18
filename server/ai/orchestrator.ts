import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import * as repo from '../repositories/index.js';
import { GEMINI_TOOL_DECLARATIONS, executeTool, propertyToCard, apartmentToCard, vehicleToCard, formatNaira } from './tools.js';
import { getSystemPrompt } from './prompts.js';
import type { ChatCard, ChatActionButton, AiConversationRecord } from '../../src/types.js';
import {
  parseMoneyAmount,
  extractAttributes,
  resolveListingReference,
  classifyTurnIntent,
  getOrCreateSession,
  saveSession,
  ConversationSession
} from './sessionState.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'selling-ajah-ai-concierge',
        },
      },
    });
  }
  return aiClient;
}

export interface OrchestratorInput {
  message: string;
  channel?: 'chat' | 'voice' | 'phone';
  sessionId?: string;
  history?: Array<{ sender: 'user' | 'assistant' | 'system'; text: string }>;
  userContactInfo?: { name?: string; phone?: string; email?: string };
}

export interface OrchestratorOutput {
  reply: string;
  cards?: ChatCard[];
  actionButtons?: ChatActionButton[];
  leadCaptured?: boolean;
  handoffRequested?: boolean;
  conversationId: string;
  channel: 'chat' | 'voice' | 'phone';
  referenceNumber?: string;
  lastResultIds?: string[];
  selectedListingId?: string;
}

export async function processConciergeTurn(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const channel = input.channel || 'chat';
  const userText = (input.message || '').trim();
  const lower = userText.toLowerCase();
  const convId = input.sessionId || 'conv-' + Date.now();
  const settings = await repo.getSettings();

  // 1. Retrieve or initialize multi-turn session state
  const session = getOrCreateSession(convId, channel);

  // 2. Extract contact information if present
  const emailMatch = userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = userText.match(/(?:\+?234|0)[789]\d{9}/);

  let leadCaptured = false;
  let customerName = input.userContactInfo?.name;
  let customerPhone = input.userContactInfo?.phone || (phoneMatch ? phoneMatch[0] : undefined);

  if (emailMatch || phoneMatch || input.userContactInfo) {
    leadCaptured = true;
    if (!customerName) {
      const nameMatch = userText.match(/(?:my name is|i am|this is|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      customerName = nameMatch ? nameMatch[1] : undefined;
    }
  }

  // 3. Classify turn intent & resolve references
  const turnIntent = classifyTurnIntent(userText, session);
  const isHumanHandoff = turnIntent.action === 'HANDOFF';

  // 4. MULTI-TURN INSPECTION GATHERING FLOW
  // If the session was already actively collecting inspection details (date, time, contact)
  if (session.flowState && session.flowState !== 'idle' && session.flowType === 'inspection') {
    const draft = session.draftBooking || {};

    if (session.flowState === 'awaiting_date') {
      // User is providing inspection date
      draft.preferredDate = userText.replace(/^(on|for|prefer)\s+/i, '').trim();
      session.draftBooking = draft;
      session.flowState = 'awaiting_time';
      saveSession(session);

      const reply = `Got it, ${draft.preferredDate}. What time of day works best for you (for example: 10:00 AM, 2:00 PM)?`;
      return {
        reply,
        conversationId: convId,
        channel,
        selectedListingId: session.selectedListingId
      };
    }

    if (session.flowState === 'awaiting_time') {
      // User is providing inspection time
      draft.preferredTime = userText.replace(/^(at|around|by)\s+/i, '').trim();
      session.draftBooking = draft;

      if (!customerPhone && !draft.customerPhone) {
        session.flowState = 'awaiting_contact';
        saveSession(session);
        const reply = `Understood, ${draft.preferredTime}. To finalize your inspection request, please provide your name and phone number (or WhatsApp).`;
        return {
          reply,
          conversationId: convId,
          channel,
          selectedListingId: session.selectedListingId
        };
      }
      // If contact is already known, proceed to creation below
      session.flowState = 'confirming';
    }

    if (session.flowState === 'awaiting_contact' || session.flowState === 'confirming') {
      if (customerPhone) draft.customerPhone = customerPhone;
      if (customerName) draft.customerName = customerName;

      // Also try to extract from current turn text if not captured yet
      if (!draft.customerPhone && phoneMatch) draft.customerPhone = phoneMatch[0];
      if (!draft.customerName) {
        const nameMatch = userText.match(/(?:my name is|i am|this is|i'm)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
        if (nameMatch) {
          draft.customerName = nameMatch[1];
        } else {
          // Check for "Name, Phone" format e.g. "Ade, 08012345678"
          const candidateName = userText.replace(/(?:\+?234|0)[789]\d{9}/, '').replace(/[,:-]/g, '').trim();
          if (candidateName && /^[A-Za-z\s]{2,40}$/.test(candidateName)) {
            draft.customerName = candidateName;
          }
        }
      }

      if (!draft.customerPhone) {
        saveSession(session);
        return {
          reply: "Please provide a valid phone or WhatsApp number so our team can reach you to confirm your inspection request.",
          conversationId: convId,
          channel
        };
      }

      // Create inspection request in DB
      const targetTitle = draft.listingTitle || session.selectedListingTitle || 'Ajah Luxury Property';
      const targetId = draft.listingId || session.selectedListingId;

      const insp = await repo.createInspectionRequest({
        type: 'inspection',
        customerName: draft.customerName || 'Prospective Buyer',
        customerPhone: draft.customerPhone,
        customerEmail: draft.customerEmail,
        listingId: targetId,
        listingTitle: targetTitle,
        listingType: 'property',
        preferredDate: draft.preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        preferredTime: draft.preferredTime || '11:00 AM',
        notes: `Scheduled via ${channel} session: "${userText}"`,
        source: channel === 'voice' ? 'AI Voice' : channel === 'phone' ? 'AI Phone' : 'AI Chat'
      });

      // Reset flow and remember inspection reference
      const refNumber = insp.referenceNumber;
      session.flowState = 'idle';
      session.flowType = undefined;
      session.draftBooking = undefined;
      session.lastInspectionRef = refNumber;
      session.lastInspectionTitle = targetTitle;
      saveSession(session);

      const reply = channel === 'voice' || channel === 'phone'
        ? `Your inspection request for ${targetTitle} on ${insp.preferredDate} at ${insp.preferredTime} has been submitted under reference number ${refNumber}. Our team will contact you on ${insp.customerPhone} to confirm the appointment.`
        : `Your inspection request has been submitted under reference **${refNumber}**.\n\n• **Property**: ${targetTitle}\n• **Preferred visit**: ${insp.preferredDate} at ${insp.preferredTime}\n• **Client**: ${insp.customerName} (${insp.customerPhone})\n• **Status**: Pending Confirmation\n\nOur team will contact you to confirm your inspection.`;

      const actionButtons: ChatActionButton[] = [
        { label: `WhatsApp Desk (Ref: ${refNumber})`, action: 'whatsapp', value: settings.whatsapp || '+2348109012192' },
        { label: 'Call Office Line', action: 'call', value: settings.phone || '+2348109012192' }
      ];

      return {
        reply,
        actionButtons,
        conversationId: convId,
        channel,
        referenceNumber: refNumber,
        selectedListingId: targetId
      };
    }
  }

  // 4b. ACKNOWLEDGEMENT / GRATITUDE / CONVERSATIONAL CLOSING (Bug 2)
  if (turnIntent.action === 'ACKNOWLEDGEMENT') {
    let reply = '';
    if (session.lastInspectionRef) {
      reply = "You're welcome! Your inspection request is in. Our team will contact you to confirm it. If you need anything else, I'm here to help.";
    } else if (session.selectedListingId || session.lastResultIds.length > 0) {
      reply = "You're welcome! Let me know if you would like more details, an inspection, or help finding other options.";
    } else if (/\b(?:bye|goodbye|talk later|see ya)\b/i.test(lower)) {
      reply = "You're welcome! Thank you for contacting Selling Ajah. Have a wonderful day!";
    } else {
      reply = "You're welcome! If you need anything else regarding properties, serviced stays, or vehicle rentals in Ajah, I'm here to help.";
    }

    return {
      reply,
      conversationId: convId,
      channel,
      selectedListingId: session.selectedListingId,
      lastResultIds: session.lastResultIds
    };
  }

  // 5. SELECT AND VIEW DETAILS ("Tell me more about the property", "what features does it have?", etc. - Bug 1 & Bug 5)
  if (turnIntent.action === 'SELECT_AND_VIEW') {
    const targetId = turnIntent.resolvedListingId || session.selectedListingId || session.lastResultIds[0];
    if (targetId) {
      const toolRes = await executeTool('get_property_details', { idOrSlug: targetId });
      const propData = toolRes.result;

      if (!propData.error) {
        session.selectedListingId = propData.id;
        session.selectedListingTitle = propData.title;
        session.selectedListingType = 'property';
        saveSession(session);

        const focus = turnIntent.detailFocus || 'all';
        let reply = '';

        if (focus === 'features') {
          const featItems = (propData.features && propData.features.length > 0) ? propData.features : [];
          const amenItems = (propData.amenities && propData.amenities.length > 0) ? propData.amenities : [];
          const combined = Array.from(new Set([...featItems, ...amenItems]));
          if (combined.length > 0) {
            reply = `Here are the documented features and amenities for **${propData.title}** from our database:\n\n` +
              combined.map((f: string) => `• ${f}`).join('\n') +
              `\n\nWould you like to schedule an inspection visit for this property?`;
          } else {
            reply = `**${propData.title}** is recorded as a ${propData.propertyType || 'property'} in ${propData.location} priced at ${propData.price}.\n\nWould you like to schedule an inspection visit?`;
          }
        } else if (focus === 'title') {
          reply = `For **${propData.title}**, the title documented on record in our database is **${propData.titleDocument || 'Documented on record'}**.\n\nWould you like to schedule an inspection visit with our team?`;
        } else if (focus === 'location') {
          reply = `**${propData.title}** is located at **${propData.address || propData.location}** in **${propData.area || 'Ajah'}**.\n\nWould you like to schedule an inspection visit to view the property?`;
        } else if (focus === 'size') {
          const sizeStr = propData.landSize || propData.propertySize;
          if (sizeStr) {
            reply = `**${propData.title}** measures **${sizeStr}**.\n\nWould you like to schedule an inspection visit?`;
          } else {
            reply = `**${propData.title}** is recorded as a ${propData.propertyType || 'property'} in ${propData.location}. Would you like to schedule an inspection visit?`;
          }
        } else {
          // General detail view — constructed strictly from available database fields without inventing details
          const detailsList: string[] = [];
          if (propData.address || propData.location) detailsList.push(`• **Location**: ${propData.address || propData.location}`);
          if (propData.price) detailsList.push(`• **Price**: ${propData.price}`);
          if (propData.propertyType) detailsList.push(`• **Property Type**: ${propData.propertyType}`);
          if (propData.bedrooms && propData.bedrooms > 0) {
            const bathsStr = propData.bathrooms ? `, ${propData.bathrooms} bathrooms` : '';
            detailsList.push(`• **Bedrooms**: ${propData.bedrooms} bedrooms${bathsStr}`);
          }
          if (propData.parkingSpaces && propData.parkingSpaces > 0) {
            detailsList.push(`• **Parking**: ${propData.parkingSpaces} parking spaces`);
          }
          if (propData.landSize) detailsList.push(`• **Land Size**: ${propData.landSize}`);
          else if (propData.propertySize) detailsList.push(`• **Property Size**: ${propData.propertySize}`);
          if (propData.titleDocument) detailsList.push(`• **Title**: ${propData.titleDocument}`);
          if (propData.features && propData.features.length > 0) {
            detailsList.push(`• **Key Features**: ${propData.features.slice(0, 5).join(' • ')}`);
          }
          if (propData.amenities && propData.amenities.length > 0) {
            detailsList.push(`• **Amenities**: ${propData.amenities.slice(0, 5).join(' • ')}`);
          }

          const overview = propData.description ? `\n\n${propData.description}` : '';

          if (channel === 'voice' || channel === 'phone') {
            const sizeMention = propData.landSize || propData.propertySize ? `, measuring ${propData.landSize || propData.propertySize}` : '';
            const bedsMention = propData.bedrooms > 0 ? `, with ${propData.bedrooms} bedrooms` : '';
            reply = `${propData.title} in ${propData.location}. It is priced at ${propData.price}${bedsMention}${sizeMention}, with title ${propData.titleDocument || 'documented on record'}. Would you like to schedule an inspection?`;
          } else {
            reply = `### ${propData.title}\n\n` +
              detailsList.join('\n') +
              overview +
              `\n\nWould you like to schedule an inspection visit for this property?`;
          }
        }

        return {
          reply,
          cards: toolRes.cards,
          actionButtons: [
            { label: 'Request Inspection for This Property', action: 'query', value: `I want to inspect ${propData.title}` },
            { label: 'WhatsApp Representative', action: 'whatsapp', value: settings.whatsapp || '+2348109012192' }
          ],
          conversationId: convId,
          channel,
          selectedListingId: propData.id,
          lastResultIds: session.lastResultIds
        };
      }
    }
  }

  // 6. INITIATE INSPECTION REQUEST ("Can I inspect it?", "I want to inspect")
  if (turnIntent.action === 'INSPECT') {
    const targetId = turnIntent.resolvedListingId || session.selectedListingId || session.lastResultIds[0];
    let targetTitle = session.selectedListingTitle;

    if (targetId && !targetTitle) {
      const all = await repo.getProperties();
      const p = all.find(x => x.id === targetId || x.slug === targetId);
      if (p) {
        targetTitle = p.title;
        session.selectedListingId = p.id;
        session.selectedListingTitle = p.title;
      }
    }

    if (!targetTitle) {
      targetTitle = 'the property';
    }

    // Initialize draft inspection
    session.flowState = 'awaiting_date';
    session.flowType = 'inspection';
    session.draftBooking = {
      listingId: targetId,
      listingTitle: targetTitle,
      listingType: 'property',
      customerName,
      customerPhone
    };
    saveSession(session);

    const reply = channel === 'voice' || channel === 'phone'
      ? `Certainly. I can arrange an inspection request for ${targetTitle}. What date would you prefer for the visit?`
      : `Certainly! I would be delighted to arrange an inspection request for **${targetTitle}**.\n\nWhat date would you prefer for your visit (for example: Saturday, tomorrow, or a specific date)?`;

    return {
      reply,
      actionButtons: [
        { label: 'This Saturday', action: 'query', value: 'This Saturday' },
        { label: 'Tomorrow', action: 'query', value: 'Tomorrow' },
        { label: 'WhatsApp Concierge', action: 'whatsapp', value: settings.whatsapp || '+2348109012192' }
      ],
      conversationId: convId,
      channel,
      selectedListingId: targetId,
      lastResultIds: session.lastResultIds
    };
  }

  // 7. HUMAN HANDOFF
  if (isHumanHandoff) {
    await repo.createEnquiry({
      name: customerName || 'Client Requesting Representative',
      phone: customerPhone || '',
      service: 'consultation',
      message: `Human assistance requested via ${channel}. Message: "${userText}"`
    });

    const reply = channel === 'voice' || channel === 'phone'
      ? `I understand. I am connecting you with our office. You can reach our team directly on WhatsApp or by calling plus two three four, eight one zero, nine zero one, two one nine two.`
      : `I have notified our team. To speak directly with a representative, please click below or contact our office line directly.`;

    return {
      reply,
      actionButtons: [
        { label: 'Connect on WhatsApp Now', action: 'whatsapp', value: settings.whatsapp || '+2348109012192' },
        { label: 'Call Office (+234 810 901 2192)', action: 'call', value: settings.phone || '+2348109012192' }
      ],
      leadCaptured: true,
      handoffRequested: true,
      conversationId: convId,
      channel
    };
  }

  // 8. UPDATE MULTI-TURN CRITERIA
  const extractedAttrs = extractAttributes(userText);
  const parsedBudget = parseMoneyAmount(userText);

  // New attributes override existing ones; omitted attributes are preserved
  if (extractedAttrs.bedrooms !== undefined) session.criteria.bedrooms = extractedAttrs.bedrooms;
  if (extractedAttrs.propertyType !== undefined) session.criteria.propertyType = extractedAttrs.propertyType;
  if (extractedAttrs.area !== undefined) session.criteria.area = extractedAttrs.area;
  if (extractedAttrs.parkingSpaces !== undefined) session.criteria.parkingSpaces = extractedAttrs.parkingSpaces;
  if (extractedAttrs.guests !== undefined) session.criteria.guests = extractedAttrs.guests;
  if (extractedAttrs.rentalDays !== undefined) session.criteria.rentalDays = extractedAttrs.rentalDays;
  if (extractedAttrs.listingType !== undefined) session.criteria.listingType = extractedAttrs.listingType;

  // New budget explicitly overrides old budget
  if (parsedBudget !== undefined) {
    session.criteria.budget = parsedBudget;
    session.criteria.maxPrice = parsedBudget;
    // CRITICAL (Bug 4): Do NOT silently assign listingType ('sale' or 'rent') based solely on budget amount.
    // listingType remains strictly undefined until explicitly specified by user or established by context.
  }

  saveSession(session);

  // 9. CAR / VEHICLE SEARCH
  if (/\b(?:car|vehicle|fleet|suv|sedan|drive|driver)\b/i.test(lower) && !/\b(?:duplex|house|terrace|land|bedroom)\b/i.test(lower)) {
    const vehResult = await executeTool('search_vehicles', { query: userText });
    session.lastResultIds = vehResult.cards?.map(c => c.id) || [];
    session.lastResultType = 'vehicle';
    saveSession(session);

    const reply = channel === 'voice' || channel === 'phone'
      ? `Here are executive rental vehicles from our current database. Inclusions and daily rates are detailed per vehicle. Would you like to submit a booking request for your preferred dates?`
      : `Here are executive rental vehicles available in our active database. Daily rates, specifications, and driver inclusions are specified on each vehicle record.`;

    return {
      reply,
      cards: vehResult.cards,
      actionButtons: [
        { label: 'Request Vehicle Reservation', action: 'query', value: 'I want to submit a vehicle booking request' },
        { label: 'Inquire on WhatsApp', action: 'whatsapp', value: settings.whatsapp || '+2348109012192' }
      ],
      conversationId: convId,
      channel,
      lastResultIds: session.lastResultIds
    };
  }

  // 10. SHORTLET SEARCH
  if (/\b(?:shortlet|apartment|vacation home|stay|night)\b/i.test(lower) && !/\b(?:buy|sale|duplex)\b/i.test(lower)) {
    const aptResult = await executeTool('search_shortlets', {
      area: session.criteria.area,
      bedrooms: session.criteria.bedrooms,
      guests: session.criteria.guests
    });
    session.lastResultIds = aptResult.cards?.map(c => c.id) || [];
    session.lastResultType = 'shortlet';
    saveSession(session);

    const reply = channel === 'voice' || channel === 'phone'
      ? `Here are serviced shortlet apartments from our current database in Ajah and Lekki. Rates, amenities, and house rules are specified on each listing. Would you like to submit a booking request?`
      : `Here are serviced shortlet apartments from our active database in Ajah and Lekki. Documented rates, amenities, and house rules are detailed on each listing record.`;

    return {
      reply,
      cards: aptResult.cards,
      actionButtons: [
        { label: 'Request Shortlet Booking', action: 'query', value: 'I would like to submit a shortlet booking request' },
        { label: 'WhatsApp Concierge', action: 'whatsapp', value: settings.whatsapp || '+2348109012192' }
      ],
      conversationId: convId,
      channel,
      lastResultIds: session.lastResultIds
    };
  }

  // 11. PROPERTY SEARCH (Default core real estate flow)
  // Search with current accumulated session criteria
  const propResult = await executeTool('search_properties', {
    maxPrice: session.criteria.maxPrice,
    minPrice: session.criteria.minPrice,
    bedrooms: session.criteria.bedrooms,
    area: session.criteria.area,
    listingType: session.criteria.listingType,
    keyword: userText
  });

  const cards = propResult.cards || [];
  session.lastResultIds = cards.map(c => c.id);
  session.lastResultType = 'property';
  if (cards.length === 1) {
    session.selectedListingId = cards[0].id;
    session.selectedListingTitle = cards[0].title;
    session.selectedListingType = 'property';
  }
  saveSession(session);

  const matchedCount = propResult.result?.matchedCount || 0;
  const isAlternative = propResult.result?.isAlternativeRecommendation || false;

  // Build descriptive criteria summary (e.g. "4-bedroom in Ajah under ₦200M")
  const criteriaParts: string[] = [];
  if (session.criteria.bedrooms) criteriaParts.push(`${session.criteria.bedrooms}-bedroom`);
  if (session.criteria.propertyType) criteriaParts.push(session.criteria.propertyType.toLowerCase());
  if (session.criteria.area) criteriaParts.push(`in ${session.criteria.area}`);
  if (session.criteria.listingType === 'rent') criteriaParts.push('for rent');
  else if (session.criteria.listingType === 'sale') criteriaParts.push('for sale');
  if (session.criteria.budget) {
    const formattedBudget = session.criteria.budget >= 1_000_000
      ? `around ₦${(session.criteria.budget / 1_000_000).toLocaleString()}M`
      : `around ₦${session.criteria.budget.toLocaleString()}`;
    criteriaParts.push(formattedBudget);
  }

  const criteriaPhrase = criteriaParts.join(' ');

  let reply = '';
  if (matchedCount > 0) {
    if (channel === 'voice' || channel === 'phone') {
      const top = propResult.result.properties[0];
      reply = `I found ${matchedCount} verified property matching your request for ${criteriaPhrase}. The top match is ${top.title} at ${top.price}. Would you like more details or an inspection?`;
    } else {
      reply = `Here are active listings matching your request for **${criteriaPhrase}** from our verified database:\n\n` +
        propResult.result.properties.map((p: any, idx: number) =>
          `${idx + 1}. **${p.title}**\n   • **Price**: ${p.price}\n   • **Location**: ${p.location}\n   • **Title**: ${p.titleDocument}`
        ).join('\n\n') +
        `\n\nTo view full specifications or schedule an inspection, simply reply with the property number or ask about it.`;
    }
  } else {
    // Zero exact matches: clearly label alternatives
    if (channel === 'voice' || channel === 'phone') {
      reply = `I could not find an exact match for ${criteriaPhrase}. However, I found close alternative options in our database. Would you like me to tell you about them?`;
    } else {
      reply = `I could not find an exact active listing for **${criteriaPhrase}**.\n\n` +
        `Here are the closest alternative properties currently available in our verified portfolio:\n\n` +
        propResult.result.properties.map((p: any, idx: number) =>
          `${idx + 1}. **${p.title}**\n   • **Price**: ${p.price}\n   • **Location**: ${p.location}\n   • **Title**: ${p.titleDocument}`
        ).join('\n\n') +
        `\n\nWould you like more details on any of these options, or would you like to adjust your budget or preferred area?`;
    }
  }

  // Persist conversation to DB
  await repo.saveConversation({
    id: convId,
    channel,
    customerName,
    customerPhone,
    intent: isHumanHandoff ? 'Human Escalation' : 'Property Search',
    outcome: leadCaptured ? 'lead_captured' : 'information_provided',
    humanHandoffRequested: isHumanHandoff,
    summary: `User query: "${userText}". Criteria: ${criteriaPhrase}. Found: ${matchedCount}.`,
    messageCount: (input.history?.length || 0) + 1,
    relatedListingIds: session.lastResultIds
  });

  const actionButtons: ChatActionButton[] = [];
  if (!session.criteria.listingType) {
    actionButtons.push(
      { label: 'Looking to Buy', action: 'query', value: 'I want to buy' },
      { label: 'Looking to Rent', action: 'query', value: 'I want to rent' }
    );
  }
  if (cards.length === 1) {
    actionButtons.push(
      { label: 'Tell me more about the property', action: 'query', value: 'Tell me more about the property' },
      { label: 'Request Inspection', action: 'query', value: 'Can I inspect it?' }
    );
  } else {
    actionButtons.push(
      { label: 'Tell me more about the first one', action: 'query', value: 'Tell me more about the first one' },
      { label: 'Request Inspection', action: 'query', value: 'Can I inspect it?' }
    );
  }
  actionButtons.push(
    { label: 'WhatsApp Desk', action: 'whatsapp', value: settings.whatsapp || '+2348109012192' }
  );

  return {
    reply,
    cards,
    actionButtons,
    conversationId: convId,
    channel,
    lastResultIds: session.lastResultIds,
    selectedListingId: session.selectedListingId
  };
}
