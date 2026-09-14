/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { useCurrency } from '../CurrencyContext';
import { StoreProduct, StoreOrder } from '../types';
import TroubleshootTicketModal from './TroubleshootTicketModal';
import CurrencySwitcher from './CurrencySwitcher';
import { 
  X, 
  CheckCircle2, 
  Mail, 
  Send, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  KeyRound, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  Loader2,
  Star,
  BookOpen,
  AlertCircle,
  AlertTriangle,
  Terminal,
  HelpCircle,
  Globe,
  Monitor,
  Tag,
  Gift,
  Plus,
  Eye
} from 'lucide-react';

interface CheckoutModalProps {
  product: StoreProduct | null;
  onClose: () => void;
  onOrderCompleted?: (order: StoreOrder) => void;
}

export default function CheckoutModal({ product, onClose, onOrderCompleted }: CheckoutModalProps) {
  const { language, direction } = useBilingual();
  const { currency, format: formatMoney } = useCurrency();
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<StoreOrder | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAllCodes, setCopiedAllCodes] = useState(false);
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);
  const [copiedCrossSellCode, setCopiedCrossSellCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  // Gift Sending State
  const [isGift, setIsGift] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  // Cross-Sell State
  const [crossSellCandidate, setCrossSellCandidate] = useState<StoreProduct | null>(null);
  const [crossSellAdded, setCrossSellAdded] = useState(false);

  // Promo Code states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Review states
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Autofill email from LocalStorage and fetch complementary product for Cross-Sell
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('shakhsi_customer_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
      const savedTelegram = localStorage.getItem('shakhsi_customer_telegram');
      if (savedTelegram) {
        setTelegram(savedTelegram);
      }
    } catch (e) {
      // ignore
    }

    // Fetch cross-sell candidate
    if (product) {
      fetch('/api/products')
        .then((r) => r.json())
        .then((data: StoreProduct[]) => {
          if (Array.isArray(data)) {
            // Find a product that is different from current, in stock
            const candidate = data.find(
              (p) => p.id !== product.id && (p.stockCount === undefined || p.stockCount > 0)
            );
            if (candidate) {
              setCrossSellCandidate(candidate);
            }
          }
        })
        .catch(() => {});
    }
  }, [product?.id]);

  if (!product) return null;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedOrder) return;

    try {
      setIsSubmittingReview(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: completedOrder.id,
          product_id: product.id,
          product_name: language === 'ar' && product.name_ar ? product.name_ar : product.name,
          customer_email: completedOrder.customer_email,
          customer_name: reviewAuthor.trim() || (language === 'ar' ? 'عميل موثق' : 'Verified Buyer'),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      if (res.ok) {
        setReviewSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    setIsValidatingPromo(true);
    setPromoError('');

    try {
      const res = await fetch('/api/store/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          originalPrice: product.price,
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedPromo({
          code: data.code,
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice,
          message: data.message,
        });
      } else {
        setPromoError(data.error || (language === 'ar' ? 'كود الخصم غير صالح' : 'Invalid promo code'));
      }
    } catch (err) {
      setPromoError(language === 'ar' ? 'تعذر التحقق من كود الخصم' : 'Failed to validate promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !product.id) return;
    if (!agreeTerms) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى الموافقة على شروط الخدمة وتوافق المنطقة لمتابعة الدفع.'
          : 'Please accept the terms and region compatibility to proceed.'
      );
      return;
    }

    if (isGift && !recipientEmail.trim()) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني للمستلم لإرسال الهدية إليه.'
          : 'Please enter the recipient email address for the gift.'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Save to LocalStorage for customer convenience
    try {
      localStorage.setItem('shakhsi_customer_email', email.trim());
      if (telegram.trim()) {
        localStorage.setItem('shakhsi_customer_telegram', telegram.trim());
      }
    } catch (e) {
      // ignore
    }

    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          email: email.trim(),
          telegram: telegram.trim() || undefined,
          promoCode: appliedPromo?.code || undefined,
          quantity: quantity,
          currency: currency,
          is_gift: isGift,
          recipient_email: isGift ? recipientEmail.trim() : undefined,
          gift_message: isGift ? giftMessage.trim() : undefined,
          cross_sell_product_id: crossSellAdded && crossSellCandidate ? crossSellCandidate.id : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // If workspace is in production mode, redirect to real payment gateway
        if (data.production_mode && data.redirect_url) {
          window.location.href = data.redirect_url;
          return;
        }

        if (data.order) {
          setCompletedOrder(data.order);
          if (onOrderCompleted) {
            onOrderCompleted(data.order);
          }
        }
      } else {
        setErrorMessage(data.error || 'Failed to process checkout transaction.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyLicenseCode = () => {
    if (!completedOrder?.license_code) return;
    navigator.clipboard.writeText(completedOrder.license_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleCopyAllCodes = () => {
    if (!completedOrder) return;
    const codes = completedOrder.license_codes && completedOrder.license_codes.length > 0 
      ? completedOrder.license_codes 
      : [completedOrder.license_code];
    navigator.clipboard.writeText(codes.join('\n'));
    setCopiedAllCodes(true);
    setTimeout(() => setCopiedAllCodes(false), 3000);
  };

  const handleCopySingleCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedKeyIndex(index);
    setTimeout(() => setCopiedKeyIndex(null), 3000);
  };

  const handleCopyCrossSellCode = () => {
    if (!completedOrder?.cross_sell_license_code) return;
    navigator.clipboard.writeText(completedOrder.cross_sell_license_code);
    setCopiedCrossSellCode(true);
    setTimeout(() => setCopiedCrossSellCode(false), 3000);
  };

  const productName = language === 'ar' && product.name_ar ? product.name_ar : product.name;
  const productCategory = language === 'ar' && product.category_ar ? product.category_ar : product.category;
  const productRegion = language === 'ar' && product.region_ar ? product.region_ar : product.region;
  const productPlatform = language === 'ar' && product.platform_ar ? product.platform_ar : product.platform;
  const isBurnerError = errorMessage.toLowerCase().includes('burner') || 
                        errorMessage.toLowerCase().includes('disposable') || 
                        errorMessage.toLowerCase().includes('temporary');

  // Dynamic Bulk & Volume Pricing
  const unitPrice = product.price || 0;
  const subtotal = unitPrice * quantity;
  const volumeDiscountPercent = quantity >= 5 ? 10 : quantity >= 3 ? 5 : 0;
  const volumeDiscountAmount = Math.round((subtotal * volumeDiscountPercent) / 100);
  const promoDiscountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  
  // Cross sell discount: 15% off complementary product
  const crossSellOriginalPrice = crossSellCandidate?.price || 0;
  const crossSellDiscountedPrice = Math.round(crossSellOriginalPrice * 0.85);
  const crossSellPayable = crossSellAdded ? crossSellDiscountedPrice : 0;

  const finalPayableAmount = Math.max(0, subtotal - volumeDiscountAmount - promoDiscountAmount) + crossSellPayable;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      id="checkout-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="checkout-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150 max-h-[94vh] overflow-y-auto"
      >
        {/* Header Strip */}
        <div className="bg-slate-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {completedOrder 
                  ? (language === 'en' ? 'Order Confirmed & License Issued' : 'تم تأكيد الطلب وإصدار الترخيص')
                  : (language === 'en' ? 'Instant Digital Checkout' : 'إتمام الشراء الرقمي الفوري')}
              </h3>
              <span className="text-[11px] text-slate-400 block font-mono">
                {language === 'en' ? 'Instant Delivery Guarantee' : 'تسليم فوري ومباشر 100%'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CurrencySwitcher compact />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!completedOrder ? (
          /* Checkout Formulation Screen */
          <form onSubmit={handleProcessPayment} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Product Summary Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                    {productCategory}
                  </span>
                  {productRegion && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Globe className="w-3 h-3 text-emerald-600" />
                      <span>{productRegion}</span>
                    </span>
                  )}
                  {productPlatform && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      <Monitor className="w-3 h-3 text-blue-600" />
                      <span>{productPlatform}</span>
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {productName}
                </h4>
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{language === 'en' ? 'Instant delivery via Email/Telegram' : 'تسليم فوري ومباشر للكود'}</span>
                  </span>
                </div>
              </div>

              <div className="text-right rtl:text-left shrink-0">
                <div className="flex flex-col items-end rtl:items-start">
                  {(volumeDiscountAmount > 0 || appliedPromo) && (
                    <span className="text-xs text-slate-400 line-through font-mono">
                      {formatMoney(subtotal, language === 'ar' ? 'ar' : 'en')}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                      {formatMoney(finalPayableAmount, language === 'ar' ? 'ar' : 'en')}
                    </span>
                  </div>
                  {quantity > 1 && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      ({formatMoney(unitPrice, language === 'ar' ? 'ar' : 'en')} {language === 'en' ? '/key' : 'للكود'})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Checkout Cross-Sell: Frequently bought together (غالباً يُشترى معاً) */}
            {crossSellCandidate && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{language === 'en' ? 'Frequently Bought Together' : 'غالباً يُشترى معاً'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    {language === 'en' ? '15% Off Addon' : 'خصم 15% حصري'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-200/90 shadow-2xs">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {language === 'ar' && crossSellCandidate.name_ar ? crossSellCandidate.name_ar : crossSellCandidate.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-emerald-600 font-mono">
                        {formatMoney(crossSellDiscountedPrice, language === 'ar' ? 'ar' : 'en')}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through font-mono">
                        {formatMoney(crossSellOriginalPrice, language === 'ar' ? 'ar' : 'en')}
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold">
                        (-15%)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCrossSellAdded(!crossSellAdded)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      crossSellAdded
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 shadow-2xs'
                    }`}
                  >
                    {crossSellAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Added ✓' : 'تمت الإضافة ✓'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Add at 15% off' : 'إضافة للطلب بخصم 15%'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Bulk Order Quantity Selector with Tiered Discounts */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {language === 'en' ? 'Order Quantity' : 'تحديد كمية التراخيص'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {language === 'en' ? 'Get tiered volume discounts automatically' : 'وفّر أكثر مع خصم الجملة التلقائي'}
                  </span>
                </div>

                {/* Touch-friendly Stepper Buttons */}
                <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 transition cursor-pointer text-base"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono font-black text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stockCount || 10, quantity + 1))}
                    disabled={quantity >= (product.stockCount || 10)}
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 transition cursor-pointer text-base"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tier Discount Badges */}
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className={`p-2 rounded-xl text-[11px] font-semibold flex items-center justify-between border transition ${
                    quantity >= 3 && quantity < 5
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400/50'
                      : quantity >= 5
                      ? 'bg-slate-100/60 border-slate-200 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <span>{language === 'en' ? '3+ keys' : '٣ أكواد فأكثر'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    quantity >= 3 && quantity < 5 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    -5%
                  </span>
                </div>

                <div 
                  className={`p-2 rounded-xl text-[11px] font-semibold flex items-center justify-between border transition ${
                    quantity >= 5
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400/50'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <span>{language === 'en' ? '5+ keys' : '٥ أكواد فأكثر'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    quantity >= 5 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    -10%
                  </span>
                </div>
              </div>

              {volumeDiscountAmount > 0 && (
                <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 animate-in fade-in">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {language === 'en' 
                      ? `Tiered discount active: You saved ${volumeDiscountAmount} SAR on this bulk order!` 
                      : `خصم الكمية مفعل: وفرت ${volumeDiscountAmount} ر.س على هذا الطلب!`}
                  </span>
                </div>
              )}
            </div>

            {/* Region & Account Compatibility Pre-Payment Warning */}
            {productRegion && (
              <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-3.5 flex items-start gap-3 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-amber-900">
                  <span className="font-bold block">
                    {language === 'en' ? 'Region & Platform Compatibility Notice' : 'تنبيه توافق المنطقة الجغرافية والمنصة'}
                  </span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {language === 'en'
                      ? `This digital code is designated for ${productRegion} on ${productPlatform || 'supported devices'}. Please make sure your store account settings match this region prior to checkout.`
                      : `هذا المفتاح الرقمي مخصص لمنطقة (${productRegion}) على منصة (${productPlatform || 'الأجهزة المتوافقة'}). يرجى التأكد من تطابق دولة متجر حسابك قبل الشراء لتجنب أي تعارض في التفعيل.`}
                  </p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Email Address (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 flex items-center justify-between">
                  <span>{language === 'en' ? 'Your Email (For Instant Delivery)' : 'البريد الإلكتروني (لاستلام الكود آلياً) *'}</span>
                  <span className="text-[10px] text-emerald-600 font-bold lowercase font-mono">
                    {localStorage.getItem('shakhsi_customer_email') ? (language === 'en' ? 'saved locally' : 'محفوظ محلياً') : ''}
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 rtl:right-3.5 rtl:left-auto" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    dir="ltr"
                    className="w-full text-xs font-sans pl-10 pr-3.5 py-3 rtl:pr-10 rtl:pl-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 transition font-medium"
                  />
                </div>
                <span className="block text-[11px] text-slate-400 mt-1">
                  {language === 'en' 
                    ? 'Your license key and digital credentials will be dispatched here immediately.'
                    : 'سيتم إرسال مفتاح التفعيل وكود الترخيص إلى هذا البريد آلياً فور السداد مع إمكانية استرجاعه دائماً.'}
                </span>
              </div>

              {/* Telegram Username (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 flex items-center justify-between">
                  <span>{language === 'en' ? 'Telegram Handle (Optional)' : 'معرف تيليجرام (اختياري للإشعار السريع)'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {language === 'en' ? 'Optional' : 'اختياري'}
                  </span>
                </label>
                <div className="relative">
                  <Send className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 rtl:right-3.5 rtl:left-auto" />
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                    dir="ltr"
                    className="w-full text-xs font-mono pl-10 pr-3.5 py-3 rtl:pr-10 rtl:pl-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 transition"
                  />
                </div>
              </div>

              {/* Promo Code Input (Optional) */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'en' ? 'Promo Code / Voucher' : 'كود الخصم / القسيمة'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {language === 'en' ? 'Optional' : 'اختياري'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    placeholder={language === 'en' ? 'e.g. SHAKHSI10 or VIP20' : 'مثال: SHAKHSI10 أو VIP20'}
                    dir="ltr"
                    className="flex-1 text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromoCode}
                    disabled={isValidatingPromo || !promoCodeInput.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    {isValidatingPromo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{language === 'en' ? 'Apply' : 'تطبيق'}</span>
                    )}
                  </button>
                </div>

                {/* Promo Code Success Feedback */}
                {appliedPromo && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between animate-fade-in">
                    <span className="font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{appliedPromo.message}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCodeInput('');
                      }}
                      className="text-[10px] text-emerald-700 hover:underline cursor-pointer font-bold shrink-0 ml-2 rtl:mr-2"
                    >
                      {language === 'en' ? 'Remove' : 'إلغاء'}
                    </button>
                  </div>
                )}

                {/* Promo Code Error Feedback */}
                {promoError && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-medium animate-fade-in">
                    {promoError}
                  </div>
                )}
              </div>

              {/* Gift Option: Send as a Gift (إرسال كهدية 🎁) */}
              <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-transparent border border-pink-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Gift className="w-4 h-4 text-pink-500 shrink-0" />
                    <span>{language === 'en' ? 'Send as a Gift 🎁' : 'إرسال هذا الطلب كهدية لمستلم آخر 🎁'}</span>
                  </div>
                </label>

                {isGift && (
                  <div className="space-y-3 pt-2.5 border-t border-pink-200/80 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'en' ? "Recipient's Email Address *" : 'البريد الإلكتروني للمستلم (المُهدى له) *'}
                      </label>
                      <input
                        type="email"
                        required={isGift}
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        dir="ltr"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Personalized Gift Message (Optional)' : 'رسالة إهداء شخصية لطيفة (اختياري)'}
                      </label>
                      <textarea
                        rows={2}
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder={language === 'en' ? 'Happy Birthday! Hope you enjoy this gift...' : 'هدية بسيطة من القلب، أتمنى تعجبك وتستمتع فيها!'}
                        className="w-full text-xs px-3.5 py-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Terms & Instant Delivery Agreement Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 leading-relaxed select-none">
                  {language === 'en'
                    ? 'I accept the terms of service, understand instant digital delivery is final, and verified my account matches the specified region.'
                    : 'أوافق على شروط الخدمة وسياسة تسليم الأكواد الرقمية الفورية، وأؤكد أن حسابي متطابق مع المنطقة المحددة.'}
                </span>
              </label>
            </div>

            {/* Error banner / Disposable Burner Email Feedback */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {isBurnerError 
                      ? (language === 'en' ? 'Temporary Email Not Allowed' : 'لا يُقبل البريد الإلكتروني المؤقت')
                      : (language === 'en' ? 'Checkout Notice' : 'تنبيه في عملية السداد')}
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  {isBurnerError 
                    ? (language === 'en'
                        ? 'Disposable/burner emails (e.g. 10minutemail, tempmail) are blocked to protect your digital license from loss. Please provide your legitimate personal email.'
                        : 'عذراً، استخدام الإيميل المؤقت (10MinuteMail، GuerillaMail...) محظور لضمان عدم ضياع كود الترخيص الخاص بك وإمكانية استرجاعه في أي وقت.')
                    : errorMessage}
                </p>
              </div>
            )}

            {/* Simulated Payment Notice */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-700 shrink-0" />
              <div className="text-[11px] text-emerald-950 leading-snug">
                <span className="font-bold block">
                  {language === 'en' ? 'Instant Automated Gateway (Sandbox)' : 'بوابة دفع مؤتمتة وسريعة (Sandbox)'}
                </span>
                <span>
                  {language === 'en' 
                    ? 'Simulates immediate payment verification and generates your digital license code in real time.' 
                    : 'الضغط على الزر أدناه يحاكي سداداً فورياً ناجحاً ويولد كود التفعيل الرقمي فورياً.'}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isProcessing || !email.trim() || !agreeTerms}
                className="w-full min-h-[48px] py-3.5 sm:py-3 px-5 bg-slate-950 hover:bg-slate-900 active:scale-98 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition duration-150 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'en' ? 'Processing Instant Payment...' : 'جاري إتمام الدفع والتسليم...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      {language === 'en' 
                        ? `Pay & Receive ${quantity > 1 ? `${quantity} Keys` : 'License'} (${formatMoney(finalPayableAmount, 'en')})` 
                        : `سداد واستلام ${quantity > 1 ? `${quantity} مفاتيح` : 'الكود'} فوراً (${formatMoney(finalPayableAmount, 'ar')})`}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 py-1.5 transition text-center cursor-pointer"
              >
                {language === 'en' ? 'Cancel and return to store' : 'إلغاء والعودة للمتجر'}
              </button>
            </div>
          </form>
        ) : (
          /* Order Success / License Issued Screen */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                {language === 'en' ? 'Payment Verified Successfully!' : 'تم تأكيد الدفع واستلام الطلب بنجاح!'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {language === 'en' 
                  ? `Your digital activation license has been generated and dispatched to ${completedOrder.customer_email}.`
                  : `تم توليد كود التفعيل الرقمي وإرساله فورياً إلى بريدك: ${completedOrder.customer_email}.`}
              </p>
            </div>

            {/* License Box - Supports Multiple Keys if Bulk Order */}
            <div className="bg-slate-950 text-slate-100 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-mono">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-slate-200">
                    {completedOrder.license_codes && completedOrder.license_codes.length > 1
                      ? (language === 'en' ? `Digital Keys (${completedOrder.license_codes.length} Licenses)` : `مفاتيح التفعيل الرقمية (${completedOrder.license_codes.length} تراخيص)`)
                      : (language === 'en' ? 'Digital Activation Key' : 'كود التفعيل الرقمي (كامل بدون إخفاء)')}
                  </span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  {language === 'en' ? 'ACTIVE & READY' : 'جاهز وفعّال'}
                </span>
              </div>

              {/* Multi-code bulk listing */}
              {completedOrder.license_codes && completedOrder.license_codes.length > 1 ? (
                <div className="space-y-2">
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {completedOrder.license_codes.map((code, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800"
                      >
                        <div className="flex items-center gap-2 overflow-x-auto">
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <code className="font-mono text-xs sm:text-sm font-bold text-emerald-300 tracking-wide select-all whitespace-nowrap">
                            {code}
                          </code>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopySingleCode(code, idx)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
                        >
                          {copiedKeyIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">{language === 'en' ? 'Copied' : 'تم'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>{language === 'en' ? 'Copy' : 'نسخ'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Copy All Keys Master Button */}
                  <button
                    type="button"
                    onClick={handleCopyAllCodes}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    {copiedAllCodes ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{language === 'en' ? 'All Keys Copied to Clipboard!' : 'تم نسخ جميع المفاتيح بنجاح!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{language === 'en' ? 'Copy All Keys At Once' : 'نسخ جميع المفاتيح دفعة واحدة'}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Single Code View */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <div className="overflow-x-auto py-1">
                    <code className="font-mono text-sm sm:text-base font-extrabold text-emerald-300 tracking-wider select-all block whitespace-nowrap">
                      {completedOrder.license_code}
                    </code>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLicenseCode}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Copied!' : 'تم النسخ!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Copy Code' : 'نسخ الكود'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Green Toast Notification when copied */}
              {copiedCode && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {language === 'en' ? 'License code copied successfully!' : 'تم نسخ الكود بنجاح!'}
                  </span>
                </div>
              )}

              {/* Troubleshoot Ticket Button */}
              <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowTroubleshoot(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer py-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Problem with activation?' : 'أواجه مشكلة في التفعيل؟'}</span>
                </button>

                <span className="text-[10px] text-slate-500">
                  {language === 'en' ? 'Instant support available' : 'دعم فني فوري'}
                </span>
              </div>
            </div>

              {/* Gift Delivery Notice if this order was a gift */}
              {completedOrder.is_gift && (
                <div className="p-3.5 bg-gradient-to-r from-pink-500/15 to-purple-500/15 border border-pink-300 rounded-xl space-y-1.5 text-xs text-pink-950">
                  <div className="flex items-center gap-2 font-bold text-pink-900">
                    <Gift className="w-4 h-4 text-pink-600 shrink-0" />
                    <span>
                      {language === 'en' ? 'Gift Dispatched to Recipient!' : 'تم إرسال الهدية وكود التفعيل إلى المستلم!'}
                    </span>
                  </div>
                  <p className="text-[11px] text-pink-900/90 leading-relaxed">
                    {language === 'en'
                      ? `The digital license and your personalized message have been dispatched to ${completedOrder.recipient_email}.`
                      : `تم إرسال كود التفعيل الرقمي مع رسالة الإهداء إلى البريد الإلكتروني: ${completedOrder.recipient_email}.`}
                  </p>
                </div>
              )}

              {/* Cross-Sell Complementary Product License Key (if purchased together) */}
              {completedOrder.cross_sell_license_code && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-400/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-950">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>
                        {language === 'en'
                          ? `Addon Key: ${completedOrder.cross_sell_product_name || 'Complementary Product'}`
                          : `مفتاح المنتج الإضافي: ${completedOrder.cross_sell_product_name || 'العرض المكمل'}`}
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                      {language === 'en' ? 'Discounted Addon' : 'خصم 15%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-lg">
                    <code className="font-mono text-xs sm:text-sm font-extrabold text-amber-300 tracking-wider select-all truncate">
                      {completedOrder.cross_sell_license_code}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyCrossSellCode}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedCrossSellCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Copied' : 'تم'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Copy Key' : 'نسخ المفتاح'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Email Backup Dispatched Notification Notice */}
              <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-[11px] sm:text-xs">
                    {language === 'en'
                      ? `Backup receipt sent to ${completedOrder.customer_email}`
                      : `تم إرسال نسخة احتياطية فورية إلى: ${completedOrder.customer_email}`}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-mono shrink-0">
                  {language === 'en' ? 'Delivered' : 'تم الإرسال'}
                </span>
              </div>

              {/* Dark Email Preview Link */}
              <div className="flex justify-center">
                <a
                  href={`/api/store/orders/${completedOrder.id}/email-preview`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-semibold transition"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-700" />
                  <span>
                    {language === 'en'
                      ? 'Preview Buyer Confirmation Email (Dark Luxury Template)'
                      : 'معاينة نسخة الإيميل للمشتري (القالب الفاخر Dark Theme)'}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              {/* Order Details Mini Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    {language === 'en' ? 'Order Reference' : 'رقم الطلب'}
                  </span>
                  <span className="font-mono font-bold text-slate-800">{completedOrder.id}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    {language === 'en' ? 'Total Amount' : 'المبلغ المدفوع'}
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatMoney(completedOrder.amount, language === 'ar' ? 'ar' : 'en')}
                  </span>
                </div>
              </div>

            {/* Product Activation Guide */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'en' ? 'Activation Guide (How to use):' : 'دليل التفعيل والاستخدام السريع:'}</span>
                </div>
                {product.official_url && (
                  <a
                    href={product.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <span>{language === 'en' ? 'Official Link' : 'الرابط الرسمي'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  {product.activation_guide || product.activation_guide_ar ? (
                    language === 'ar' && product.activation_guide_ar 
                      ? product.activation_guide_ar 
                      : (product.activation_guide || product.activation_guide_ar)
                  ) : (
                    language === 'en'
                      ? 'Copy the activation key and keep it saved safely.'
                      : 'انسخ كود الترخيص أعلاه واحتفظ به في مكان آمن.'
                  )}
                </li>
                <li>
                  {language === 'en'
                    ? 'You can retrieve this code anytime from the Track page using your email.'
                    : 'يمكنك استرجاع الكود في أي وقت مستقبلاً عبر صفحة تتبع الطلبات بإدخال بريدك.'}
                </li>
              </ul>
            </div>

            {/* Post-Purchase Review & Rating Form */}
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{language === 'en' ? 'Rate Your Purchase Experience' : 'تقييم تجربة الشراء ورأيك'}</span>
                </div>
                <span className="text-[10px] text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded font-semibold">
                  {language === 'en' ? 'Verified Review' : 'تقييم موثق'}
                </span>
              </div>

              {reviewSubmitted ? (
                <div className="p-3 bg-emerald-100/80 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'en' ? 'Thank you! Your review has been published.' : 'شكراً جزيلاً! تم حفظ تقييمك ونشره بنجاح.'}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-2.5">
                  {/* Star Selector */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-slate-300 hover:text-amber-500 transition cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2 rtl:mr-2 rtl:ml-0">
                      {reviewRating} / 5
                    </span>
                  </div>

                  {/* Reviewer Name */}
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder={language === 'en' ? 'Your Name or Nickname (Optional)' : 'اسمك أو لقبك (اختياري)'}
                    className="w-full text-xs bg-white border border-indigo-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  {/* Comment */}
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={language === 'en' ? 'Share your feedback about the speed and quality...' : 'اكتب انطباعك عن سرعة التسليم وجودة المنتج...'}
                    className="w-full text-xs bg-white border border-indigo-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <span>{language === 'en' ? 'Submitting...' : 'جاري الحفظ...'}</span>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{language === 'en' ? 'Submit Review' : 'إرسال التقييم'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 active:scale-98 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {language === 'en' ? 'Done & Return to Storefront' : 'تم، العودة إلى المتجر'}
              </button>
            </div>
          </div>
        )}

        {/* Troubleshooting Ticket Modal */}
        {showTroubleshoot && completedOrder && (
          <TroubleshootTicketModal
            orderId={completedOrder.id}
            productName={productName}
            customerEmail={completedOrder.customer_email}
            onClose={() => setShowTroubleshoot(false)}
          />
        )}
      </div>
    </div>
  );
}
