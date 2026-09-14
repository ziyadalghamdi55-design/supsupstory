/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBilingual } from '../BilingualContext';
import { useCurrency } from '../CurrencyContext';
import { StoreProduct, StoreOrder, StoreReview } from '../types';
import CheckoutModal from './CheckoutModal';
import OrderTrackModal from './OrderTrackModal';
import FloatingChatWidget from './FloatingChatWidget';
import FAQAccordion from './FAQAccordion';
import LiveSalesNotification from './LiveSalesNotification';
import StorefrontFooter from './StorefrontFooter';
import TelegramFloatingButton from './TelegramFloatingButton';
import CurrencySwitcher from './CurrencySwitcher';
import PWAInstallBanner from './PWAInstallBanner';
import { 
  Search, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  Mail, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Code,
  Palette,
  GraduationCap,
  Terminal,
  Server,
  Bot,
  LayoutDashboard,
  PackageCheck,
  Globe,
  Tag,
  ChevronRight,
  TrendingUp,
  Star,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  Monitor,
  Gamepad2
} from 'lucide-react';

export default function StorefrontView() {
  const { language, direction, toggleLanguage } = useBilingual();
  const { format: formatMoney } = useCurrency();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals state
  const [checkoutProduct, setCheckoutProduct] = useState<StoreProduct | null>(null);
  const [showOrderTracker, setShowOrderTracker] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<StoreOrder | null>(null);
  const [reviews, setReviews] = useState<StoreReview[]>([]);

  // Load products from backend
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load store products', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviews(data);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchReviews();
  }, []);

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const nameMatch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.name_ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description_ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.platform || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.region || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!nameMatch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'Subscriptions') {
      return p.category.toLowerCase().includes('sub') || (p.category_ar && p.category_ar.includes('اشتراك'));
    }
    if (selectedCategory === 'Games') {
      return p.category.toLowerCase().includes('game') || (p.category_ar && p.category_ar.includes('ألعاب'));
    }
    if (selectedCategory === 'AI Tools') {
      return p.category.toLowerCase().includes('ai') || p.category.toLowerCase().includes('bot') || (p.category_ar && p.category_ar.includes('ذكاء'));
    }
    if (selectedCategory === 'Templates') {
      return p.category.toLowerCase().includes('template') || p.category.toLowerCase().includes('ui') || p.category.toLowerCase().includes('script') || p.category.toLowerCase().includes('dev');
    }

    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const categoryTabs = [
    { id: 'all', en: 'All Products', ar: 'الكل' },
    { id: 'Subscriptions', en: 'Subscriptions', ar: 'اشتراكات' },
    { id: 'Games', en: 'Gaming & Keys', ar: 'ألعاب' },
    { id: 'AI Tools', en: 'AI Tools', ar: 'أدوات ذكاء اصطناعي' },
    { id: 'Templates', en: 'Templates & Dev', ar: 'قوالب وتطوير' },
  ];

  const getProductIcon = (iconName?: string) => {
    switch (iconName) {
      case 'code':
        return <Code className="w-5 h-5 text-blue-500" />;
      case 'palette':
        return <Palette className="w-5 h-5 text-purple-500" />;
      case 'graduation-cap':
        return <GraduationCap className="w-5 h-5 text-amber-500" />;
      case 'terminal':
        return <Terminal className="w-5 h-5 text-emerald-500" />;
      case 'server':
        return <Server className="w-5 h-5 text-cyan-500" />;
      case 'bot':
        return <Bot className="w-5 h-5 text-rose-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white flex flex-col font-sans">
      {/* TOP ANNOUNCEMENT TICKER */}
      <div className="bg-slate-950 text-slate-200 py-2.5 px-4 text-xs font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">
              {language === 'en' ? 'Shakhsi Digital Storefront' : 'متجر شخصي الرقمي'}
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              {language === 'en' 
                ? 'Instant automated delivery via Email & Telegram within seconds.' 
                : 'تسليم وتفعيل فوري للبطاقات والتراخيص عبر البريد وتيليجرام.'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <CurrencySwitcher />
            <span className="text-slate-600">|</span>
            <button
              onClick={toggleLanguage}
              className="text-slate-300 hover:text-white flex items-center gap-1.5 transition text-xs cursor-pointer font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* STORE MAIN HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-950 flex items-center justify-center rounded-xl shadow-xs border border-slate-800">
              <span className="font-black text-white text-base font-sans">ش</span>
            </div>
            <div>
              <Link to="/" className="font-black text-lg tracking-tight text-slate-950 flex items-center gap-1">
                <span>شخصي</span>
                <span className="text-slate-400 font-normal text-xs font-mono">Platform</span>
              </Link>
              <span className="text-[10px] block text-slate-500 -mt-1 font-mono tracking-wider font-semibold">
                {language === 'en' ? 'DIGITAL STOREFRONT' : 'المتجر الرقمي للتسليم الفوري'}
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#products" className="hover:text-slate-950 transition">
              {language === 'en' ? 'Digital Products' : 'المنتجات الرقمية'}
            </a>
            <Link
              to="/track"
              className="hover:text-slate-950 transition flex items-center gap-1 cursor-pointer text-emerald-600 font-extrabold"
            >
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'en' ? 'Track Order & Licenses' : 'تتبع الطلب واسترجاع التراخيص'}</span>
            </Link>
            <a href="#guarantee" className="hover:text-slate-950 transition">
              {language === 'en' ? 'Delivery Guarantee' : 'ضمان التسليم'}
            </a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/track"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300/80 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 text-xs font-bold transition shadow-2xs cursor-pointer"
              title={language === 'en' ? 'My Purchases / Vault' : 'مشترياتي / استرجاع الأكواد'}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{language === 'en' ? 'My Purchases' : 'مشترياتي والأكواد'}</span>
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'en' ? 'Dashboard' : 'لوحة التحكم'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-white border-b border-slate-200/80 pt-12 pb-16 lg:pt-16 lg:pb-20 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'en' ? 'Automated Instant Delivery 24/7' : 'تسليم فوري ومباشر 24/7'}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.2]">
              {language === 'en' 
                ? 'Premium Digital Products, Licenses & Developer Assets' 
                : 'متجر المنتجات والتراخيص الرقمية بتسليم فوري مؤتمت'}
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {language === 'en'
                ? 'Explore top-tier verified codebases, cloud setup templates, digital license cards and developer toolkits. Receive your activation credentials immediately upon payment.'
                : 'تصفح باقة مختارة من القوالب البرمجية، التراخيص الرقمية، وأدوات المطورين المعتمدة. استلم كود التفعيل ورابط التحميل في بريدك وتيليجرام فور السداد مباشرة.'}
            </p>

            {/* Search and Filter Box */}
            <div className="pt-2 max-w-xl mx-auto">
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-slate-950 focus-within:bg-white transition">
                <Search className="w-5 h-5 text-slate-400 ml-3 rtl:mr-3 rtl:ml-0 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'en' ? 'Search by product name, template, or category...' : 'ابحث باسم المنتج، القالب البرمجي، أو التصنيف...'}
                  className="w-full text-xs sm:text-sm bg-transparent px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-2 text-xs text-slate-400 hover:text-slate-700 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Trust signals strip */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 font-medium">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>{language === 'en' ? 'Instant Activation Code' : 'توليد فوري للأكواد'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>{language === 'en' ? 'Delivered to Email & Telegram' : 'إرسال آلي للإيميل وتيليجرام'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <span>{language === 'en' ? 'Verified Digital Licenses' : 'تراخيص رقمية معتمدة'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIGITAL PRODUCTS GRID SECTION */}
      <section id="products" className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Category Pills Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
              <span>{language === 'en' ? 'Digital Catalog' : 'كتالوج المنتجات الرقمية'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 font-mono text-slate-700">
                {filteredProducts.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'en' 
                ? 'All products are equipped with instant digital delivery and license verification.'
                : 'جميع المنتجات تشمل تسليماً فورياً وضماناً للتفعيل الدائم.'}
            </p>
          </div>

          {/* Categories Tab Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categoryTabs.map((tab) => {
              const isActive = selectedCategory.toLowerCase() === tab.id.toLowerCase();
              const displayLabel = language === 'ar' ? tab.ar : tab.en;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 h-72 animate-pulse space-y-4">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
                <div className="pt-4 h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty state */
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {language === 'en' ? 'No digital products found' : 'لم يتم العثور على منتجات مطابقة'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {language === 'en' 
                ? 'Try adjusting your search keywords or switch category filter.' 
                : 'جرب تعديل كلمات البحث أو تصفح تصنيفاً آخر.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
            >
              {language === 'en' ? 'Reset Filters' : 'إعادة ضبط التصفية'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8">
            {filteredProducts.map((prod) => {
              const displayName = language === 'ar' && prod.name_ar ? prod.name_ar : prod.name;
              const displayDesc = language === 'ar' && prod.description_ar ? prod.description_ar : prod.description;
              const displayCategory = language === 'ar' && prod.category_ar ? prod.category_ar : prod.category;
              const displayBadge = language === 'ar' && prod.badge_ar ? prod.badge_ar : prod.badge;
              const displayRegion = language === 'ar' && prod.region_ar ? prod.region_ar : prod.region;
              const displayPlatform = language === 'ar' && prod.platform_ar ? prod.platform_ar : prod.platform;
              const isOutOfStock = prod.stockCount !== undefined && prod.stockCount === 0;

              return (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Card top banner/badge */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      {/* Icon Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 group-hover:border-slate-400 transition duration-200 shadow-xs">
                        {getProductIcon(prod.icon)}
                      </div>

                      {/* Pill Badge */}
                      <div className="flex flex-col items-end gap-1">
                        {displayBadge && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 font-sans tracking-wide">
                            {displayBadge}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
                          {displayCategory}
                        </span>
                      </div>
                    </div>

                    {/* Product Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-950 transition leading-snug">
                      {displayName}
                    </h3>

                    {/* Region & Platform Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {displayRegion && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Globe className="w-3 h-3 text-emerald-600" />
                          <span>{displayRegion}</span>
                        </span>
                      )}
                      {displayPlatform && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <Monitor className="w-3 h-3 text-blue-600" />
                          <span>{displayPlatform}</span>
                        </span>
                      )}
                    </div>

                    {/* Stock indicator badge */}
                    <div className="flex items-center gap-2 mt-2">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          <AlertCircle className="w-3 h-3 text-slate-400" />
                          <span>
                            {language === 'ar' ? 'نفد المخزون مؤقتاً' : 'Out of Stock'}
                          </span>
                        </span>
                      ) : prod.stockCount !== undefined && prod.stockCount < 3 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          <span>
                            {language === 'ar' 
                              ? `متبقي ${prod.stockCount} فقط!` 
                              : `Only ${prod.stockCount} left!`}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>
                            {language === 'ar'
                              ? `متوفر (${prod.stockCount !== undefined ? prod.stockCount : 10} مفتاح)`
                              : `In Stock (${prod.stockCount !== undefined ? prod.stockCount : 10} keys)`}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Product Description */}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {displayDesc}
                    </p>
                  </div>

                  {/* Card Bottom: Instant delivery badge + Price & Checkout Button */}
                  <div className="pt-5 mt-5 border-t border-slate-100 space-y-3.5">
                    {/* Instant delivery guarantee chip */}
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-lg border border-emerald-200/90">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold">
                        {language === 'en' 
                          ? '⚡ Instant Automated Delivery' 
                          : '⚡ تسليم فوري ومباشر للكود'}
                      </span>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">
                          {language === 'en' ? 'Price' : 'السعر'}
                        </span>
                        <div className="flex items-baseline">
                          <span className="text-xl sm:text-2xl font-black text-slate-950 font-mono tracking-tight">
                            {formatMoney(prod.price, language === 'ar' ? 'ar' : 'en')}
                          </span>
                        </div>
                      </div>

                      {isOutOfStock ? (
                        <button
                          type="button"
                          disabled
                          className="px-4 py-2.5 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-1.5"
                        >
                          <span>{language === 'en' ? 'Out of Stock' : 'نفد المخزون'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCheckoutProduct(prod)}
                          className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 active:scale-95 text-white rounded-xl text-xs font-bold transition duration-150 flex items-center gap-2 shadow-xs cursor-pointer group-hover:bg-emerald-600"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Buy Now' : 'شراء الآن'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* GUARANTEE & HOW IT WORKS SECTION */}
      <section id="guarantee" className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
            <h3 className="text-xl font-bold text-slate-950">
              {language === 'en' ? 'How Instant Digital Delivery Works' : 'كيف يعمل التسليم الرقمي الفوري؟'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'en'
                ? 'Three frictionless steps from selection to receiving your active digital license.'
                : 'ثلاث خطوات سريعة وبسيطة تفصلك عن استلام كود التفعيل والبدء فورياً.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {language === 'en' ? 'Select & Checkout' : 'اختر المنتج وأتمم الطلب'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'en'
                  ? 'Click "Buy Now" on any digital item and enter your target email address and optional Telegram handle.'
                  : 'اضغط على "شراء الآن" لأي منتج رقمي، وأدخل بريدك الإلكتروني ومعرف تيليجرام لاستلام الإشعار.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {language === 'en' ? 'Instant Key Generation' : 'توليد آلي لمفتاح الترخيص'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'en'
                  ? 'Our backend engine immediately mints your unique digital license key and stores it securely.'
                  : 'يقوم نظام المنصة بتوليد مفتاح ترخيص رقمي مشفر وخاص بك فورياً وربطه ببيانات الشراء.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {language === 'en' ? 'Direct Dispatch & Tracking' : 'استلام فوري وإمكانية التتبع'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'en'
                  ? 'The license code displays on-screen, dispatches to your email, and can be retrieved anytime via "Track Order".'
                  : 'يظهر الكود على شاشتك مباشرة، ويصل لبريدك، ويمكنك استرجاعه في أي وقت عبر زر "تتبع الطلب".'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS & TESTIMONIALS SECTION */}
      {reviews.length > 0 && (
        <section className="py-14 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{language === 'en' ? 'Verified Buyer Reviews' : 'تقييمات وتجارب المشترين الموثقة'}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                {language === 'en' ? 'What our customers say about instant delivery' : 'ماذا يقول عملاؤنا عن سرعة التسليم وجودة الأكواد'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'en'
                  ? 'Genuine feedback submitted by verified license holders immediately after checkout.'
                  : 'تجارب حقيقية يشاركها العملاء بعد إتمام الشراء واستلام تراخيصهم مباشرة.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Reviewer Details */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {rev.customer_name || (language === 'en' ? 'Verified Buyer' : 'مشتري موثق')}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[180px]">
                        {rev.product_name}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{language === 'en' ? 'Verified' : 'شراء موثق'}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      <FAQAccordion />

      {/* RICH FOOTER & POLICIES */}
      <StorefrontFooter />

      {/* LIVE SALES PROOF NOTIFICATIONS */}
      <LiveSalesNotification />

      {/* CHECKOUT MODAL POPUP */}
      <CheckoutModal
        product={checkoutProduct}
        onClose={() => setCheckoutProduct(null)}
        onOrderCompleted={(order) => {
          setLastCompletedOrder(order);
          fetchProducts(); // Refresh purchase counts & stock
          fetchReviews();  // Refresh reviews if any submitted
        }}
      />

      {/* ORDER TRACKING MODAL */}
      {showOrderTracker && (
        <OrderTrackModal onClose={() => setShowOrderTracker(false)} />
      )}

      {/* FLOATING SHAKHSI GEMINI ASSISTANT CHAT WIDGET */}
      <FloatingChatWidget workspaceId="w_demo" />

      {/* QUICK TELEGRAM SUPPORT FLOATING BUTTON */}
      <TelegramFloatingButton />

      {/* PWA INSTALL MOBILE BANNER */}
      <PWAInstallBanner />
    </div>
  );
}
