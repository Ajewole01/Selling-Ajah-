import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage, ChatCard, ChatActionButton, InspectionRequest } from '../types';
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
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Info,
  Clock,
  Compass
} from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/formatters';

export const AiAssistantModal: React.FC = () => {
  const { isAiModalOpen, closeAiModal, aiInitialPrompt, navigate, settings, addToast } = useApp();

  // Mode: 'chat' or 'voice'
  const [activeTab, setActiveTab] = useState<'chat' | 'voice'>('chat');

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Welcome to Selling Ajah Concierge. I am your assistant for property inquiries, serviced shortlets, and vehicle rentals across the Ajah and Lekki corridor.

How may I assist you today?
• Finding properties for sale or rent with verified database records
• Inquiring about serviced shortlet apartments
• Inquiring about rental vehicles
• Submitting an inspection request for any listing`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionButtons: [
        { label: '4-Bed Duplex in Ajah', action: 'query', value: 'Find me a 4 bedroom duplex in Ajah' },
        { label: 'Serviced Shortlets', action: 'query', value: 'Show me available serviced shortlet apartments' },
        { label: 'Vehicle Rentals', action: 'query', value: 'Show me available vehicles for hire' },
        { label: 'Request Property Inspection', action: 'open_inspection_modal', value: 'inspection' },
        { label: 'WhatsApp Representative', action: 'whatsapp', value: settings.whatsapp }
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Inspection booking modal
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionTargetTitle, setInspectionTargetTitle] = useState('Verified Duplex in Ajah');
  const [inspectionTargetId, setInspectionTargetId] = useState<string | undefined>(undefined);
  const [inspName, setInspName] = useState('');
  const [inspPhone, setInspPhone] = useState('');
  const [inspEmail, setInspEmail] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [inspTime, setInspTime] = useState('11:00 AM');
  const [inspNotes, setInspNotes] = useState('');
  const [inspSubmitting, setInspSubmitting] = useState(false);

  // Lead callback modal
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  // Voice Call State
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceAiSpeech, setVoiceAiSpeech] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>('session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Speak text using browser speech synthesis
  const speakText = (text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();

    // Clean markdown and symbols for clean spoken voice
    const cleanSpeech = text
      .replace(/[*#_`]/g, '')
      .replace(/₦(\d+)/g, '$1 Naira')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.96;
    utterance.pitch = 1.0;

    // Pick best English voice (prefer Natural / British / South African / West African / American female voice)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      /natural|neural/i.test(v.name) && /female|libby|sonia|jenny|aria|samantha/i.test(v.name)
    ) || voices.find(v =>
      (v.name.includes('Amina') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Google UK English Female')) &&
      v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-ZA') || v.lang.startsWith('en-NG') || v.lang.startsWith('en-US')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    setVoiceStatus('speaking');
    setVoiceAiSpeech(cleanSpeech);
    isSpeakingRef.current = true;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setVoiceStatus('idle');
      if (onEnd) onEnd();
      // Resume listening if call is active and not muted
      if (isVoiceCallActive && !isMuted) {
        startSpeechRecognition();
      }
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setVoiceStatus('idle');
      if (onEnd) onEnd();
      if (isVoiceCallActive && !isMuted) {
        startSpeechRecognition();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start Web Speech Recognition with robust transcript handling & barge-in
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Voice recognition is not supported in this browser. Please use text chat.', 'error');
      setVoiceStatus('idle');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      // Use device language or English, with en-NG support
      recognition.lang = navigator.language?.startsWith('en') ? navigator.language : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setVoiceStatus('listening');
      };

      // Barge-in: If user speaks while AI is speaking, immediately cut off speech and listen
      recognition.onspeechstart = () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          isSpeakingRef.current = false;
          setVoiceStatus('listening');
        }
      };

      recognition.onresult = (event: any) => {
        // Barge-in check
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          isSpeakingRef.current = false;
        }

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        setVoiceTranscript(interimTranscript || finalTranscript);

        if (finalTranscript.trim()) {
          handleVoiceTurn(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          addToast('Microphone access was denied. Please allow microphone permissions in your browser to speak with the concierge.', 'error');
          setVoiceStatus('idle');
        } else if (event.error === 'audio-capture') {
          addToast('No microphone was detected on your device.', 'error');
          setVoiceStatus('idle');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition warning:', event.error);
          setVoiceStatus('idle');
        } else {
          setVoiceStatus('idle');
        }
      };

      recognition.onend = () => {
        if (isVoiceCallActive && !isSpeakingRef.current && !isMuted) {
          // Restart listening loop if caller is silent
          setTimeout(() => {
            if (isVoiceCallActive && !isSpeakingRef.current && !isMuted) {
              startSpeechRecognition();
            }
          }, 600);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setVoiceStatus('idle');
    }
  };

  const startVoiceCall = () => {
    setActiveTab('voice');
    setIsVoiceCallActive(true);
    setIsMuted(false);
    setVoiceStatus('thinking');

    // Welcome speech
    const welcome = "Welcome to Selling Ajah. I am your AI Concierge. How may I assist you with properties, serviced shortlets, or vehicle rentals today?";
    speakText(welcome, () => {
      startSpeechRecognition();
    });
  };

  const stopVoiceCall = () => {
    setIsVoiceCallActive(false);
    setVoiceStatus('idle');
    setVoiceTranscript('');
    setVoiceAiSpeech('');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    isSpeakingRef.current = false;
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startSpeechRecognition();
    } else {
      setIsMuted(true);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setVoiceStatus('idle');
    }
  };

  const handleVoiceTurn = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    setVoiceStatus('thinking');

    // Append to message thread
    const userMsg: ChatMessage = {
      id: 'voice-user-' + Date.now(),
      sender: 'user',
      text: spokenText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoiceTranscript: true
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: spokenText,
          channel: 'voice',
          sessionId: sessionIdRef.current,
          history: messages.slice(-10).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'voice-asst-' + Date.now(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        listingCards: data.cards,
        actionButtons: data.actionButtons,
        handoffRequested: data.handoffRequested,
        isVoiceTranscript: true
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Speak back
      speakText(data.reply);
    } catch (err) {
      console.error(err);
      speakText("I am having trouble accessing the active portfolio right now. You can reach our senior advisor on WhatsApp.");
    }
  };

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
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          channel: 'chat',
          sessionId: sessionIdRef.current,
          history: messages.slice(-10).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'asst-' + Date.now(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        listingCards: data.cards,
        actionButtons: data.actionButtons,
        handoffRequested: data.handoffRequested
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
      sendMessage(btn.value || btn.label);
    } else if (btn.action === 'whatsapp') {
      const url = formatWhatsAppUrl(btn.value || settings.whatsapp, "Hello Selling Ajah Concierge, I'd like to consult on verified acquisitions.");
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (btn.action === 'navigate') {
      closeAiModal();
      navigate(btn.value || '/properties');
    } else if (btn.action === 'call') {
      window.location.href = `tel:${btn.value || settings.phone}`;
    } else if (btn.action === 'lead' || btn.action === 'lead_form') {
      setShowLeadForm(true);
    } else if (btn.action === 'open_inspection_modal' || btn.action === 'inspection') {
      setInspectionTargetTitle(btn.value || 'Verified Duplex in Ajah');
      setShowInspectionModal(true);
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspName || !inspPhone || !inspDate) {
      addToast('Please provide your name, phone number, and preferred date.', 'error');
      return;
    }

    setInspSubmitting(true);
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: inspName,
          customerPhone: inspPhone,
          customerEmail: inspEmail,
          listingId: inspectionTargetId,
          listingTitle: inspectionTargetTitle,
          listingType: 'property',
          preferredDate: inspDate,
          preferredTime: inspTime,
          notes: inspNotes,
          source: activeTab === 'voice' ? 'AI Voice' : 'AI Chat'
        })
      });

      const saved: InspectionRequest = await res.json();
      addToast(`Inspection request submitted under reference ${saved.referenceNumber}!`, 'success');
      setShowInspectionModal(false);

      setMessages(prev => [
        ...prev,
        {
          id: 'asst-insp-confirmed-' + Date.now(),
          sender: 'assistant',
          text: `Your inspection request has been submitted under reference **${saved.referenceNumber}**.\n\n• **Property**: ${saved.listingTitle}\n• **Preferred visit**: ${saved.preferredDate} at ${saved.preferredTime || '11:00 AM'}\n• **Status**: Pending Confirmation\n\nOur team will contact you to confirm your inspection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons: [
            { label: `WhatsApp Desk (Ref: ${saved.referenceNumber})`, action: 'whatsapp', value: settings.whatsapp },
            { label: 'Call Office Line', action: 'call', value: settings.phone }
          ]
        }
      ]);
    } catch (err) {
      console.error(err);
      addToast('Could not submit inspection. Please connect via WhatsApp.', 'error');
    } finally {
      setInspSubmitting(false);
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

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isAiModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);

      if (aiInitialPrompt) {
        sendMessage(aiInitialPrompt);
      }
    } else {
      stopVoiceCall();
    }
  }, [isAiModalOpen, aiInitialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, showInspectionModal, showLeadForm]);

  // Voice call duration timer
  useEffect(() => {
    if (isVoiceCallActive) {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [isVoiceCallActive]);

  if (!isAiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="sa-concierge-modal w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-brand-black border border-black/10 dark:border-brand-gold/20 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] sm:h-[84vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Editorial Header with Voice / Chat Mode Switcher */}
        <div className="p-3.5 sm:p-5 border-b border-black/8 dark:border-white/10 bg-neutral-50 dark:bg-brand-black-deep flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-serif text-sm sm:text-base md:text-lg font-bold text-neutral-900 dark:text-white truncate">
                  Selling Ajah Concierge
                </h3>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live AI
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-white/50 font-light truncate">
                Voice & Sales Advisor • Verified Lagos Inventory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mode Toggle Button */}
            <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 sm:p-1 rounded-full border border-black/5 dark:border-white/10">
              <button
                onClick={() => {
                  if (isVoiceCallActive) stopVoiceCall();
                  setActiveTab('chat');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-brand-charcoal text-neutral-900 dark:text-brand-gold shadow-sm font-bold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => {
                  if (!isVoiceCallActive) {
                    startVoiceCall();
                  } else {
                    setActiveTab('voice');
                  }
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'voice'
                    ? 'bg-brand-gold text-brand-black-deep shadow-sm font-bold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-brand-gold'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Voice</span>
              </button>
            </div>

            <button
              id="close-ai-assistant-btn"
              onClick={closeAiModal}
              className="p-1.5 sm:p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* VOICE CALL MODE INTERFACE */}
        {activeTab === 'voice' ? (
          <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-brand-black dark:to-brand-black-deep overflow-y-auto">
            {/* Top Call Info */}
            <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-white/60 font-mono pb-2 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-neutral-900 dark:text-white">AI Voice Concierge (Amina)</span>
              </div>
              <div className="flex items-center gap-1 text-brand-gold font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(callDuration)}</span>
              </div>
            </div>

            {/* Glowing Luxury Audio Orb / Visualizer */}
            <div className="my-auto flex flex-col items-center justify-center text-center px-4 max-w-md">
              <div className="relative mb-6">
                <div
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
                    voiceStatus === 'listening'
                      ? 'bg-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.4)] scale-105 ring-4 ring-emerald-500/30'
                      : voiceStatus === 'speaking'
                      ? 'bg-brand-gold/25 shadow-[0_0_60px_rgba(198,161,91,0.5)] scale-110 ring-4 ring-brand-gold/40'
                      : voiceStatus === 'thinking'
                      ? 'bg-brand-gold/15 animate-pulse shadow-[0_0_30px_rgba(198,161,91,0.2)]'
                      : 'bg-neutral-200 dark:bg-brand-charcoal'
                  }`}
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white dark:bg-brand-black-deep border-2 border-brand-gold/40 flex items-center justify-center text-brand-gold shadow-inner">
                    {voiceStatus === 'listening' ? (
                      <Mic className="w-10 h-10 text-emerald-500 animate-bounce" />
                    ) : voiceStatus === 'speaking' ? (
                      <Volume2 className="w-10 h-10 text-brand-gold animate-pulse" />
                    ) : voiceStatus === 'thinking' ? (
                      <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                    ) : (
                      <Headphones className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
                    )}
                  </div>
                </div>

                {/* Animated soundwave bars when speaking */}
                {voiceStatus === 'speaking' && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-brand-gold/40">
                    <span className="w-1 h-3 bg-brand-gold rounded animate-pulse" />
                    <span className="w-1 h-5 bg-brand-gold rounded animate-pulse delay-75" />
                    <span className="w-1 h-4 bg-brand-gold rounded animate-pulse delay-150" />
                    <span className="w-1 h-6 bg-brand-gold rounded animate-pulse delay-100" />
                    <span className="w-1 h-3 bg-brand-gold rounded animate-pulse delay-200" />
                  </div>
                )}
              </div>

              {/* Status text */}
              <p className="text-xs uppercase font-mono font-bold tracking-widest text-brand-gold mb-2">
                {voiceStatus === 'listening'
                  ? 'Listening to you...'
                  : voiceStatus === 'speaking'
                  ? 'Concierge Speaking...'
                  : voiceStatus === 'thinking'
                  ? 'Verifying Ajah Inventory...'
                  : isMuted
                  ? 'Microphone Muted'
                  : 'Ready to converse'}
              </p>

              {/* Live Transcript Bubble */}
              <div className="min-h-[70px] flex items-center justify-center">
                {voiceTranscript ? (
                  <p className="text-sm font-medium text-neutral-800 dark:text-white bg-white/70 dark:bg-brand-charcoal/70 px-4 py-2.5 rounded-2xl border border-black/5 dark:border-white/10 backdrop-blur shadow-sm italic">
                    "{voiceTranscript}"
                  </p>
                ) : voiceAiSpeech ? (
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 bg-white/50 dark:bg-brand-black-deep/50 px-4 py-2 rounded-2xl border border-black/5 dark:border-white/10">
                    {voiceAiSpeech}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400 dark:text-white/40 max-w-xs">
                    Speak naturally. Ask about 4-bed duplexes, prices, shortlet penthouses with 24/7 power, or schedule an inspection.
                  </p>
                )}
              </div>

              {/* Voice Disclosure Notice */}
              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-white/40 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full font-mono">
                <Info className="w-3 h-3 text-brand-gold shrink-0" />
                <span>AI Spoken Audio • Grounded in verified Lagos land registry titles</span>
              </div>
            </div>

            {/* Voice Call Controls Footer */}
            <div className="w-full flex items-center justify-center gap-4 pt-4 border-t border-black/5 dark:border-white/10">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                    : 'bg-white dark:bg-brand-charcoal border-black/10 dark:border-white/10 text-neutral-700 dark:text-white hover:border-brand-gold'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={() => {
                  stopVoiceCall();
                  setActiveTab('chat');
                }}
                className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>

              {/* Switch to Chat */}
              <button
                onClick={() => setActiveTab('chat')}
                className="p-4 rounded-full bg-white dark:bg-brand-charcoal border border-black/10 dark:border-white/10 text-neutral-700 dark:text-white hover:border-brand-gold transition-all cursor-pointer"
                title="Open text view"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* TEXT CHAT MODE INTERFACE */
          <>
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
                      <div className="w-7 h-7 rounded-lg bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center shrink-0 mt-0.5 text-brand-gold">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[88%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      {/* Text bubble */}
                      <div
                        className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-brand-gold text-brand-black-deep font-semibold rounded-tr-none shadow-md shadow-brand-gold/15'
                            : 'bg-neutral-100 dark:bg-brand-charcoal text-neutral-800 dark:text-neutral-200 border border-black/5 dark:border-white/10 rounded-tl-none whitespace-pre-line font-light'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Timestamp & channel flag */}
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-[10px] font-mono text-neutral-400 dark:text-white/40">
                          {msg.timestamp}
                        </span>
                        {msg.isVoiceTranscript && (
                          <span className="text-[9px] font-mono font-semibold text-brand-gold bg-brand-gold/10 px-1.5 py-0.2 rounded border border-brand-gold/20">
                            Spoken
                          </span>
                        )}
                      </div>

                      {/* Human Handoff Highlight Card */}
                      {msg.handoffRequested && (
                        <div className="mt-3 p-4 rounded-2xl bg-brand-gold/10 border border-brand-gold/40 w-full">
                          <div className="flex items-center gap-2 text-brand-gold font-bold text-xs mb-1">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Executive Human Advisory Handoff</span>
                          </div>
                          <p className="text-[11px] text-neutral-700 dark:text-neutral-200 mb-2.5">
                            Our Senior Acquisitions Partner is standing by for immediate direct consultation.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                const url = formatWhatsAppUrl(settings.whatsapp, "Hello Senior Partner, I am requesting immediate consultation via the Selling Ajah AI Concierge.");
                                window.open(url, '_blank', 'noopener,noreferrer');
                              }}
                              className="px-3.5 py-1.5 rounded-full bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-[11px] font-mono flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp Senior Partner</span>
                            </button>
                            <a
                              href={`tel:${settings.phone || '+2348109012192'}`}
                              className="px-3.5 py-1.5 rounded-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 hover:border-brand-gold text-neutral-900 dark:text-white text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
                            >
                              <Phone className="w-3 h-3 text-brand-gold" />
                              <span>Call Direct Line</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Interactive Property / Apartment / Vehicle Cards inside chat */}
                      {msg.listingCards && msg.listingCards.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 w-full">
                          {msg.listingCards.map(card => (
                            <div
                              key={card.id}
                              onClick={() => handleCardClick(card)}
                              className="bg-white dark:bg-brand-black-soft border border-black/10 dark:border-white/10 hover:border-brand-gold rounded-2xl overflow-hidden cursor-pointer group transition-all shadow-md flex flex-col"
                            >
                              <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
                                <img
                                  src={card.image}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 left-2 bg-black/85 text-[10px] uppercase font-bold text-brand-gold px-2 py-0.5 rounded font-mono">
                                  {card.type}
                                </div>
                              </div>
                              <div className="p-3 flex-1 flex flex-col justify-between">
                                <div>
                                  <h5 className="font-serif text-xs font-bold text-neutral-900 dark:text-white group-hover:text-brand-gold line-clamp-1 mb-1">
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
                                  <span className="text-xs font-bold text-brand-gold font-mono">
                                    {card.formattedPrice}
                                  </span>
                                  <span className="text-[10px] text-neutral-600 dark:text-neutral-300 flex items-center gap-0.5 font-medium">
                                    View <ArrowUpRight className="w-3 h-3 text-brand-gold" />
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
                              className="text-[11px] bg-white hover:bg-neutral-50 dark:bg-brand-charcoal dark:hover:bg-brand-graphite text-neutral-800 dark:text-brand-gold px-3.5 py-1.5 rounded-full border border-black/10 dark:border-brand-gold/30 transition-all shadow-sm font-mono cursor-pointer"
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center shrink-0 mt-0.5 text-brand-gold">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center shrink-0 text-brand-gold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-neutral-100 dark:bg-brand-charcoal text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                    <span>Verifying active Ajah & Lekki inventory...</span>
                  </div>
                </div>
              )}

              {/* Dedicated Inspection Booking Form Modal Inside Chat */}
              {showInspectionModal && (
                <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-brand-black-soft border border-brand-gold/50 shadow-2xl my-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between mb-3 border-b border-black/5 dark:border-white/10 pb-2">
                    <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      Schedule Private Inspection
                    </h4>
                    <button
                      onClick={() => setShowInspectionModal(false)}
                      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-white/60 mb-3">
                    Target: <strong className="text-brand-gold">{inspectionTargetTitle}</strong>
                  </p>

                  <form onSubmit={handleInspectionSubmit} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={inspName}
                      onChange={e => setInspName(e.target.value)}
                      className="w-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp Phone"
                        value={inspPhone}
                        onChange={e => setInspPhone(e.target.value)}
                        className="w-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={inspEmail}
                        onChange={e => setInspEmail(e.target.value)}
                        className="w-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-neutral-500 dark:text-white/50 block mb-1 font-mono">Preferred Date</label>
                        <input
                          type="date"
                          required
                          value={inspDate}
                          onChange={e => setInspDate(e.target.value)}
                          className="w-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 dark:text-white/50 block mb-1 font-mono">Time Window</label>
                        <select
                          value={inspTime}
                          onChange={e => setInspTime(e.target.value)}
                          className="w-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                        >
                          <option value="10:00 AM">10:00 AM (Morning)</option>
                          <option value="11:30 AM">11:30 AM (Midday)</option>
                          <option value="02:00 PM">02:00 PM (Afternoon)</option>
                          <option value="04:30 PM">04:30 PM (Evening Tour)</option>
                          <option value="Virtual 4K WhatsApp">Live 4K Diaspora Walkthrough</option>
                        </select>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Special notes (e.g., coming with family, gate pass requirements)"
                      value={inspNotes}
                      onChange={e => setInspNotes(e.target.value)}
                      className="w-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                    <button
                      type="submit"
                      disabled={inspSubmitting}
                      className="w-full py-3 px-4 rounded-full bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 font-mono cursor-pointer shadow-md shadow-brand-gold/20"
                    >
                      {inspSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Confirm & Book Inspection</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Inline Lead Capture Box */}
              {showLeadForm && (
                <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-brand-black-soft border border-brand-gold/40 shadow-xl my-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-gold" />
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
                      className="w-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp Phone"
                        value={leadPhone}
                        onChange={e => setLeadPhone(e.target.value)}
                        className="w-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={leadEmail}
                        onChange={e => setLeadEmail(e.target.value)}
                        className="w-full bg-white dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={leadSubmitting}
                      className="w-full py-3 px-4 rounded-full bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 font-mono cursor-pointer"
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
            <div className="p-4 border-t border-black/8 dark:border-white/10 bg-neutral-50 dark:bg-brand-black-deep">
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
                  className="flex-1 bg-white dark:bg-brand-black-soft border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 outline-none focus:border-brand-gold transition-colors"
                />

                {/* Voice Call Trigger in text input */}
                <button
                  type="button"
                  onClick={startVoiceCall}
                  className="p-3 rounded-xl bg-neutral-200 hover:bg-brand-gold/20 text-neutral-700 dark:bg-brand-charcoal dark:hover:bg-brand-gold/20 dark:text-brand-gold transition-colors shrink-0 cursor-pointer"
                  title="Start live voice conversation"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>

                <button
                  id="send-ai-message-btn"
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="p-3 rounded-xl bg-brand-gold hover:bg-brand-gold-deep disabled:opacity-40 disabled:hover:bg-brand-gold text-brand-black-deep transition-colors shrink-0 cursor-pointer"
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
          </>
        )}
      </div>
    </div>
  );
};
