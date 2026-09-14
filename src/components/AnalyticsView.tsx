/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { 
  BarChart3, 
  Sparkles, 
  Bot, 
  Clock, 
  Link2, 
  Copy, 
  Check, 
  PieChart,
  ChevronDown,
  Layers,
  Activity,
  MessageSquare,
  ShoppingBag,
  Plus,
  Search,
  Save,
  CheckCircle2,
  Trash2,
  ListFilter,
  Send,
  User
} from 'lucide-react';

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  code: string;
  viewsCount: number;
  purchasesCount: number;
}

export default function AnalyticsView() {
  const { language, dictionary } = useBilingual();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sources' | 'replies' | 'products'>('sources');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Products states
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    price: 0,
    category: '',
    code: '',
    description: ''
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Conversations (Replies with People) states
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Custom states for direct replies and intervention under Analytics replies list
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [selectedConvThread, setSelectedConvThread] = useState<any>(null); // contains { conversation, contact, messages }
  const [replyBody, setReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // UTM URL builder states
  const [storeUrl, setStoreUrl] = useState('https://mycreatorstore.com');
  const [utmSource, setUtmSource] = useState('instagram-ad');
  const [utmCampaign, setUtmCampaign] = useState('summer-deals');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copiedActive, setCopiedActive] = useState(false);

  // Localization
  const t = {
    dropdownLabel: language === 'en' ? 'Select Analytics Dashboard Category' : 'اختر تصنيف شاشة التحليلات والمؤشرات',
    optSourcesSummary: language === 'en' ? 'Traffic Sources (Where visitors entered from)' : 'توزيع مصادر الزيارات (من أين دخلوا)',
    optRepliesSummary: language === 'en' ? 'Communications & Replies (Conversations with People)' : 'الردود والمحادثات (الردود مع الناس)',
    optProductsSummary: language === 'en' ? 'Store Products Configurations (Custom Keys & Codes)' : 'المنتجات وأكوادها (من أين أختار المنتجات)',
    
    // Category Details
    sourcesHeader: language === 'en' ? 'Traffic Origin & Referral Campaigns' : 'قنوات تتبع مصادر الزوار والحملات الإعلانية',
    sourcesSub: language === 'en' ? 'Analyze referral logs, campaign parameters, and direct access distributions.' : 'شاهد من أين دخل الزوار لمتجرك بالتفصيل، وحلل أداء الحملات الإعلانية النشطة.',
    
    repliesHeader: language === 'en' ? 'Customer Communications Audit & Logs' : 'سجل مراجعة الردود والمحادثات مع الناس',
    repliesSub: language === 'en' ? 'Audit live messages, reply durations, channels, and AI-handled cases.' : 'تتبع تفاعل مساعد الذكاء الاصطناعي مع الناس، وابحث في سجل الرسائل الأخيرة لكل زائر.',
    
    productsHeader: language === 'en' ? 'Digital Products Catalog & Instant Fulfillment Codes' : 'كتالوج أكواد المنتجات والتحضير الرقمي الفوري',
    productsSub: language === 'en' ? 'Set price points, categorization, and assign custom deployment codes or licenses.' : 'حدّد أسعار قوالبك، تصنيفاتها، وقم بكتابة "الكود حقه" لإرساله للعميل تلقائياً عند الاقتناء.',

    productCode: language === 'en' ? 'Fulfillment Code / License Key' : 'كود المنتج البرمجي (الكود حقه)',
    productPrice: language === 'en' ? 'Price ($)' : 'سعر المنتج ($)',
    saveChanges: language === 'en' ? 'Save Changes' : 'حفظ كود المنتج وبياناته',
    productUpdatedSuccess: language === 'en' ? 'Product updated successfully!' : 'تم تحديث الكود الخاص بالمنتج بنجاح!',
    productCreatedSuccess: language === 'en' ? 'New product created successfully!' : 'تم تسجيل منتج جديد بنجاح في متجرك!',
    
    views: language === 'en' ? 'Interest Views' : 'عدد مشاهدات المنتج',
    purchases: language === 'en' ? 'Fulfillment Sales' : 'مبيعات الكود / طلبات التفعيل',
    searchPlaceholder: language === 'en' ? 'Search visitors by name, email or message content...' : 'البحث في المحادثات باسم العميل، بريده أو الرسالة...',
    noProductCodeError: language === 'en' ? 'Please fill out a valid shortcode key.' : 'الرجاء كتابة كود بريد المنتج أولاً لتخصيصه.',
    addNewProductBtn: language === 'en' ? '+ Create Custom Product' : 'تسجيل منتج رقمي جديد +',
    productName: language === 'en' ? 'Product Title' : 'اسم المنتج أو القالب',
    productCategory: language === 'en' ? 'Category Name' : 'تصنيف المنتجات',
    productDesc: language === 'en' ? 'Short Description' : 'نبذة وميزات القالب البرمجي',
    cancel: language === 'en' ? 'Cancel' : 'إلغاء',
    loading: language === 'en' ? 'Loading thread...' : 'جاري تحميل المحادثة...'
  };

  // Fetch Stats Wrapper
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics', err);
    }
  };

  // Fetch Products Catalog
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching store products', err);
    }
  };

  // Fetch Conversation History
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching admin index conversations', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchConversations();

    // Dynamically retrieve workspace and pre-populate URL input box with the real Sandboxed widget URL,
    // which completely solves "unreachable platform link / error inside preview"!
    fetch('/api/workspace')
      .then(res => res.json())
      .then(ws => {
        if (ws.workspace_id) {
          const defaultUrl = `${window.location.origin}/widget/${ws.workspace_id}`;
          setStoreUrl(defaultUrl);
          // Auto-assemble the generated URL upon startup for quick testing!
          setGeneratedUrl(`${defaultUrl}?shakhsi_ws=${ws.workspace_id}&utm_source=${utmSource}&utm_campaign=${utmCampaign}&utm_referrer=${window.location.origin}`);
        }
      })
      .catch(() => {});
  }, []);

  const fetchActiveConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setSelectedConvThread(data);
      }
    } catch (err) {
      console.error('Error fetching dynamic conversation messages', err);
    }
  };

  useEffect(() => {
    if (!selectedConvId) {
      setSelectedConvThread(null);
      return;
    }

    fetchActiveConversation(selectedConvId);
    const interval = setInterval(() => {
      fetchActiveConversation(selectedConvId);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConvId]);

  const handleUpdateProduct = async (productId: string, updatedFields: Partial<StoreProduct>) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        setEditingProductId(null);
        setSuccessToast(t.productUpdatedSuccess);
        setTimeout(() => setSuccessToast(''), 3000);
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to update product code', err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.code) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prodForm.name,
          price: Number(prodForm.price) || 29,
          category: prodForm.category || 'Templates',
          code: prodForm.code,
          description: prodForm.description || ''
        })
      });
      if (res.ok) {
        setIsAddingProduct(false);
        setProdForm({ name: '', price: 0, category: 'Templates', code: '', description: '' });
        setSuccessToast(t.productCreatedSuccess);
        setTimeout(() => setSuccessToast(''), 3000);
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to register product', err);
    }
  };

  // Generate UTM target URL
  const handleGenerateUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!storeUrl.trim()) return;

    try {
      const res = await fetch('/api/workspace');
      const ws = await res.json();
      let targetUrl = storeUrl.trim();
      // Auto-validate and prepend HTTPS protocol
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }
      const urlObj = new URL(targetUrl);
      urlObj.searchParams.set('shakhsi_ws', ws.workspace_id);
      urlObj.searchParams.set('utm_source', utmSource);
      urlObj.searchParams.set('utm_campaign', utmCampaign);
      urlObj.searchParams.set('utm_referrer', window.location.origin);
      
      setGeneratedUrl(urlObj.toString());
    } catch (err) {
      console.error('Error generating link:', err);
      let targetUrl = storeUrl.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }
      const base = targetUrl.includes('?') ? `${targetUrl}&` : `${targetUrl}?`;
      setGeneratedUrl(`${base}shakhsi_ws=w_demo&utm_source=${utmSource}&utm_campaign=${utmCampaign}&utm_referrer=${window.location.origin}`);
    }
  };

  const handleOwnerSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !replyBody.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyBody.trim() })
      });

      if (res.ok) {
        setReplyBody('');
        // Refresh immediately
        fetchActiveConversation(selectedConvId);
        fetchConversations(); // refresh main list snippet
      }
    } catch (err) {
      console.error('Failed to submit manual owner reply', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (convId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchConversations();
        fetchActiveConversation(convId);
      }
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const copyToClipboard = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopiedActive(true);
    setTimeout(() => setCopiedActive(false), 2000);
  };

  // Filtering for option 2 (Replies with people)
  const filteredConversations = conversations.filter((c) => {
    const term = searchTerm.toLowerCase();
    const contactName = (c.contact?.name || '').toLowerCase();
    const contactEmail = (c.contact?.email || '').toLowerCase();
    const lastMsg = (c.last_message_preview || '').toLowerCase();
    const matchesSearch = contactName.includes(term) || contactEmail.includes(term) || lastMsg.includes(term);

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  return (
    <div className="flex-grow flex flex-col gap-6 select-none font-sans">
      
      {/* Dynamic Success notifications absolute badge */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold leading-none">{successToast}</span>
        </div>
      )}

      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{dictionary.analyticsTitle}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'en' 
              ? 'Multi-dimensional analysis: visitor source referrals, active communications with people, and product SKU settings.' 
              : 'تحليلات متعددة الأبعاد: قنوات وجنسيات تتبع الزوار، الردود والتفاعل اللحظي مع الناس، وأكواد وقيم تراخيص المنتجات.'}
          </p>
        </div>

        {/* Dynamic Select Menu Dropdown element as explicitly demanded */}
        <div className="relative shrink-0">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            {t.dropdownLabel}
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            type="button"
            className="w-full sm:w-[350px] inline-flex items-center justify-between text-left px-5 py-3 bg-white border border-slate-200 hover:border-slate-400 rounded-xl shadow-xs text-xs font-semibold text-slate-800 transition duration-150 cursor-pointer"
          >
            <span className="flex items-center gap-2 text-slate-900">
              {activeTab === 'sources' && <PieChart className="w-4 h-4 text-emerald-500" />}
              {activeTab === 'replies' && <MessageSquare className="w-4 h-4 text-purple-500" />}
              {activeTab === 'products' && <ShoppingBag className="w-4 h-4 text-indigo-500" />}
              <span>
                {activeTab === 'sources' && t.optSourcesSummary}
                {activeTab === 'replies' && t.optRepliesSummary}
                {activeTab === 'products' && t.optProductsSummary}
              </span>
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Expanded dropdown items panel */}
          {isDropdownOpen && (
            <div className="absolute right-0 left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-40 transition-all duration-200">
              <button
                onClick={() => { setActiveTab('sources'); setIsDropdownOpen(false); }}
                type="button"
                className={`w-full text-left px-5 py-3 text-xs font-bold font-sans tracking-wide hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 ${
                  activeTab === 'sources' ? 'bg-slate-50/50 text-slate-950 font-black' : 'text-slate-650'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{t.optSourcesSummary}</span>
              </button>

              <button
                onClick={() => { setActiveTab('replies'); setIsDropdownOpen(false); }}
                type="button"
                className={`w-full text-left px-5 py-3 text-xs font-bold font-sans tracking-wide hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 ${
                  activeTab === 'replies' ? 'bg-slate-50/50 text-slate-950 font-black' : 'text-slate-650'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>{t.optRepliesSummary}</span>
              </button>

              <button
                onClick={() => { setActiveTab('products'); setIsDropdownOpen(false); }}
                type="button"
                className={`w-full text-left px-5 py-3 text-xs font-bold font-sans tracking-wide hover:bg-slate-50 flex items-center gap-3 ${
                  activeTab === 'products' ? 'bg-slate-50/50 text-slate-950 font-black' : 'text-slate-650'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>{t.optProductsSummary}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CORE PERFORMANCE STATS SUMMARY STRIP */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative flex flex-col justify-between min-h-[140px] gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {dictionary.totalConversations}
              </span>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-950 font-mono tracking-tight block">
                {stats.totalConversations}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                {language === 'en' ? 'Active channels logs' : 'سجلات القنوات النشطة'}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative flex flex-col justify-between min-h-[140px] gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500">
                {dictionary.aiHandledPercentage}
              </span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-750">
                <Bot className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-purple-950 font-mono tracking-tight block">
                {stats.aiHandledPercent}%
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                {language === 'en' ? 'Resolved automated using Gemini' : 'تم حلها آلياً عبر الذكاء الاصطناعي'}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative flex flex-col justify-between min-h-[140px] gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">
                {dictionary.avgResponseTime}
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-emerald-950 font-mono tracking-tight block">
                {stats.avgResponseTime}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                {language === 'en' ? 'Average live reply speed' : 'متوسط سرعة الاستجابة المباشرة'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-slate-400">Syncing live analytics snapshot...</div>
      )}

      {/* RENDER CURRENT TAB VIEW FROM DROPDOWN SELECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
        
        {/* VIEW 1: SOURCES AND TRAFFIC (من أين دخلوا) */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PieChart className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.sourcesHeader}</h3>
                  <p className="text-xs text-slate-500">{t.sourcesSub}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              
              {/* Traffic progress tracking */}
              <div className="lg:col-span-5 space-y-5">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  {language === 'en' ? 'Entry platform shares' : 'تصنيف نسب قنوات الدخول'}
                </h4>
                
                <div className="space-y-4">
                  {stats && stats.sources ? (
                    stats.sources.map((src: any, index: number) => {
                      const totalChats = stats.totalConversations || 1;
                      const ratio = Math.round((src.value / totalChats) * 100);
                      return (
                        <div key={index} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>{src.name}</span>
                            <span className="font-mono text-[11px] text-slate-500">{src.value} ({ratio}%)</span>
                          </div>
                          <div className="w-full h-3 bg-slate-150 rounded-full overflow-hidden border border-slate-200/50">
                            <div 
                              style={{ width: `${ratio}%` }}
                              className="h-full rounded-full transition-all bg-gradient-to-r from-emerald-600 to-teal-500" 
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400">No telemetry logs found.</div>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 border rounded-xl text-[11px] text-slate-600 leading-relaxed">
                  📢 <strong>{language === 'en' ? 'Self-Updating Campaign Links:' : 'تتبع آلي للحملات:'}</strong> <br />
                  {language === 'en' 
                    ? 'Whenever someone visits your digital storefront through a link built in the builder, Shakhsi records their campaign referrers and updates these channels instantly.' 
                    : 'بمجرد نقر العميل على رابط مخصص مُنشأ من حاقن الروابط باليسار، سيتم التعرف على وسيط الحملة تلقائياً وتحديث هذا المخطط البياني في نفس اللحظة!'}
                </div>
              </div>

              {/* Campaign builder link parameters set */}
              <div className="lg:col-span-7 bg-slate-50 border p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Link2 className="w-4 h-4" />
                    <span>{dictionary.utmBuilder}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{dictionary.utmGeneratorDesc}</p>
                </div>

                <form onSubmit={handleGenerateUrl} className="my-4 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{dictionary.storeUrl}</label>
                    <input
                      type="text"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      placeholder="https://mycreatorstore.com"
                      className="w-full text-xs px-3.5 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">UTM Source</label>
                      <input
                        type="text"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        placeholder="e.g. twitter-ad, instagram-ad"
                        className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{dictionary.campaignLabel}</label>
                      <input
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        placeholder="e.g. spring-promo"
                        className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer select-none"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{dictionary.generateLink}</span>
                  </button>
                </form>

                <div className="p-3 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl flex items-center justify-between text-xs font-mono min-h-[50px] overflow-hidden">
                  <span className="truncate pr-4 select-all text-[11px] text-slate-350">
                    {generatedUrl || dictionary.generatedUrlPlaceholder}
                  </span>
                  {generatedUrl && (
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="bg-slate-800 text-slate-300 hover:text-white p-2 border border-slate-700 rounded-lg transition shrink-0 cursor-pointer"
                    >
                      {copiedActive ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {generatedUrl && (
                  <div className="flex justify-end pt-1">
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-extrabold text-[11px] px-3 py-1.5 rounded-lg border border-indigo-200 cursor-pointer transition inline-flex items-center gap-1 leading-none select-none text-center"
                    >
                      <span>{language === 'en' ? 'Open & Test Campaign Link ↗' : 'افتح وجرّب الرابط المولد ↗'}</span>
                    </a>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: REPLIES WITH PEOPLE (الردود مع الناس) */}
        {activeTab === 'replies' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.repliesHeader}</h3>
                  <p className="text-xs text-slate-500">{t.repliesSub}</p>
                </div>
              </div>
            </div>

            {/* Split layout: List of conversations on the left, Active chat window on the right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3">
              
              {/* Conversations Index List */}
              <div className={`${selectedConvId ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
                
                {/* Search & filters inside list headers */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1 select-none gap-2 shrink-0">
                    <span>{language === 'en' ? 'Status:' : 'حالة التصفية:'}</span>
                    <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg">
                      {['all', 'open', 'snoozed', 'done'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          type="button"
                          className={`px-2 py-1 text-[10px] font-black rounded uppercase cursor-pointer transition select-none ${
                            statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {st === 'all' ? (language === 'en' ? 'All' : 'الكل') : ''}
                          {st === 'open' ? (language === 'en' ? 'Open' : 'نشط') : ''}
                          {st === 'snoozed' ? (language === 'en' ? 'Snoozed' : 'مؤجل') : ''}
                          {st === 'done' ? (language === 'en' ? 'Done' : 'مكتمل') : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conversation List Rows */}
                <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-150 bg-white max-h-[500px] overflow-y-auto shadow-xs">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((c) => {
                      const avatarColor = c.contact?.avatar_color || 'bg-slate-400';
                      const initials = (c.contact?.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                      const isSelected = selectedConvId === c.id;
                      const hasIntervention = c.intervention_requested === true;
                      const isUrgent = c.is_urgent === true;

                      return (
                        <div 
                          key={c.id} 
                          onClick={() => setSelectedConvId(c.id)}
                          className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer duration-100 transition relative overflow-hidden ${
                            isSelected 
                              ? 'bg-purple-50/70 border-l-4 border-purple-650' 
                              : isUrgent
                                ? 'bg-red-50/60 border-l-4 border-red-500 hover:bg-red-50 animate-pulse'
                                : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Avatar */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shrink-0 ${avatarColor}`}>
                              {initials}
                            </div>
                            
                            {/* Short details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-black text-slate-950 truncate max-w-[120px]">
                                  {c.contact?.name}
                                </span>
                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                                  c.channel === 'telegram' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {c.channel === 'telegram' ? 'Telegram' : 'Widget'}
                                </span>

                                {isUrgent && (
                                  <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-red-600 text-white animate-bounce uppercase tracking-wider">
                                    🚨 {language === 'en' ? 'URGENT' : 'عاجل طارئ'}
                                  </span>
                                )}

                                {hasIntervention && !isUrgent && (
                                  <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-red-100 border border-red-200 text-red-700 animate-pulse uppercase tracking-wider">
                                    ⚠️ {language === 'en' ? 'Intervention' : 'تدخل مطلوب'}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[150px] font-sans">
                                {c.last_message_preview}
                              </p>
                            </div>
                          </div>

                          {/* Secondary status pill and dates */}
                          <div className="shrink-0 flex flex-col items-end gap-1 font-mono text-[9px] select-none text-right">
                            <span className={`px-1.5 py-0.2 text-[8px] rounded font-black uppercase ${
                              c.status === 'open' ? 'bg-rose-50 text-rose-600 border border-rose-150' :
                              c.status === 'done' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' :
                              'bg-amber-50 text-amber-600 border border-amber-150'
                            }`}>
                              {c.status}
                            </span>
                            <span className="text-slate-400 text-[8px]">
                              {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-10 text-center text-xs text-slate-400 italic bg-white">
                      {language === 'en' ? 'No conversation threads found.' : 'لم يتم العثور على أي محادثات تفصيلية.'}
                    </div>
                  )}
                </div>

              </div>

              {/* Live Direct Intervention Chat Panel */}
              {selectedConvId && (
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[440px] max-h-[500px] overflow-hidden">
                  
                  {/* Selected Chat Header info */}
                  {selectedConvThread ? (
                    <>
                      <div className="border-b border-slate-200 pb-3 mb-3 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs text-center border">
                            {selectedConvThread.contact?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{selectedConvThread.contact?.name}</span>
                              <span className={`text-[8px] font-extrabold px-1.5 uppercase rounded ${
                                selectedConvThread.conversation?.channel === 'telegram' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                              }`}>
                                {selectedConvThread.conversation?.channel}
                              </span>
                            </h4>
                            <span className="text-[9px] text-slate-400 block truncate max-w-[170px] sm:max-w-xs">{selectedConvThread.contact?.email}</span>
                          </div>
                        </div>

                        {/* Dropdown status modifiers and close buttons */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={selectedConvThread.conversation?.status}
                            onChange={(e) => handleUpdateStatus(selectedConvId, e.target.value)}
                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 uppercase cursor-pointer"
                          >
                            <option value="open">Open / نشط</option>
                            <option value="snoozed">Snooze / مؤجل</option>
                            <option value="done">Done / مكتمل</option>
                          </select>
                          
                          <button
                            onClick={() => setSelectedConvId(null)}
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg shrink-0 cursor-pointer text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Conversation Timeline messages area */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 mb-3.5 flex flex-col">
                        {selectedConvThread.messages && selectedConvThread.messages.length > 0 ? (
                          selectedConvThread.messages.map((m: any) => {
                            const isAI = m.sender === 'ai';
                            const isAgent = m.sender === 'agent';
                            const isVisitor = m.sender === 'contact';
                            
                            // Special styled tag for requested interventions
                            if (m.body.includes('⚠️')) {
                              return (
                                <div key={m.id} className="mx-auto text-center my-2 select-none">
                                  <div className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-lg animate-pulse">
                                    {m.body}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col max-w-[80%] ${
                                  isVisitor ? 'self-start' : 'ml-auto text-right'
                                }`}
                              >
                                <span className="text-[7.5px] font-bold text-slate-400 mb-0.5 px-1 uppercase tracking-wider block">
                                  {isVisitor ? (language === 'en' ? 'Visitor / العميل' : 'العميل') : ''}
                                  {isAI ? (language === 'en' ? 'AI Bot / المساعد' : 'المساعد الذكي 🤖') : ''}
                                  {isAgent ? (language === 'en' ? 'Owner / المالك' : 'أنت (المالك) 👑') : ''}
                                </span>

                                <div className={`p-2.5 rounded-xl text-xs leading-relaxed font-sans ${
                                  isVisitor 
                                    ? 'bg-slate-100 text-slate-805 rounded-tl-none border border-slate-200 shadow-3xs' 
                                    : isAI 
                                    ? 'bg-slate-900 text-slate-200 rounded-tr-none border border-slate-800' 
                                    : 'bg-purple-600 text-white rounded-tr-none shadow-sm'
                                }`}>
                                  <p className="whitespace-pre-wrap">{m.body}</p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-xs text-slate-400 italic">
                            No messages logged in this thread.
                          </div>
                        )}
                      </div>

                      {/* Direct intervention input form */}
                      <form onSubmit={handleOwnerSendReply} className="border-t border-slate-100 pt-3 flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          placeholder={language === 'en' ? 'Type human intervention reply...' : 'اكتب ردك المباشر للعميل للتحدث معه...'}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 font-medium"
                        />
                        <button
                          type="submit"
                          disabled={isSendingReply || !replyBody.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold p-2.5 rounded-xl shrink-0 transition disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 select-none">
                      <span className="text-xs italic">{t.loading}</span>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

        {/* VIEW 3: STORE PRODUCTS AND CODES (من أين أختار المنتجات) */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            {/* Header section with optional creation toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShoppingBag className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.productsHeader}</h3>
                  <p className="text-xs text-slate-500">{t.productsSub}</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer select-none self-start"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addNewProductBtn}</span>
              </button>
            </div>

            {/* Expanded Product Creation module */}
            {isAddingProduct && (
              <form onSubmit={handleCreateProduct} className="p-5 border border-indigo-150 bg-indigo-50/20 rounded-2xl space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-indigo-800 tracking-wider">
                  {language === 'en' ? 'Register New Store Core Product' : 'تسجيل وإضافة قالب برمي جديد للمتجر'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">{t.productName}</label>
                    <input
                      type="text"
                      required
                      value={prodForm.name}
                      onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                      placeholder="e.g. NextJS SaaS Boilerplate"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">{t.productCategory}</label>
                    <input
                      type="text"
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                      placeholder="e.g. Templates, Education"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">{t.productPrice}</label>
                    <input
                      type="number"
                      required
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                      placeholder="e.g. 49"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">{t.productDesc}</label>
                    <input
                      type="text"
                      value={prodForm.description}
                      onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                      placeholder="e.g. Production ready boilerplate styled using Tailwind CSS"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">
                      {t.productCode} <span className="text-indigo-600 font-black">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={prodForm.code}
                      onChange={(e) => setProdForm({ ...prodForm, code: e.target.value })}
                      placeholder="e.g. SAAS-BOILER-KEY-X90"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsAddingProduct(false)}
                    type="button"
                    className="px-4 py-2 border text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50 cursor-pointer select-none"
                  >
                    {t.cancel}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer select-none"
                  >
                    {language === 'en' ? 'Register Product' : 'تسجيل القالب وحقن الكود'}
                  </button>
                </div>
              </form>
            )}

            {/* Catalog list representation and dynamic settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {products.length > 0 ? (
                products.map((p) => {
                  const isEditing = editingProductId === p.id;
                  const randomGrowthIndex = (p.purchasesCount / (p.viewsCount || 1)) * 100;

                  return (
                    <div 
                      key={p.id} 
                      className={`p-5 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-4 relative overflow-hidden ${
                        isEditing 
                          ? 'border-indigo-400 bg-indigo-50/5/10 ring-2 ring-indigo-150' 
                          : 'border-slate-200 bg-white hover:border-slate-350'
                      }`}
                    >
                      <div>
                        {/* Title and Badge statistics */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-full bg-slate-150 text-slate-650 border">
                              {p.category}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 mt-1.5">{p.name}</h4>
                          </div>
                          
                          <span className="text-base font-black text-slate-900 font-mono">
                            ${p.price}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 shrink-0 mt-1.5 leading-relaxed font-sans min-h-[36px]">
                          {p.description || (language === 'en' ? 'No supplemental details provided.' : 'لم توفر توصيفات إضافية.')}
                        </p>
                      </div>

                      {/* Code assignment area - This is specifically "المنتج هذا أحط الكود حقه" */}
                      <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-150 space-y-2">
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          📁 {t.productCode}
                        </label>

                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              defaultValue={p.code}
                              id={`input-code-${p.id}`}
                              className="flex-1 text-xs px-3 py-1.5 border border-indigo-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-bold font-mono text-slate-900"
                              placeholder="e.g. ZIP-SLUG-90"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById(`input-code-${p.id}`) as HTMLInputElement;
                                if (el) {
                                  handleUpdateProduct(p.id, { code: el.value.trim() });
                                }
                              }}
                              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs cursor-pointer"
                              title="Commit product code updates"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <code className="text-xs font-black font-mono text-slate-800 bg-white px-2.5 py-1 rounded border shadow-inner">
                              {p.code || 'NULL-KEY'}
                            </code>
                            <button
                              onClick={() => setEditingProductId(p.id)}
                              type="button"
                              className="text-[10px] shadow-xs border bg-white hover:bg-slate-50 px-2.5 py-1 text-slate-500 rounded font-bold transition cursor-pointer select-none"
                            >
                              {language === 'en' ? 'Edit Code' : 'تعديل الكود حقه'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Numerical views & purchases stats */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>{t.views}: <strong className="text-slate-650">{p.viewsCount || 0}</strong></span>
                        </span>

                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{t.purchases}: <strong className="text-indigo-650">{p.purchasesCount || 0}</strong></span>
                        </span>

                        <span className="text-slate-500 font-bold">
                          {language === 'en' ? 'Conversion Rate' : 'معدل الطلب'}: {Math.min(100, Math.round(randomGrowthIndex))}%
                        </span>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 col-span-2 text-xs text-slate-400 italic">
                  {language === 'en' ? 'No catalog products loaded.' : 'لم يتم العثور على أي منتجات بالكتالوج.'}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
