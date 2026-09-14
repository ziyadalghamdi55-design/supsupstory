/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, Bot, Loader2, Globe, Sparkles } from 'lucide-react';
import { useBilingual } from '../BilingualContext';

interface CustomerChatViewProps {
  user: any;
  customerThread: {
    contact: any;
    conversation: any;
  };
  activeWorkspace: any;
  onLogout: () => void;
}

export default function CustomerChatView({ user, customerThread, activeWorkspace, onLogout }: CustomerChatViewProps) {
  const { language, direction, dictionary, toggleLanguage } = useBilingual();
  const { contact, conversation } = customerThread;

  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPolling, setIsPolling] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for conversation messages every 3 seconds
  useEffect(() => {
    if (!conversation?.id) return;

    const fetchThreadMessages = async () => {
      try {
        const response = await fetch(`/api/widget/messages?conversationId=${conversation.id}`);
        if (response.ok) {
          const list = await response.json();
          setMessages(list);
        }
      } catch (err) {
        console.error('Error fetching customer thread', err);
      }
    };

    fetchThreadMessages();
    const interval = setInterval(fetchThreadMessages, 3000);

    return () => clearInterval(interval);
  }, [conversation?.id]);

  // Keep scroll focused to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversation?.id) return;

    const body = messageInput;
    setMessageInput('');
    setIsSending(true);

    // Optimistically push customer message
    const tempMsg = {
      id: 'usr_opt_' + Math.random(),
      conversation_id: conversation.id,
      sender: 'contact',
      sender_name: contact?.name || user.name || 'Customer',
      body,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const response = await fetch('/api/widget/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          body
        })
      });

      if (response.ok) {
        // Trigger manual pull for immediate feedback
        const pullResponse = await fetch(`/api/widget/messages?conversationId=${conversation.id}`);
        if (pullResponse.ok) {
          const list = await pullResponse.json();
          setMessages(list);
        }
      }
    } catch (err) {
      console.error('Failed to post message to AI companion', err);
    } finally {
      setIsSending(false);
    }
  };

  const widgetThemeColor = activeWorkspace?.widget_color || '#0f172a';
  const botDisplayName = activeWorkspace?.bot_name || 'Shakhsi Gemini Assistant';

  return (
    <div 
      className="min-h-screen bg-slate-100 flex flex-col font-sans relative selection:bg-slate-900 selection:text-white"
      style={{ direction }}
    >
      {/* Background radial lines pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-35 pointer-events-none" />

      {/* Embedded Single-Screen Chat Module card container */}
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col md:py-6 md:px-4 relative z-10">
        <div className="bg-white flex-1 flex flex-col md:rounded-2xl md:shadow-2xl md:border border-slate-200 overflow-hidden">
          
          {/* Header element */}
          <header 
            className="px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-md relative z-10"
            style={{ backgroundColor: widgetThemeColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight flex items-center gap-1.5">
                  <span>{botDisplayName}</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </h2>
                <span className="text-[10px] text-slate-100 opacity-80 block font-medium uppercase font-mono tracking-wider">
                  {language === 'en' ? 'Online Support Desk' : 'صندوق الدعم المباشر ومساعد الذكاء الاصطناعي'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Bilingual switch quick toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="text-[10px] font-bold bg-white/15 px-2.5 py-1 rounded border border-white/10 hover:bg-white/25 transition cursor-pointer select-none leading-none flex items-center gap-1"
                title="Change system language"
              >
                <Globe className="w-3 h-3" />
                <span>{language === 'en' ? 'AR' : 'EN'}</span>
              </button>

              {/* Log out/Sign in as other button */}
              <button
                onClick={onLogout}
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-650 hover:bg-red-700 font-bold text-xs rounded border border-red-500/20 text-white cursor-pointer select-none"
                title="Log out and return"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'en' ? 'Sign Out' : 'خروج'}</span>
              </button>
            </div>
          </header>

          {/* Interactive Chat Pane viewport */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60 flex flex-col space-y-4">
            
            {/* Context Notice detailing the store profile */}
            <div className="bg-blue-50/80 border border-blue-150 rounded-xl p-3.5 text-xs text-blue-800 space-y-1.5 max-w-2xl mx-auto w-full">
              <h4 className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'en' ? 'Premium Code Hub Virtual Merchant' : 'متجر Premium Code Hub الرقمي'}</span>
              </h4>
              <p className="leading-relaxed">
                {language === 'en' 
                  ? 'Our AI copilot assistant represents Premium Code Hub. Feel free to ask about our templates (SaaS Boilerplate, Portfolio Builder, Courses), instant product delivery policies, or specific questions.' 
                  : 'مساعدنا الرقمي يمثّل المتجر لإرشادكم حول قوالبنا البرمجية، الأكاديمية الفنية وسياسة توصيل المستندات الفورية. تفضل بطرح سؤالك باللغة العربية أو الإنجليزية!'}
              </p>
            </div>

            {/* Simulated spacer for negative placement */}
            <div className="flex-1" />

            {/* Messages bubbles loop */}
            {messages.map((m) => {
              const isCustomer = m.sender === 'contact';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[80%] ${
                    isCustomer ? 'ml-auto text-right' : 'self-start'
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-400 mb-0.5 px-1 uppercase tracking-wider block">
                    {isCustomer ? `${dictionary.visitorLabel} (${user.email.includes('@') ? user.email : `#${user.email.toUpperCase()}`})` : dictionary.aiIsAssistant}
                  </span>
                  
                  <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed font-sans shadow-xs ${
                    isCustomer 
                      ? 'text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none'
                  }`}
                  style={{ backgroundColor: isCustomer ? widgetThemeColor : undefined }}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="self-start flex items-center gap-2 text-xs text-slate-400 italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span>{language === 'en' ? 'AI is drafting response...' : 'يجري الرد بـ ذكاء اصطناعي...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom send field and layout controls */}
          <footer className="p-4 border-t border-slate-200 bg-white">
            <form onSubmit={handleSubmitMessage} className="flex gap-2.5 items-center">
              <input
                type="text"
                required
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={dictionary.widgetTypePlaceholder}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 duration-150 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={isSending || !messageInput.trim()}
                style={{ backgroundColor: widgetThemeColor }}
                className="p-3 text-white rounded-xl hover:opacity-90 active:scale-95 duration-100 transition shadow-md shadow-slate-950/10 cursor-pointer disabled:bg-slate-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{user.email.includes('@') ? (language === 'en' ? `Logged in email: ${user.email}` : `البريد المسجل: ${user.email}`) : (language === 'en' ? `Specific number: ${user.email.toUpperCase()}` : `الرقم الخاص المسجل: ${user.email.toUpperCase()}`)}</span>
              <span className="flex items-center gap-1 uppercase tracking-wider text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                SECURE END-TO-END WORKSPACE
              </span>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}
