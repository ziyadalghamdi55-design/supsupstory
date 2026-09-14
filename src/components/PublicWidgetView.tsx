/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useBilingual } from '../BilingualContext';
import { 
  Send, 
  Bot, 
  User, 
  Smartphone, 
  Mail, 
  Globe, 
  Lock,
  Loader2,
  Minimize
} from 'lucide-react';

export default function PublicWidgetView() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { language, direction, dictionary, setLanguage, toggleLanguage } = useBilingual();

  // Widget States
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [showUrgentChoice, setShowUrgentChoice] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Load public widget settings on startup (color, name, instructions welcome)
  useEffect(() => {
    if (!workspaceId) return;

    fetch(`/api/widget/config/${workspaceId}`)
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setIsLoadingConfig(false);
      })
      .catch(() => {
        setIsLoadingConfig(false);
      });
  }, [workspaceId]);

  // Handle Poll Syncing on Active Chat (every 3 seconds)
  useEffect(() => {
    if (!isInitialized || !conversation?.id) return;

    const pullMessages = () => {
      fetch(`/api/widget/messages?conversationId=${conversation.id}`)
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
        })
        .catch(() => {});
    };

    pullMessages();
    const interval = setInterval(pullMessages, 3000);

    return () => clearInterval(interval);
  }, [isInitialized, conversation?.id]);

  // Keep dialog thread view fixed to bottom
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initiate Iframe Conversation and capture UTM analytics
  const handleBeginChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim() || !workspaceId) return;

    setIsSending(true);

    // Extract UTM Campaign params from top query frame
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get('utm_source') || '';
    const utmCampaign = searchParams.get('utm_campaign') || '';
    const utmReferrer = searchParams.get('utm_referrer') || '';

    const payload = {
      workspaceId,
      name: visitorName,
      email: visitorEmail,
      phone: visitorPhone,
      utm_source: utmSource,
      utm_referrer: utmReferrer,
      utm_campaign: utmCampaign,
    };

    try {
      const res = await fetch('/api/widget/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setContact(data.contact);
        setConversation(data.conversation);
        setIsInitialized(true);
      }
    } catch (err) {
      console.error('Failed to init widget conversation thread', err);
    } finally {
      setIsSending(false);
    }
  };

  // Submit actual text message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversation?.id) return;

    const body = messageInput;
    setMessageInput('');
    setIsSending(true);

    // Optimistically update message array for immediate fluid feel
    const optimisticMsg = {
      id: 'opt_' + Math.random(),
      conversation_id: conversation.id,
      sender: 'contact',
      sender_name: contact?.name || 'Customer',
      body,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/widget/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          body,
        }),
      });

      if (res.ok) {
        // Reload messages thread
        const pullRes = await fetch(`/api/widget/messages?conversationId=${conversation.id}`);
        if (pullRes.ok) {
          const list = await pullRes.json();
          setMessages(list);
        }
      }
    } catch (err) {
      console.error('Failed to post customer widget message', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleRequestIntervention = async (isUrgent: boolean) => {
    if (!conversation?.id) return;
    setIsSending(true);
    setShowUrgentChoice(false);

    try {
      const res = await fetch('/api/widget/request-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id, isUrgent }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        
        // Reload messages thread instantly
        const pullRes = await fetch(`/api/widget/messages?conversationId=${conversation.id}`);
        if (pullRes.ok) {
          const list = await pullRes.json();
          setMessages(list);
        }
      }
    } catch (err) {
      console.error('Failed to notify owner', err);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoadingConfig) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 text-slate-800 animate-spin" />
      </div>
    );
  }

  const widgetThemeColor = config?.widget_color || '#0f172a';
  const botDisplayName = config?.bot_name || 'Bot Assistant';

  return (
    <div 
      className="h-screen bg-white flex flex-col font-sans transition-colors relative"
      style={{ direction }}
    >
      
      {/* Widget Header bar */}
      <header 
        style={{ backgroundColor: widgetThemeColor }}
        className="px-4 py-3 flex items-center justify-between text-white shrink-0 shadow-md relative z-10"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="text-xs font-bold tracking-tight">{botDisplayName}</h2>
            <span className="text-[9px] block text-slate-100 opacity-85">AI Customer Support</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick toggle inside widget frame */}
          <button
            onClick={toggleLanguage}
            className="text-[9px] font-bold bg-white/15 px-2 py-0.5 rounded border border-white/10 hover:bg-white/25 cursor-pointer leading-none"
          >
            {language === 'en' ? 'AR' : 'EN'}
          </button>
        </div>
      </header>

      {/* VIEW PANEL 1: CLIENT SIGNUP FOR CHAT INTEGRITY */}
      {!isInitialized ? (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-center bg-slate-50">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <div className="text-center space-y-1 mb-2">
              <h3 className="text-sm font-bold text-slate-900">{dictionary.widgetWelcome}</h3>
              <p className="text-[11px] text-slate-400 leading-normal">{dictionary.widgetEnterDetails}</p>
            </div>

            <form onSubmit={handleBeginChat} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {dictionary.name} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="e.g. Ziyad Alghamdi"
                    className="w-full text-xs pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {dictionary.email} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                    <Smartphone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending || !visitorName.trim() || !visitorEmail.trim()}
                style={{ backgroundColor: widgetThemeColor }}
                className="w-full py-2 rounded-lg text-white font-bold text-xs hover:opacity-90 transition cursor-pointer select-none disabled:bg-slate-300"
              >
                {isSending ? 'Initiating thread...' : dictionary.widgetStartChat}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 border-t pt-3">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Omnichannel security systems configured</span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW PANEL 2: CUSTOMER ACTIVE CHAT THREAD */
        <div className="flex-grow flex flex-col justify-between overflow-hidden bg-slate-100/30">
          
          {/* Messages bubbles thread */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
            {messages.map((m) => {
              const matchesClient = m.sender === 'contact';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[80%] ${
                    matchesClient ? 'ml-auto text-right' : 'self-start'
                  }`}
                >
                  <span className="text-[8px] font-bold text-slate-400 mb-0.5 px-0.5 uppercase tracking-wider block">
                    {matchesClient ? dictionary.visitorLabel : dictionary.aiIsAssistant}
                  </span>
                  
                  <div className={`p-2.5 rounded-xl text-xs leading-normal font-sans ${
                    matchesClient 
                      ? 'text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                  }`}
                  style={{ backgroundColor: matchesClient ? widgetThemeColor : undefined }}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              );
            })}

            <div ref={listEndRef} />
          </div>

          {/* Option to request human owner intervention */}
          {!conversation?.intervention_requested ? (
            showUrgentChoice ? (
              <div id="urgent-choice-panel" className="px-3.5 py-2.5 bg-rose-50/90 border-t border-rose-200 text-xs text-slate-800 font-sans select-none space-y-2">
                <div className="text-[10px] font-bold text-rose-800 flex items-center justify-between">
                  <span>{language === 'en' ? "Is this a critical/urgent matter?" : "هل هذا الأمر عاجل وطارئ؟"}</span>
                  <button 
                    type="button" 
                    id="close-urgent-choice-btn"
                    onClick={() => setShowUrgentChoice(false)}
                    className="text-slate-400 hover:text-slate-600 text-[10px] font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[9.5px] text-slate-500 leading-snug">
                  {language === 'en' 
                    ? "If vital, we'll immediately dispatch an automated emergency email containing your complete chat context & UTM campaign details to the owner's inbox."
                    : "في حال كونه عاجلاً، سيقوم النظام فورا بتزويد بريد المالك بملخص المحادثة، بيانات الترافيك، والـ UTM لمتابعتك فوراً."}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    id="submit-urgent-btn"
                    onClick={() => handleRequestIntervention(true)}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] py-1.5 rounded transition cursor-pointer text-center"
                  >
                    {language === 'en' ? 'Yes, Urgent (E-mail owner) ⚡' : 'نعم، عاجل وطارئ (إيميل) ⚡'}
                  </button>
                  <button
                    type="button"
                    id="submit-normal-btn"
                    onClick={() => handleRequestIntervention(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[9px] py-1.5 rounded transition cursor-pointer text-center"
                  >
                    {language === 'en' ? 'Normal Contact' : 'تواصل عادي فقط'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-sans select-none">
                <span>{language === 'en' ? "Not getting what you need?" : "لم تجد الفائدة المطلوبة؟"}</span>
                <button
                  type="button"
                  id="trigger-urgent-choice-btn"
                  onClick={() => setShowUrgentChoice(true)}
                  className="text-[9px] bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded border border-red-200 cursor-pointer select-none transition flex items-center gap-1 leading-none"
                >
                  <span>{language === 'en' ? 'Contact Owner ✉' : 'أرسل رسالة للمالك ✉'}</span>
                </button>
              </div>
            )
          ) : (
            <div className="px-3 py-2 bg-emerald-50 border-t border-slate-100 text-[10px] text-emerald-800 font-sans font-bold flex flex-col items-center justify-center text-center select-none leading-relaxed">
              <span>{language === 'en' ? "✓ Urgent Request Registered!" : "✓ تم تسجيل طلبك وتنبيه المالك!"}</span>
              <span className="text-[8.5px] text-emerald-600 font-normal">
                {language === 'en' 
                  ? "An instant email with your campaign info and conversation transcript is forwarded to the owner."
                  : "تم تزويد البريد الإلكتروني للمالك بكافة تفاصيل محادثتك ومعلومات الـ Campaign بنجاح."}
              </span>
            </div>
          )}

          {/* Bottom user message field bar */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-100 bg-white shadow-md flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={dictionary.widgetTypePlaceholder}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !messageInput.trim()}
              style={{ backgroundColor: widgetThemeColor }}
              className="p-2 text-white rounded-lg shrink-0 hover:opacity-90 transition cursor-pointer disabled:bg-slate-300"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
