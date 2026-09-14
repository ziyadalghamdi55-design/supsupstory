/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useBilingual } from '../BilingualContext';
import { 
  Search, 
  Send, 
  Bot, 
  User, 
  ExternalLink,
  MessageSquare, 
  CheckCircle,
  Clock,
  Smartphone,
  Tag,
  Monitor,
  Sparkles,
  RefreshCw,
  PlusCircle,
  ShoppingBag,
  Eye,
  Copy
} from 'lucide-react';

// Unified Store Products Catalog
const STORE_PRODUCTS = [
  { id: 'p1', name: 'SaaS Boilerplate', price: 49, description: 'React & Node.js clean full-stack SaaS architecture boilerplate', category: 'Templates' },
  { id: 'p2', name: 'Portfolio Builder', price: 19, description: 'Modern sleek portfolio template for developers using Next.js & Tailwind CSS', category: 'Templates' },
  { id: 'p3', name: 'Full-Stack Masterclass', price: 99, description: 'Complete step-by-step video courses with direct mentor support & certificate', category: 'Education' },
  { id: 'p4', name: 'Tailwind Dashboard Kit', price: 29, description: 'Sleek custom dashboard kit with 50+ modular UI components', category: 'Design Kits' },
  { id: 'p5', name: 'Python Scraper Suite', price: 39, description: 'Automated data extraction tool scripts for e-commerce websites and feeds', category: 'Scripts' },
  { id: 'p6', name: 'Docker Deployment Recipes', price: 15, description: 'Optimized production configuration files for modern cloud systems', category: 'DevOps' }
];

export default function InboxView() {
  const { language, direction, dictionary } = useBilingual();
  
  // States
  const [conversations, setConversations] = useState<any[]>([]);
  const [inboxStats, setInboxStats] = useState({ open: 0, snoozed: 0, done: 0 });
  const [activeStatus, setActiveStatus] = useState<'open' | 'snoozed' | 'done'>('open');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Product Catalog & Shortcuts States
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [customerProducts, setCustomerProducts] = useState<Record<string, { purchased: string[], viewed: string[] }>>({
    'c_1': {
      purchased: ['SaaS Boilerplate'],
      viewed: ['SaaS Boilerplate', 'Portfolio Builder', 'Docker Deployment Recipes']
    },
    'c_2': {
      purchased: ['SaaS Boilerplate', 'Full-Stack Masterclass'],
      viewed: ['Full-Stack Masterclass', 'Python Scraper Suite']
    },
    'c_3': {
      purchased: [],
      viewed: ['Full-Stack Masterclass', 'Portfolio Builder']
    }
  });

  // Telegram Simulator States
  const [tgSenderName, setTgSenderName] = useState('Sarah Jenkins');
  const [tgMessageText, setTgMessageText] = useState('Hello! I came from your Telegram link, does the SaaS Boilerplate support SQLite?');
  const [isSimulatingTg, setIsSimulatingTg] = useState(false);

  // References
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Product Mapping Helpers
  const activeContactId = activeThread?.contact?.id;
  const activeContactStats = activeContactId ? (customerProducts[activeContactId] || { purchased: [], viewed: [] }) : { purchased: [], viewed: [] };

  const handleAddSimulatedPurchase = (prodName: string) => {
    if (!activeContactId) return;
    setCustomerProducts(prev => {
      const stats = prev[activeContactId] || { purchased: [], viewed: [] };
      if (stats.purchased.includes(prodName)) return prev;
      return {
        ...prev,
        [activeContactId]: {
          ...stats,
          purchased: [...stats.purchased, prodName]
        }
      };
    });
  };

  const handleAddSimulatedView = (prodName: string) => {
    if (!activeContactId) return;
    setCustomerProducts(prev => {
      const stats = prev[activeContactId] || { purchased: [], viewed: [] };
      if (stats.viewed.includes(prodName)) return prev;
      return {
        ...prev,
        [activeContactId]: {
          ...stats,
          viewed: [...stats.viewed, prodName]
        }
      };
    });
  };

  // Load Inbox Conversations
  const fetchConversations = async (silent = false) => {
    try {
      const res = await fetch(`/api/conversations?status=${activeStatus}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }

      const statsRes = await fetch('/api/inbox/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setInboxStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching inbox conversations', err);
    }
  };

  // Load Active Conversation Messages
  const fetchActiveConversationThread = async (id: string, selectFirstIfNull = false) => {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setActiveThread(data);
      }
    } catch (err) {
      console.error('Error fetching conversation details', err);
    }
  };

  // Setup short pooling (every 3 seconds) for real-time customer messaging feel
  useEffect(() => {
    fetchConversations();
    
    const interval = setInterval(() => {
      fetchConversations(true);
      if (activeConvId) {
        fetchActiveConversationThread(activeConvId);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeStatus, activeConvId]);

  // Adjust message viewport on thread selection
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages]);

  const selectConversation = (id: string) => {
    setActiveConvId(id);
    fetchActiveConversationThread(id);
  };

  // Agent submits manual message
  const handleAgentSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConvId) return;

    setIsSending(true);
    const sentText = replyText;
    setReplyText('');

    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: sentText }),
      });

      if (res.ok) {
        await fetchActiveConversationThread(activeConvId);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending agent message', err);
    } finally {
      setIsSending(false);
    }
  };

  // Change active status (Snoozed, done, open)
  const handleStatusChange = async (id: string, nextStatus: 'open' | 'snoozed' | 'done') => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        fetchConversations();
        if (activeConvId === id) {
          // If active, deselect or switch status
          setActiveConvId(null);
          setActiveThread(null);
        }
      }
    } catch (err) {
      console.error('Error modifying conversation status', err);
    }
  };

  const handleUrgentToggle = async (id: string, currentUrgent: boolean) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_urgent: !currentUrgent }),
      });
      if (res.ok) {
        fetchConversations();
        // Update active thread locally
        setActiveThread((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            conversation: {
              ...prev.conversation,
              is_urgent: !currentUrgent
            }
          };
        });
      }
    } catch (err) {
      console.error('Error toggling urgent status', err);
    }
  };

  // Execute Simulated Telegram customer inputs Webhook
  const handleSimulateTelegram = async () => {
    if (!tgMessageText.trim()) return;

    setIsSimulatingTg(true);
    try {
      // Find our workspace ID dynamically
      const wsRes = await fetch('/api/workspace');
      if (!wsRes.ok) throw new Error();
      const ws = await wsRes.json();

      const res = await fetch(`/api/telegram/webhook/${ws.workspace_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: tgSenderName,
          messageText: tgMessageText,
        }),
      });

      if (res.ok) {
        setTgMessageText('');
        // Alert typing indicators for simulated UX
        setIsAiResponding(true);
        setTimeout(() => {
          setIsAiResponding(false);
          fetchConversations();
          if (activeConvId) fetchActiveConversationThread(activeConvId);
        }, 1200);
      }
    } catch (err) {
      console.error('Telegram simulation error', err);
    } finally {
      setIsSimulatingTg(false);
    }
  };

  // Conversations Search filtering
  const filteredConversations = conversations.filter((c) => {
    const contactName = c.contact?.name || '';
    const email = c.contact?.email || '';
    const preview = c.last_message_preview || '';
    const query = searchQuery.toLowerCase();
    return (
      contactName.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      preview.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-h-[85vh]">
      
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{dictionary.inbox}</h1>
          <p className="text-xs text-slate-500">
            {language === 'en' 
              ? 'Omnichannel support inbox polling live every 3 seconds.' 
              : 'صندوق رسائل موحد القنوات يتم إنعاشه تلقائياً كل ٣ ثوانٍ لضمان السرعة.'}
          </p>
        </div>

        {/* Tab filters Open, Snoozed, Done */}
        <div className="flex p-1 bg-slate-200/80 border border-slate-300/40 rounded-lg shrink-0">
          <button
            onClick={() => { setActiveStatus('open'); setActiveConvId(null); setActiveThread(null); }}
            className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeStatus === 'open' 
                ? 'bg-white text-slate-950 shadow-sm' 
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>{dictionary.statusOpen}</span>
            <span className="bg-slate-900/10 text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
              {inboxStats.open}
            </span>
          </button>
          <button
            onClick={() => { setActiveStatus('snoozed'); setActiveConvId(null); setActiveThread(null); }}
            className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeStatus === 'snoozed' 
                ? 'bg-white text-slate-950 shadow-sm' 
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>{dictionary.statusSnoozed}</span>
            <span className="bg-slate-900/10 text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
              {inboxStats.snoozed}
            </span>
          </button>
          <button
            onClick={() => { setActiveStatus('done'); setActiveConvId(null); setActiveThread(null); }}
            className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeStatus === 'done' 
                ? 'bg-white text-slate-950 shadow-sm' 
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>{dictionary.statusDone}</span>
            <span className="bg-slate-900/10 text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
              {inboxStats.done}
            </span>
          </button>
        </div>
      </div>

      {/* THREE PANE CONSOLE WORKSPACE */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[680px]">
        
        {/* PANE 1: CONVERSATIONS LIST (lg:col-span-3) */}
        <div className="lg:col-span-3 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
          {/* Search box header */}
          <div className="p-3 border-b border-slate-100 shrink-0">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dictionary.searchConversations}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950"
              />
            </div>
          </div>

          {/* Conversations list wrapper */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 text-xs empty-conversations">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <span>{dictionary.noConversations}</span>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeConvId === c.id;
                const hasUnread = c.unread_count > 0;
                const isUrgent = !!c.is_urgent;
                
                return (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`p-3 rounded-lg cursor-pointer transition flex flex-col gap-1 w-full text-left relative ${
                      isActive 
                        ? 'bg-slate-950 text-white shadow-md' 
                        : isUrgent
                          ? 'bg-red-50/90 border-2 border-red-500 hover:bg-red-100/80 text-slate-800 animate-pulse'
                          : 'hover:bg-slate-100 text-slate-800 bg-white border border-slate-200/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      {/* Avatar & name */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full ${c.channel === 'telegram' ? 'bg-sky-400' : 'bg-emerald-400'}`} />
                        <span className={`text-xs font-bold truncate flex items-center gap-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {c.contact?.name || 'Customer'}
                          {isUrgent && (
                            <span className="bg-red-650 text-white text-[7.5px] font-extrabold uppercase px-1 py-0.5 rounded tracking-wider animate-bounce">
                              {language === 'en' ? 'URGENT' : 'عاجل 🚨'}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Channel Badge / Time */}
                      <span className={`text-[9px] shrink-0 font-mono font-semibold ${isActive ? 'text-slate-400' : isUrgent ? 'text-red-750 font-black' : 'text-slate-400'}`}>
                        {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className={`text-[11px] truncate leading-normal ${isActive ? 'text-slate-300' : isUrgent ? 'text-red-950 font-bold' : 'text-slate-500'}`}>
                      {c.last_message_preview || 'No messages.'}
                    </p>

                    <div className="flex items-center justify-between gap-2 border-t mt-1.5 pt-1 border-slate-100/10 shrink-0 text-[10px]">
                      {/* UTM / Source Tag */}
                      <span className={`inline-flex items-center gap-0.5 font-mono uppercase font-bold text-[8px] truncate ${isActive ? 'text-slate-400' : isUrgent ? 'text-red-700' : 'text-slate-500'}`}>
                        <Tag className="w-2.5 h-2.5 shrink-0" />
                        {c.source || 'Direct Link'}
                      </span>

                      {/* Unread dot count */}
                      {hasUnread && !isActive && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.1 rounded-full shrink-0">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANE 2: ACTIVE CHAT SCREEN (lg:col-span-6) */}
        <div className="lg:col-span-6 border-r border-slate-100 flex flex-col h-full justify-between bg-white">
          {activeThread ? (
            <>
              {/* Active Conversation header info */}
              <div id="active-chat-header" className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-full ${activeThread.contact?.avatar_color || 'bg-slate-500'} flex items-center justify-center text-white font-bold text-xs`}>
                    {(activeThread.contact?.name || 'C')[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{activeThread.contact?.name}</h3>
                    <span className="text-[10px] block text-slate-400 font-mono truncate">
                      {activeThread.contact?.email && activeThread.contact.email.includes('@')
                        ? activeThread.contact.email
                        : (language === 'en' ? `Specific Number: ${activeThread.contact?.email}` : `الرقم الخاص: ${activeThread.contact?.email}`)}
                    </span>
                  </div>
                </div>

                {/* Status Toggle control shortcuts with three status divisions + urgent flag */}
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                  {/* Urgent Bell / Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleUrgentToggle(activeThread.conversation.id, !!activeThread.conversation.is_urgent)}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black rounded border cursor-pointer transition select-none ${
                      activeThread.conversation.is_urgent
                        ? 'bg-red-650 text-white border-red-700 animate-pulse shadow-sm shadow-red-500/20'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-250 hover:text-slate-900'
                    }`}
                    title={language === 'en' ? "Flag / Unflag as Urgent priority" : "تحديد / إلغاء حالة الطوارئ العاجلة للمحادثة"}
                  >
                    <span>🚨</span>
                    <span>{language === 'en' ? 'Urgent' : 'عاجل طارئ'}</span>
                  </button>

                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                  {/* Open Status Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeThread.conversation.id, 'open')}
                    className={`inline-flex items-center px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition select-none ${
                      activeThread.conversation.status === 'open'
                        ? 'bg-blue-600 text-white border border-blue-700 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {dictionary.statusOpen}
                  </button>

                  {/* Snoozed/Postponed Status Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeThread.conversation.id, 'snoozed')}
                    className={`inline-flex items-center px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition select-none ${
                      activeThread.conversation.status === 'snoozed'
                        ? 'bg-orange-500 text-white border border-orange-600 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {dictionary.statusSnoozed}
                  </button>

                  {/* Done / Completed Status Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeThread.conversation.id, 'done')}
                    className={`inline-flex items-center px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition select-none ${
                      activeThread.conversation.status === 'done'
                        ? 'bg-emerald-600 text-white border border-emerald-700 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {dictionary.statusDone}
                  </button>
                </div>
              </div>

              {/* Message dialogue bubble area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/20 max-h-[460px]">
                {activeThread.messages.map((m: any) => {
                  const isAgent = m.sender === 'agent';
                  const isAi = m.sender === 'ai';
                  const isCustomer = m.sender === 'contact';

                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col max-w-[85%] ${
                        isAgent ? 'ml-auto text-right' : 'self-start'
                      }`}
                    >
                      {/* Name card label */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mb-0.5 px-1 truncate">
                        {isAi ? <Bot className="w-3.5 h-3.5 text-purple-600 fill-purple-100" /> : <User className="w-3.5 h-3.5" />}
                        <span>
                          {isAi ? dictionary.aiIsAssistant : (isAgent ? dictionary.agentLabel : dictionary.visitorLabel)}
                        </span>
                        <span className="font-mono text-[9px] text-slate-300 ml-1">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Bubble frame */}
                      <div className={`p-3 rounded-2xl text-xs leading-normal transition-all ${
                        isAgent 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : isAi 
                            ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-tl-none font-medium' 
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{m.body}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Simulated typing status */}
                {isAiResponding && (
                  <div className="flex items-center gap-2 self-start bg-slate-100 text-slate-500 p-2.5 rounded-lg border border-slate-200 text-xs animate-pulse">
                    <Bot className="w-4 h-4 text-purple-600 animate-spin" />
                    <span className="font-mono text-[10px]">Gemini Co-Pilot is spelling a customer response...</span>
                  </div>
                )}
                
                <div ref={messageEndRef} />
              </div>

              {/* Agent form text sender bar */}
              <form onSubmit={handleAgentSend} className="p-3 border-t border-slate-100 shrink-0 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={dictionary.typeMessage}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg shrink-0 transition-colors disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-slate-400">
              <Sparkles className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-sm mb-1">{dictionary.activeChat}</h3>
              <p className="text-xs max-w-sm">{dictionary.selectConversation}</p>
            </div>
          )}
        </div>

        {/* PANE 3: TELEGRAM WEB SIMULATOR & METADATA DETAILS (lg:col-span-3) */}
        <div className="lg:col-span-3 h-full flex flex-col overflow-y-auto bg-slate-50/80 p-4 space-y-6 border-l border-slate-100">
          
          {/* Active Contact profile detail */}
          {activeThread ? (
            <div className="space-y-5">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{dictionary.contactInfo}</h4>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2 shadow-sm">
                  <div>
                    <span className="block text-slate-400 uppercase text-[9px] font-bold">
                      {activeThread.contact?.email && activeThread.contact.email.includes('@') 
                        ? (language === 'en' ? 'visitor email' : 'البريد الإلكتروني للزائر') 
                        : (language === 'en' ? 'specific number' : 'الرقم الخاص بالعميل')}
                    </span>
                    <span className="font-semibold text-slate-800 block truncate">{activeThread.contact?.email}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase text-[9px] font-bold">visitor phone</span>
                    <span className="font-semibold text-slate-800 block">{activeThread.contact?.phone || 'Not Shared'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase text-[9px] font-bold">original channel</span>
                    <span className="inline-flex items-center gap-1.5 font-bold font-mono text-[10px] mt-0.5 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {activeThread.conversation.channel === 'telegram' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                      {activeThread.conversation.channel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* PRODUCTS PURCHASED & VIEWED (ADMINISTRATIVE SHORTCUTS FOR ACTIVE USER) */}
              <div className="space-y-4">
                {/* Products Purchased */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Products Purchased</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono font-normal">Active User</span>
                  </h4>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2.5 shadow-sm">
                    {activeContactStats.purchased.length === 0 ? (
                      <p className="text-slate-400 text-xs italic py-0.5">No products purchased yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {activeContactStats.purchased.map((pName) => (
                          <span key={pName} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-850 text-[10px] font-semibold px-2 py-0.7 rounded border border-emerald-150">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {pName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Simulation buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">⚡ Link Instant Purchase:</span>
                      <div className="flex flex-wrap gap-1">
                        {STORE_PRODUCTS.filter(x => !activeContactStats.purchased.includes(x.name)).slice(0, 3).map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => handleAddSimulatedPurchase(prod.name)}
                            className="bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 text-[8.5px] font-bold px-1.5 py-0.5 rounded transition cursor-pointer"
                          >
                            + Buy {prod.name.split(' ')[0]}
                          </button>
                        ))}
                        {STORE_PRODUCTS.every(x => activeContactStats.purchased.includes(x.name)) && (
                          <span className="text-[9px] text-slate-450 italic">Full suite purchased!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viewed Products */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Viewed Products</span>
                    </span>
                    <span className="text-[9px] text-slate-500">History</span>
                  </h4>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2.5 shadow-sm">
                    {activeContactStats.viewed.length === 0 ? (
                      <p className="text-slate-400 text-xs italic py-0.5">No products viewed by visitor yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {activeContactStats.viewed.map((vName) => (
                          <span key={vName} className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.7 rounded border border-blue-100 animate-fade-in">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                            {vName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Simulation viewed browser history trigger */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">🚀 Link Page View Event:</span>
                      <div className="flex flex-wrap gap-1">
                        {STORE_PRODUCTS.filter(x => !activeContactStats.viewed.includes(x.name)).slice(0, 3).map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => handleAddSimulatedView(prod.name)}
                            className="bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-705 text-[8.5px] font-bold px-1.5 py-0.5 rounded transition cursor-pointer text-slate-600"
                          >
                            + View {prod.name.split(' ')[0]}
                          </button>
                        ))}
                        {STORE_PRODUCTS.every(x => activeContactStats.viewed.includes(x.name)) && (
                          <span className="text-[9px] text-slate-450 italic text-slate-400">All products viewed by client.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Details */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{dictionary.referralDetails}</h4>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2 shadow-sm">
                  <div>
                    <span className="block text-slate-400 uppercase text-[9px] font-bold">UTM original source</span>
                    <span className="font-semibold text-slate-800">{activeThread.conversation.source || 'Direct Referral'}</span>
                  </div>
                  {activeThread.conversation.campaign && (
                    <div>
                      <span className="block text-slate-400 uppercase text-[9px] font-bold">UTM campaign</span>
                      <span className="font-mono text-purple-700 font-semibold">{activeThread.conversation.campaign}</span>
                    </div>
                  )}
                  {activeThread.conversation.referrer && (
                    <div>
                      <span className="block text-slate-400 uppercase text-[9px] font-bold">origin Site referral URL</span>
                      <span className="text-slate-500 font-mono text-[10px] truncate block hover:underline">
                        {activeThread.conversation.referrer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/60 p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              Select chat thread to inspect active visitor purchased and viewed products.
            </div>
          )}

          {/* STORE PRODUCTS CATALOG LOOKUP SEARCH BAR (ALWAYS VISIBLE FOR ADMINISTRATOR) */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between">
              <span>🔍 Store Catalog Lookup</span>
              <span className="text-[8.5px] bg-slate-900 text-white font-mono px-1 rounded">Admin Console</span>
            </h4>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-3 shadow-sm">
              <span className="block text-slate-500 text-[10px] leading-relaxed">
                Quickly locate any store template or course by name and copy or insert support shortcuts.
              </span>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 pointer-events-none">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Filter products by name..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-slate-950 focus:outline-none"
                />
              </div>

              {/* Matched product catalog results */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {STORE_PRODUCTS.filter((prod) =>
                  prod.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                ).map((prod) => (
                  <div key={prod.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-150 flex flex-col gap-1 text-[11px] hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="font-bold text-slate-900">{prod.name}</span>
                      <strong className="text-slate-950 font-mono text-[10px] bg-slate-150 px-1 py-0.2 rounded">${prod.price}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[8.5px] uppercase font-bold text-slate-400">
                      <span>{prod.category}</span>
                      {activeContactStats.purchased.includes(prod.name) && (
                        <span className="text-emerald-600 bg-emerald-50 px-1 py-0.1 rounded border border-emerald-100 font-mono text-[8px]">purchased</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-0.5 leading-snug">
                      {prod.description}
                    </p>
                    
                    {/* Action shortcuts */}
                    <div className="mt-2 pt-2 border-t border-slate-200/50 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const promoMsg = `Check out our "${prod.name}" ($${prod.price}): ${prod.description}.`;
                          setReplyText((prev) => (prev ? prev + " " : "") + promoMsg);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-white font-bold text-[9px] transition-colors cursor-pointer"
                        title="Paste promotional link info in draft"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Insert Info Link</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`Hi! I highly recommend checking out "${prod.name}" ($${prod.price}): ${prod.description}`);
                        }}
                        className="p-1 px-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Copy to Clipboard"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {STORE_PRODUCTS.filter((prod) =>
                  prod.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center text-[10px] text-slate-400 italic py-4">
                    No matching products found in catalog.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OMNICHANNEL TELEGRAM TEST BENCH SIMULATOR */}
          <div className="border-t border-slate-200 pt-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5 mb-2.5">
              <span>🤖 Omnichannel Telegram Simulator</span>
            </h4>
            <div className="bg-white p-3.5 rounded-xl border border-blue-200 text-xs space-y-3.5 shadow-sm">
              <span className="block text-slate-500 text-[10px] leading-relaxed">
                Pretend to be an external customer sending bot messages over Telegram to inspect real-time dashboard inputs!
              </span>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">simulated Sender name</label>
                <input
                  type="text"
                  value={tgSenderName}
                  onChange={(e) => setTgSenderName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">simulated Bot message</label>
                <textarea
                  rows={2}
                  value={tgMessageText}
                  onChange={(e) => setTgMessageText(e.target.value)}
                  placeholder="Type Telegram question..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              <button
                type="button"
                onClick={handleSimulateTelegram}
                disabled={isSimulatingTg || !tgMessageText.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold tracking-tight transition shadow-sm shadow-sky-500/10 cursor-pointer disabled:bg-slate-200 text-[11px]"
              >
                <Send className="w-3.5 h-3.5 fill-white" />
                <span>Transmit Telegram Message</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
