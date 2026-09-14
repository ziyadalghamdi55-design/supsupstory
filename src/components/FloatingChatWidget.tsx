/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useBilingual } from '../BilingualContext';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle, 
  User, 
  Mail, 
  ShieldCheck, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface FloatingChatWidgetProps {
  workspaceId?: string;
  defaultOpen?: boolean;
}

export default function FloatingChatWidget({ workspaceId = 'w_demo', defaultOpen = false }: FloatingChatWidgetProps) {
  const { language } = useBilingual();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isInitialized, setIsInitialized] = useState(false);
  const [config, setConfig] = useState<any>(null);
  
  // Visitor info
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasNewUnread, setHasNewUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load config
  useEffect(() => {
    fetch(`/api/widget/config/${workspaceId}`)
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, [workspaceId]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Polling messages if initialized
  useEffect(() => {
    if (!isInitialized || !conversation?.id) return;

    const fetchMessages = () => {
      fetch(`/api/widget/messages?conversationId=${conversation.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMessages(data);
          }
        })
        .catch(() => {});
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => clearInterval(interval);
  }, [isInitialized, conversation?.id]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/widget/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: visitorName.trim(),
          email: visitorEmail.trim(),
          utm_source: 'Shakhsi Storefront',
          utm_campaign: 'store-assistant',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setIsInitialized(true);
        // Load initial welcome message
        fetch(`/api/widget/messages?conversationId=${data.conversation.id}`)
          .then((r) => r.json())
          .then((msgData) => {
            if (Array.isArray(msgData)) setMessages(msgData);
          });
      }
    } catch (err) {
      console.error('Error initiating chat:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !conversation?.id || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    // Optimistic message
    const tempMessage = {
      id: 'opt_' + Math.random(),
      conversation_id: conversation.id,
      sender: 'contact',
      sender_name: visitorName || 'You',
      body: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch('/api/widget/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          body: messageText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="shakhsi-floating-widget-root">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div 
          id="shakhsi-floating-chat-window"
          className="w-[360px] sm:w-[390px] h-[520px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Top Header Bar */}
          <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {config?.bot_name || 'Shakhsi Gemini Assistant'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AI Active
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  {language === 'en' ? 'Online • Instant Store Assistance' : 'متصل الآن • مساعدة فورية لمنتجات المتجر'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              title={language === 'en' ? 'Close' : 'إغلاق'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body content */}
          {!isInitialized ? (
            /* Lead info intake screen */
            <div className="flex-1 p-5 flex flex-col justify-between bg-slate-50/50 overflow-y-auto">
              <div className="space-y-4 pt-2">
                <div className="text-center space-y-1.5 pb-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'en' ? 'Chat with our Store AI Assistant' : 'تحدث مع المساعد الذكي للمتجر'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    {language === 'en'
                      ? 'Ask about digital templates, licenses, instant delivery, or installation support anytime.'
                      : 'اسأل عن القوالب البرمجية، التراخيص، التسليم الفوري، أو طلبات المساعدة الفنية 24/7.'}
                  </p>
                </div>

                <form onSubmit={handleStartChat} className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {language === 'en' ? 'Your Name' : 'الاسم الكريم'}
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 rtl:right-3 rtl:left-auto" />
                      <input
                        type="text"
                        required
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder={language === 'en' ? 'e.g. Alex Smith' : 'مثال: محمد العمري'}
                        className="w-full text-xs pl-8 pr-3 py-2 rtl:pr-8 rtl:pl-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 rtl:right-3 rtl:left-auto" />
                      <input
                        type="email"
                        required
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full text-xs pl-8 pr-3 py-2 rtl:pr-8 rtl:pl-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !visitorName.trim() || !visitorEmail.trim()}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 active:scale-98 text-white text-xs font-semibold shadow-sm transition duration-150 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5" />
                    )}
                    <span>{language === 'en' ? 'Start Instant Chat' : 'بدء المحادثة الفورية'}</span>
                  </button>
                </form>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>{language === 'en' ? 'Powered by Shakhsi AI Engine' : 'مدعوم بمحرك ذكاء شخصي الاصطناعي'}</span>
                </span>
              </div>
            </div>
          ) : (
            /* Active message dialogue window */
            <div className="flex-1 flex flex-col bg-slate-50/40 overflow-hidden">
              {/* Messages viewport */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                {messages.map((msg, index) => {
                  const isUser = msg.sender === 'contact';
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${
                        isUser ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      <span className="text-[9px] text-slate-400 mb-0.5 px-1 font-mono">
                        {isUser ? visitorName || 'You' : (config?.bot_name || 'Shakhsi AI')}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-slate-950 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                      </div>
                      <span className="text-[8px] text-slate-400 mt-0.5 px-1 font-mono">
                        {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}

                {isSending && (
                  <div className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-xl w-24 text-[10px] text-slate-500 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input formulation area */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={language === 'en' ? 'Type your product question...' : 'اكتب سؤالك عن المنتجات...'}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-95 text-white disabled:opacity-40 transition cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Launcher Bubble Trigger Button */}
      <button
        id="shakhsi-widget-bubble-btn"
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewUnread(false);
        }}
        className="group flex items-center gap-2.5 px-4 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-150 cursor-pointer border border-slate-800"
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-5 h-5 text-slate-300 group-hover:text-white" />
          ) : (
            <Bot className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition duration-150" />
          )}
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
        </div>
        
        <span className="text-xs font-semibold tracking-tight text-white select-none">
          {isOpen 
            ? (language === 'en' ? 'Close Chat' : 'إغلاق المحادثة')
            : (language === 'en' ? 'Chat with AI Support' : 'المساعد الذكي للمتجر')}
        </span>
      </button>
    </div>
  );
}
