import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage, ChatCard, ChatActionButton } from '../types';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowUpRight,
  MessageSquare,
  Building2,
  Car,
  Key,
  Calendar,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/formatters';

export const AiAssistantModal: React.FC = () => {
  const { isAiModalOpen, closeAiModal, aiInitialPrompt, navigate, settings, addToast } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Welcome to Selling Ajah Concierge. I am your private advisor for real estate and executive lifestyle acquisitions across the Lekki Peninsula corridor.

I can assist with:
• Sourcing off-market and verified duplexes for sale or lease
• Locating serviced shortlet penthouses with 24/7 power & security
• Reserving chauffeured executive luxury vehicles (Mercedes G63, Range Rover)
• Coordinating direct private inspections with our senior partners`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionButtons: [
        { label: '4-Bed Duplex under ₦150M', action: 'query', value: 'Find me a 4 bedroom duplex in Ajah under 150 million' },
        { label: 'Luxury Serviced Shortlets', action: 'query', value: 'I need a luxury shortlet with 24/7 electricity' },
        { label: 'Executive Fleet / G-Wagon', action: 'query', value: 'Do you have a Mercedes G63 AMG available for hire?' },
        { label: 'WhatsApp Private Desk', action: 'whatsapp', value: settings.whatsapp }
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAiModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);

      if (aiInitialPrompt) {
        sendMessage(aiInitialPrompt);
      }
    }
  }, [isAiModalOpen, aiInitialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isAiModalOpen) return null;

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: messages.slice(-4).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'asst-' + Date.now(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        listingCards: data.cards,
        actionButtons: data.actionButtons
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'asst-' + Date.now(),
          sender: 'assistant',
          text: `I'm currently unable to access the portfolio database. You can connect with our senior advisor directly on WhatsApp at ${settings.whatsapp} for immediate private guidance!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons: [
            { label: 'Chat on WhatsApp', action: 'whatsapp', value: settings.whatsapp }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card: ChatCard) => {
    closeAiModal();
    if (card.type === 'property') {
      navigate(`/properties/${card.slug}`);
    } else if (card.type === 'shortlet' || card.type === 'apartment') {
      navigate(`/shortlets/${card.slug}`);
    } else if (card.type === 'car' || card.type === 'vehicle') {
      navigate(`/cars/${card.slug}`);
    }
  };

  const handleActionClick = (btn: ChatActionButton) => {
    if (btn.action === 'query') {
      sendMessage(btn.value);
    } else if (btn.action === 'whatsapp') {
      const url = formatWhatsAppUrl(btn.value, "Hello Selling Ajah Concierge, I'd like to consult on verified properties.");
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (btn.action === 'navigate') {
      closeAiModal();
      navigate(btn.value);
    } else if (btn.action === 'call') {
      window.location.href = `tel:${btn.value}`;
    } else if (btn.action === 'lead') {
      setShowLeadForm(true);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) {
      addToast('Please provide your name and WhatsApp contact.', 'error');
      return;
    }

    setLeadSubmitting(true);
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          email: leadEmail || 'concierge-lead@sellingajah.com',
          whatsapp: leadPhone,
          service: 'consultation',
          message: `Concierge Chatbot Lead: Requested callback from senior advisor. Last user query: "${messages.filter(m => m.sender === 'user').pop()?.text || 'Portfolio search'}"`
        })
      });

      addToast('Thank you! Our advisory team will reach out to you.', 'success');
      setShowLeadForm(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'asst-lead-done-' + Date.now(),
          sender: 'assistant',
          text: `Thank you, ${leadName}! Your request has been forwarded to our Senior Acquisition Advisor. We will contact you at ${leadPhone} shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      addToast('Error submitting info. Please use WhatsApp.', 'error');
    } finally {
      setLeadSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
    <div
        className="sa-concierge-modal w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-[#0E0E0E] border border-black/10 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] sm:h-[84vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Editorial Header */}
        <div className="p-4 sm:p-5 border-b border-black/8 dark:border-white/10 bg-neutral-50 dark:bg-[#080808] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  Selling Ajah Concierge
                </h3>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-white/50 font-light">
                Private Real Estate & Lifestyle Advisory Desk
              </p>
            </div>
          </div>

          <button
            id="close-ai-assistant-btn"
            onClick={closeAiModal}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#D4AF37]">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Text bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#D4AF37] text-black font-semibold rounded-tr-none shadow-md shadow-[#D4AF37]/15'
                        : 'bg-neutral-100 dark:bg-[#161616] text-neutral-800 dark:text-neutral-200 border border-black/5 dark:border-white/10 rounded-tl-none whitespace-pre-line font-light'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-white/40 mt-1 px-1">
                    {msg.timestamp}
                  </span>

                  {/* Interactive Property / Apartment / Vehicle Cards inside chat */}
                  {msg.listingCards && msg.listingCards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 w-full">
                      {msg.listingCards.map(card => (
                        <div
                          key={card.id}
                          onClick={() => handleCardClick(card)}
                          className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 hover:border-[#D4AF37] rounded-2xl overflow-hidden cursor-pointer group transition-all shadow-md flex flex-col"
                        >
                          <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
                            <img
                              src={card.image}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 bg-black/85 text-[10px] uppercase font-bold text-[#D4AF37] px-2 py-0.5 rounded font-mono">
                              {card.type}
                            </div>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <h5 className="font-serif text-xs font-bold text-neutral-900 dark:text-white group-hover:text-[#D4AF37] line-clamp-1 mb-1">
                                {card.title}
                              </h5>
                              <p className="text-[10px] text-neutral-500 dark:text-white/50 truncate mb-1">
                                {card.location}
                              </p>
                              {card.details && (
                                <p className="text-[10px] text-neutral-400 dark:text-white/40 truncate mb-2 font-mono">
                                  {card.details}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
                              <span className="text-xs font-bold text-[#D4AF37] font-mono">
                                {card.formattedPrice}
                              </span>
                              <span className="text-[10px] text-neutral-600 dark:text-neutral-300 flex items-center gap-0.5 font-medium">
                                View <ArrowUpRight className="w-3 h-3 text-[#D4AF37]" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Suggestion Buttons */}
                  {msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(btn)}
                          className="text-[11px] bg-white hover:bg-neutral-50 dark:bg-[#161616] dark:hover:bg-[#202020] text-neutral-800 dark:text-[#D4AF37] px-3.5 py-1.5 rounded-full border border-black/10 dark:border-[#D4AF37]/30 transition-all shadow-sm font-mono cursor-pointer"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#D4AF37]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37]">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-neutral-100 dark:bg-[#161616] text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                <span>Consulting verified Ajah inventory...</span>
              </div>
            </div>
          )}

          {/* Inline Lead Capture Box */}
          {showLeadForm && (
            <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-[#111111] border border-[#D4AF37]/40 shadow-xl my-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  Request Private Advisor Callback
                </h4>
                <button
                  onClick={() => setShowLeadForm(false)}
                  className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  className="w-full bg-white dark:bg-[#080808] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp Phone"
                    value={leadPhone}
                    onChange={e => setLeadPhone(e.target.value)}
                    className="w-full bg-white dark:bg-[#080808] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={leadEmail}
                    onChange={e => setLeadEmail(e.target.value)}
                    className="w-full bg-white dark:bg-[#080808] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="w-full py-3 px-4 rounded-full bg-[#D4AF37] hover:bg-[#c49f2f] text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 font-mono cursor-pointer"
                >
                  {leadSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Connect With Advisor</span>
                </button>
              </form>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-black/8 dark:border-white/10 bg-neutral-50 dark:bg-[#080808]">
          <form
            onSubmit={e => {
              e.preventDefault();
              sendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Inquire on duplexes, shortlets, or luxury mobility..."
              className="flex-1 bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 outline-none focus:border-[#D4AF37] transition-colors"
            />
            <button
              id="send-ai-message-btn"
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2f] disabled:opacity-40 disabled:hover:bg-[#D4AF37] text-black transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-neutral-500 dark:text-white/50">
            <span className="font-mono">Selling Ajah Concierge Intelligence</span>
            <button
              onClick={() => {
                const url = formatWhatsAppUrl(settings.whatsapp, "Hello Selling Ajah, I'd like to speak with an advisor directly.");
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <MessageSquare className="w-3 h-3" /> WhatsApp Live Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
