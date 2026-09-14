/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBilingual } from '../BilingualContext';
import { 
  ChevronDown, 
  HelpCircle, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Globe, 
  Clock, 
  KeyRound 
} from 'lucide-react';

interface FAQItem {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  icon: any;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'speed',
    icon: Zap,
    question_ar: 'متى وكيف أستلم كود التفعيل الرقمي بعد الدفع؟',
    question_en: 'When and how do I receive my digital activation code after payment?',
    answer_ar: 'يتم إصدار وتسليم الكود فورياً وتلقائياً بنسبة 100% خلال 3 إلى 5 ثوانٍ من نجاح الدفع. يظهر الكود مباشرة أمامك على الشاشة في نافذة الطلب، كما يُرسل بنسخة إلكترونية إلى بريدك الإلكتروني ومعرف تيليجرام (إذا تم إدخاله).',
    answer_en: 'Your code is minted and dispatched 100% automatically within 3 to 5 seconds of payment confirmation. It appears immediately on your screen, and an electronic backup copy is dispatched to your email and Telegram handle.'
  },
  {
    id: 'warranty',
    icon: ShieldCheck,
    question_ar: 'ما هي سياسة الضمان والاسترجاع للأكواد الرقمية؟',
    question_en: 'What is the warranty and refund policy for digital codes?',
    answer_ar: 'نضمن صحة وصلاحية كافة الأكواد والتراخيص الرقمية بنسبة 100% عند التفعيل. في حال وجود أي مشكلة تقنية أو كود غير صالح، نوفر زراً مباشراً "أواجه مشكلة في التفعيل؟" لفتح تذكرة دعم فورية والتحقق من النظام واستبدال الكود أو استرجاع المبلغ بكل شفافية.',
    answer_en: 'All digital keys and licenses are 100% guaranteed genuine and functional at activation. In the rare event of a technical issue, our instant "Troubleshoot Issue" tool allows immediate ticket creation, automated system verification, and rapid replacement or refund.'
  },
  {
    id: 'compatibility',
    icon: Globe,
    question_ar: 'كيف أضمن توافق الكود مع حسابي ودولتي (المنطقة الجغرافية)؟',
    question_en: 'How do I ensure the code matches my account and geographical region?',
    answer_ar: 'كل منتج في المتجر موضح عليه بوضوح علم ودولة الحساب المتوافق معه (مثل: عالمي Global، السعودية KSA، تركيا TR، أمريكا US) واسم المنصة (PC / Steam / PlayStation / Xbox). يرجى التأكد من تطابق دولة متجرك مع المكتوب في بطاقة المنتج قبل السداد.',
    answer_en: 'Each product clearly designates its compatibility region (e.g. Global, KSA, Turkey, US) and platform (PC, Steam, PlayStation, Xbox). Please ensure your account store country matches the product designation prior to checkout.'
  },
  {
    id: 'lost_code',
    icon: KeyRound,
    question_ar: 'هل يمكنني استرجاع الأكواد التي اشتريتها سابقاً إذا ضاعت؟',
    question_en: 'Can I retrieve my previously purchased codes if I lose them?',
    answer_ar: 'نعم بكل سهولة! يمكنك الضغط على "مشترياتي والأكواد" في أعلى الصفحة أو الدخول إلى صفحة تتبع الطلبات (/track أو /my-orders) وإدخال بريدك الإلكتروني لعرض خزنة كافة طلباتك ومفاتيحك الرقمية في أي وقت وبأمان تام.',
    answer_en: 'Yes, absolutely! Simply click "My Purchases" in the top navigation or visit /track or /my-orders, enter your email address, and instantly view your secure digital vault with all past orders and active license keys.'
  },
  {
    id: 'payment_methods',
    icon: RefreshCw,
    question_ar: 'ما هي طرق الدفع المدعومة لإتمام الطلب؟',
    question_en: 'Which payment methods are accepted at checkout?',
    answer_ar: 'ندعم كافة وسائل الدفع الإلكتروني الحديثة والمعتمدة محلياً ودولياً، بما في ذلك بطاقات مدى (Mada)، أبل باي (Apple Pay)، فيزا (Visa)، وماستركارد (Mastercard) بأعلى معايير الأمان والتشفير البنكي.',
    answer_en: 'We accept all major secure electronic payment methods, including Mada cards, Apple Pay, Visa, and Mastercard, with bank-grade 256-bit encryption.'
  }
];

export default function FAQAccordion() {
  const { language } = useBilingual();
  const [openId, setOpenId] = useState<string | null>('speed');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الأسئلة الشائعة والمساعدة' : 'Frequently Asked Questions'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'كل ما تحتاج معرفته عن الشراء والتسليم' : 'Everything You Need to Know'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            {language === 'ar'
              ? 'إجابات سريعة وواضحة عن سرعة التسليم الآلي، شروط الضمان، توافق الحسابات، واسترجاع التراخيص.'
              : 'Clear, direct answers regarding automated delivery speed, warranties, regional compatibility, and license recovery.'}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            const Icon = item.icon;

            return (
              <div 
                key={item.id}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? 'bg-white border-slate-300 shadow-sm' 
                    : 'bg-white/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left rtl:text-right gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    <span className="font-bold text-sm text-slate-900">
                      {language === 'ar' ? item.question_ar : item.question_en}
                    </span>
                  </div>

                  <div className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : 'text-slate-400'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 sm:text-slate-600 leading-relaxed border-t border-slate-100 animate-fadeIn">
                    <p className="pr-12 rtl:pr-0 rtl:pl-12">
                      {language === 'ar' ? item.answer_ar : item.answer_en}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
