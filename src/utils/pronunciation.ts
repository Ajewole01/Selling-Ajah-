/**
 * Nigerian Pronunciation Lexicon & Speech Utilities
 *
 * Provides phonetic transliteration specifically for browser Text-to-Speech (TTS)
 * engines (Google, Microsoft, Apple, Web Speech API) so that local Nigerian locations,
 * entities, titles, and proper nouns are pronounced accurately and naturally.
 *
 * CRITICAL: This phonetic transformation MUST ONLY be applied to the spoken utterance
 * string passed to SpeechSynthesis. The visual UI text remains standard, professional English.
 */

export const NIGERIAN_PHONETIC_LEXICON: Record<string, string> = {
  // Key Locations
  'Ajah': 'Ah-jah',
  'ajah': 'ah-jah',
  'Lekki': 'Leh-kee',
  'lekki': 'leh-kee',
  'Sangotedo': 'Sahn-go-teh-doh',
  'sangotedo': 'sahn-go-teh-doh',
  'Ikota': 'Ee-koh-tah',
  'ikota': 'ee-koh-tah',
  'Abraham Adesanya': 'Abraham Ah-deh-sahn-yah',
  'abraham adesanya': 'Abraham Ah-deh-sahn-yah',
  'Adesanya': 'Ah-deh-sahn-yah',
  'adesanya': 'ah-deh-sahn-yah',
  'Chevron': 'Shev-ron',
  'chevron': 'shev-ron',
  'Eti-Osa': 'Eh-tee Oh-sah',
  'eti-osa': 'eh-tee oh-sah',
  'Eti Osa': 'Eh-tee Oh-sah',
  'VGC': 'Victoria Garden City',
  'Badore': 'Bah-doh-reh',
  'badore': 'bah-doh-reh',
  'Ogombo': 'Oh-gom-boh',
  'ogombo': 'oh-gom-boh',
  'Awoyaya': 'Ah-woh-yah-yah',
  'awoyaya': 'ah-woh-yah-yah',
  'Alausa': 'Ah-lah-oo-sah',
  'Ikeja': 'Ee-keh-jah',

  // People & Brands
  'Chisom Chiejina': 'Chee-som Chee-eh-jee-nah',
  'chisom chiejina': 'Chee-som Chee-eh-jee-nah',
  'Chisom': 'Chee-som',
  'Chiejina': 'Chee-eh-jee-nah',
  'DOLYN': 'Doh-lin',
  'Dolyn': 'Doh-lin',
  'Selling Ajah': 'Selling Ah-jah',

  // Titles & Regulatory
  'SCUML': 'S C U M L',
  'LASRERA': 'Lahs-reh-rah',
  'REDAN': 'Reh-dan',
  'C of O': 'Certificate of Occupancy',
  'C-of-O': 'Certificate of Occupancy'
};

/**
 * Prepares raw text for natural browser voice synthesis:
 * 1. Strips markdown bold, italic, code, headers, bullets.
 * 2. Formats Naira currency to natural speech (e.g. ₦50,000,000 -> 50 million Naira).
 * 3. Removes Markdown hyperlinks, leaving only the label.
 * 4. Applies Nigerian phonetic replacements for place names and names.
 */
export function formatTextForSpeech(text: string): string {
  if (!text) return '';

  let speech = text;

  // 1. Remove markdown links [Label](url) -> Label
  speech = speech.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 2. Remove markdown code blocks & inline code
  speech = speech.replace(/```[\s\S]*?```/g, '');
  speech = speech.replace(/`([^`]+)`/g, '$1');

  // 3. Remove markdown headers, bold, italics, strikethrough, blockquotes
  speech = speech.replace(/^[#\s>*-]+/gm, ' ');
  speech = speech.replace(/[*_~]/g, '');

  // 4. Handle currency ₦ or NGN
  speech = speech.replace(/₦\s*([0-9,.]+)\s*(?:million|m)\b/gi, '$1 million Naira');
  speech = speech.replace(/₦\s*([0-9,.]+)\s*(?:billion|b)\b/gi, '$1 billion Naira');
  speech = speech.replace(/₦\s*([0-9,.]+)/g, '$1 Naira');
  speech = speech.replace(/\bNGN\s*([0-9,.]+)/gi, '$1 Naira');

  // 5. Clean up bullet points, excess whitespace, and weird dashes
  speech = speech.replace(/[•●▪■]/g, ', ');
  speech = speech.replace(/\s*\|\s*/g, ', ');
  speech = speech.replace(/\s+/g, ' ').trim();

  // 6. Apply phonetic lexicon replacement (word boundary safe)
  for (const [term, phonetic] of Object.entries(NIGERIAN_PHONETIC_LEXICON)) {
    // Escape any regex characters in term
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    speech = speech.replace(regex, phonetic);
  }

  return speech;
}

/**
 * Detects the best English voice from browser speechSynthesis.
 * Prioritizes Nigerian English (en-NG) and African voices,
 * then falls back to natural/neural English voices.
 */
export function getBestSpeechVoice(voices: SpeechSynthesisVoice[]): {
  voice: SpeechSynthesisVoice | null;
  tier: 'nigerian' | 'african' | 'natural_female' | 'british' | 'general';
} {
  if (!voices || voices.length === 0) {
    return { voice: null, tier: 'general' };
  }

  // Tier 1: True Nigerian English voice
  const nigerianVoice = voices.find(v =>
    v.lang === 'en-NG' ||
    v.lang.toLowerCase().startsWith('en-ng') ||
    /nigeria/i.test(v.name)
  );
  if (nigerianVoice) {
    return { voice: nigerianVoice, tier: 'nigerian' };
  }

  // Tier 2: African regional voices (e.g. South African, Kenyan, Ghanaian, or African female names)
  const africanVoice = voices.find(v =>
    v.lang.toLowerCase().startsWith('en-za') ||
    v.lang.toLowerCase().startsWith('en-ke') ||
    v.lang.toLowerCase().startsWith('en-gh') ||
    /amina|chiamaka|zola/i.test(v.name)
  );
  if (africanVoice) {
    return { voice: africanVoice, tier: 'african' };
  }

  // Tier 3: Natural / Neural high quality female voice
  const naturalFemaleVoice = voices.find(v =>
    /natural|neural|premium/i.test(v.name) &&
    /female|libby|sonia|jenny|aria|samantha/i.test(v.name)
  );
  if (naturalFemaleVoice) {
    return { voice: naturalFemaleVoice, tier: 'natural_female' };
  }

  // Tier 4: Clear British / Commonwealth voice
  const commonwealthVoice = voices.find(v =>
    v.lang.toLowerCase().startsWith('en-gb') ||
    v.name.includes('Google UK English Female') ||
    v.name.includes('Victoria') ||
    v.name.includes('Karen')
  );
  if (commonwealthVoice) {
    return { voice: commonwealthVoice, tier: 'british' };
  }

  // Fallback: Any English voice
  const fallbackEnglish = voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
  return { voice: fallbackEnglish, tier: 'general' };
}
