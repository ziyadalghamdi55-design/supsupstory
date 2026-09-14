/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBilingual } from '../BilingualContext';
import { 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  Lock, 
  CreditCard, 
  Mail, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function StorefrontFooter() {
  const { language } = useBilingual();
  const [activePolicy, setActivePolicy] = useState<'terms' | 'refund' | 'privacy' | null>(null);

  const policies = {
    terms: {
      title_ar: 'شروط الاستخدام والخدمة',
      title_en: 'Terms of Service',
      content_ar: `1. طبيعة المنتجات: جميع المواد المعروضة في منصة شخصي هي منتجات وخدمات وتراخيص رقمية غير ملموسة.
2. التسليم الآلي: يتم إصدار كود التفعيل والترخيص آلياً وفورياً بعد تأكيد الدفع الإلكتروني بنجاح، ويتحمل العميل مسؤولية التأكد من صحة البريد الإلكتروني المدخل.
3. التوافق والمنطقة: يجب على العميل قراءة بيانات التوافق الجغرافي والمنصة بدقة قبل إتمام الدفع.
4. حقوق الملكية: كافة العلامات التجارية وأسماء المنتجات هي ملك لأصحابها الشرعيين وتستخدم المنصة للأغراض التعريفية والتوزيع الرقمي المشروع.`,
      content_en: `1. Nature of Goods: All items offered on Shakhsi Platform are intangible digital keys, licenses, and services.
2. Automated Delivery: Codes are minted and dispatched instantly upon confirmed digital payment. The buyer is responsible for providing a valid email.
3. Regional Compatibility: Buyers must confirm account region and platform specifications before purchase.
4. Intellectual Property: Brand trademarks belong to their respective copyright holders.`
    },
    refund: {
      title_ar: 'سياسة الضمان والاسترجاع الرقمي',
      title_en: 'Refund & Warranty Policy',
      content_ar: `1. ضمان الفعالية 100%: نضمن أن جميع الأكواد الرقمية جديدة، أصلية، وصالحة للتفعيل فور الاستلام.
2. الكود المعطل أو غير الصالح: إذا واجهتك أي مشكلة أثناء التفعيل، يمكنك النقر على زر "أواجه مشكلة في التفعيل؟" في صفحة الطلب لفتح تذكرة فورية، وسيتم فحص الكود آلياً أو عبر فريق الدعم واستبداله فوراً بكود بديل أو إعادة المبلغ.
3. الأكواد المستلمة والمفعلة: وفقاً للأنظمة التجارية للمنتجات الرقمية، لا يمكن استرجاع أو إلغاء كود رقمي تم استلامه وتفعيله بنجاح بسبب طبيعة المنتج الاستهلاكية الفورية.
4. خطأ اختيار المنطقة: في حال شراء كود لمنطقة غير مطابقة لحسابك ولم يتم تفعيله أو كشفه، يرجى التواصل فوراً مع الدعم للمساعدة.`,
      content_en: `1. 100% Activation Guarantee: Every digital license is guaranteed genuine, untampered, and redeemable upon delivery.
2. Defective Codes: In the rare case of an activation error, click "Troubleshoot Issue" on your order page to submit a ticket. We will promptly inspect and issue an immediate replacement or refund.
3. Redeemed Keys: Due to the irreversible nature of digital consumable licenses, successfully delivered and redeemed keys are non-refundable.
4. Mismatched Region: Contact customer support immediately if an unredeemed key was purchased for an incompatible account.`
    },
    privacy: {
      title_ar: 'سياسة الخصوصية وحماية البيانات',
      title_en: 'Privacy Policy & Data Security',
      content_ar: `1. جمع البيانات: نجمع فقط البيانات الضرورية لإتمام عملية البيع وإرسال التراخيص (عنوان البريد الإلكتروني، ومعرف تيليجرام الاختياري).
2. سرية المعلومات: لا نقوم بمشاركة أو بيع أو تأجير بيانات عملائنا لأي طرف ثالث نهائياً.
3. المدفوعات الآمنة: تتم كافة العمليات المالية عبر بوابات دفع بنكية معتمدة ومشفرة بتشفير 256-bit SSL، ولا تقوم المنصة بتخزين أرقام بطاقاتك الائتمانية إطلاقاً.
4. استرجاع التراخيص: يتم ربط مشترياتك ببريدك الإلكتروني لتمكينك دائماً من استرجاع أي كود اشتريته في أي وقت.`,
      content_en: `1. Data Collection: We only collect necessary delivery details (your email address and optional Telegram handle).
2. Confidentiality: We strictly never share, rent, or sell customer personal data to third parties.
3. Secure Transactions: All payments are processed through PCI-DSS compliant payment gateways with 256-bit SSL encryption. We never store credit card numbers.
4. License Vault: Your purchases remain tied to your email for easy retrieval at any time.`
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      {/* Policy Modal Drawer if active */}
      {activePolicy && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setActivePolicy(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {language === 'ar' ? policies[activePolicy].title_ar : policies[activePolicy].title_en}
              </h3>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2.5 max-h-[60vh] overflow-y-auto leading-relaxed whitespace-pre-line pr-2">
              {language === 'ar' ? policies[activePolicy].content_ar : policies[activePolicy].content_en}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center font-black text-sm">
                ش
              </div>
              <span className="font-black text-white text-base tracking-tight">منصة شخصي</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {language === 'ar'
                ? 'المنصة الرقمية المتخصصة في التجارة والتسليم الآلي الفوري للتراخيص، الاشتراكات، ومفاتيح الألعاب والبرمجيات في ثوانٍ معدودة.'
                : 'Automated digital storefront delivering software licenses, subscriptions, and gaming keys instantly within seconds.'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'ar' ? 'موثق ومعتمد للعمل الحر والتجارة' : 'Certified Freelance & Digital Commerce'}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/track" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>{language === 'ar' ? 'تتبع الطلبات وخزنة الأكواد' : 'Track Order & Vault'}</span>
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>{language === 'ar' ? 'مشترياتي الرقمية' : 'My Purchases'}</span>
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition">
                  {language === 'ar' ? 'الأسئلة الشائعة والضمان' : 'FAQ & Warranties'}
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition">
                  {language === 'ar' ? 'بوابة إدارة المنصة' : 'Admin Portal'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'ar' ? 'السياسات والضمان' : 'Policies & Guarantees'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('terms')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left rtl:text-right"
                >
                  {language === 'ar' ? 'شروط الخدمة والتسليم' : 'Terms of Service'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('refund')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left rtl:text-right"
                >
                  {language === 'ar' ? 'سياسة الضمان والاسترجاع' : 'Refund & Warranty Policy'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('privacy')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left rtl:text-right"
                >
                  {language === 'ar' ? 'سياسة الخصوصية والأمان' : 'Privacy Policy'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Badges & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'ar' ? 'وسائل الدفع الآمنة' : 'Accepted Payments'}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ar' 
                ? 'مدفوعات فورية ومشفرة عبر بوابات الدفع البنكية المعتمدة.' 
                : 'Instant 256-bit encrypted checkout via certified payment gateways.'}
            </p>

            {/* Payment Icons Pill Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-200">
                مدى Mada
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-200">
                Apple Pay
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-200">
                Visa
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-200">
                Mastercard
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {language === 'ar' ? 'منصة شخصي (Shakhsi Platform) - جميع الحقوق محفوظة.' : 'Shakhsi Platform. All rights reserved.'}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600">v2.4 Production Ready</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-500 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {language === 'ar' ? 'الأنظمة متصلة وتعمل بكفاءة' : 'Systems Operational'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
