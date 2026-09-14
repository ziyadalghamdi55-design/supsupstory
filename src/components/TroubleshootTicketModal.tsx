/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBilingual } from '../BilingualContext';
import { 
  X, 
  AlertTriangle, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  Image, 
  FileText, 
  Send, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

interface TroubleshootTicketModalProps {
  orderId: string;
  productName: string;
  customerEmail: string;
  onClose: () => void;
}

export default function TroubleshootTicketModal({
  orderId,
  productName,
  customerEmail,
  onClose,
}: TroubleshootTicketModalProps) {
  const { language, direction } = useBilingual();
  const [reason, setReason] = useState<string>('كود غير صالح / لا يعمل');
  const [email, setEmail] = useState(customerEmail || '');
  const [details, setDetails] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const reasonOptions = [
    {
      id: 'invalid_code',
      ar: 'كود غير صالح / لا يعمل في المنصة',
      en: 'Invalid key / code rejected by platform',
    },
    {
      id: 'region_mismatch',
      ar: 'مشكلة في المنطقة الجغرافية للحساب (Region Error)',
      en: 'Geographic region mismatch / error',
    },
    {
      id: 'activation_steps',
      ar: 'استفسار أو صعوبة في خطوات التثبيت',
      en: 'Assistance needed with installation steps',
    },
    {
      id: 'other',
      ar: 'مشكلة أخرى أو استفسار عام',
      en: 'Other technical inquiry',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(language === 'ar' ? 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.' : 'Screenshot must be under 5MB.');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          productName,
          email: email.trim(),
          reason,
          details: details.trim(),
          screenshot,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessTicketId(data.ticketId || `TCK-${Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        setErrorMsg(data.error || 'Failed to submit support ticket');
      }
    } catch (err: any) {
      setErrorMsg(language === 'ar' ? 'تعذر إرسال التذكرة. يرجى المحاولة لاحقاً.' : 'Network error submitting ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
        dir={direction}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {language === 'ar' ? 'نموذج الإبلاغ عن مشكلة في التفعيل' : 'License Activation Troubleshooting'}
              </h3>
              <span className="text-[11px] text-slate-400 block font-mono">
                {language === 'ar' ? `طلب رقم: ${orderId}` : `Order Ref: ${orderId}`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successTicketId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                {language === 'ar' ? 'تم فتح تذكرة الدعم الفني بنجاح!' : 'Support Ticket Created!'}
              </h4>
              <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
                {language === 'ar' ? `رقم التذكرة: #${successTicketId}` : `Ticket ID: #${successTicketId}`}
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {language === 'ar'
                  ? 'تم ربط التذكرة بطلبك وصندوق الوارد بالداشبورد مع لقطة الشاشة. سيقوم فريق الدعم الفني بمراجعتها وتقديم كود بديل أو المساعدة الفورية عبر بريدك الإلكتروني.'
                  : 'Your ticket has been sent to our dashboard inbox linked with your order details and screenshot. Our technical team is reviewing it and will respond promptly.'}
              </p>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق والعودة' : 'Close and Return'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Context Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {language === 'ar' ? 'المنتج الرقمي:' : 'Product:'}
                  </span>
                  <span className="font-bold text-slate-800">{productName}</span>
                </div>
                <span className="font-mono text-[11px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-700 font-semibold">
                  {orderId}
                </span>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {language === 'ar' ? 'ما هي المشكلة التي تواجهها؟ *' : 'What issue are you experiencing? *'}
                </label>
                <div className="space-y-1.5">
                  {reasonOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        reason === opt.ar || reason === opt.en
                          ? 'border-emerald-500 bg-emerald-50/60 font-semibold text-emerald-950'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="troubleshoot_reason"
                        value={language === 'ar' ? opt.ar : opt.en}
                        checked={reason === (language === 'ar' ? opt.ar : opt.en)}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{language === 'ar' ? opt.ar : opt.en}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {language === 'ar' ? 'البريد الإلكتروني للرد والمتابعة *' : 'Email address for response *'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              {/* Additional details */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {language === 'ar' ? 'تفاصيل إضافية أو رسالة الخطأ (اختياري)' : 'Additional details or error message (optional)'}
                </label>
                <textarea
                  rows={2}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: ظهرت رسالة أن الكود غير متطابق مع متجر الحساب...' : 'E.g. Error code displayed during activation...'}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>{language === 'ar' ? 'لقطة شاشة لرسالة الخطأ' : 'Error Screenshot'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {language === 'ar' ? 'يساعد على سرعة الحل' : 'Speeds up resolution'}
                  </span>
                </label>

                {screenshot ? (
                  <div className="relative border border-emerald-300 bg-emerald-50/50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={screenshot}
                        alt="Screenshot preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {screenshotName || 'screenshot.png'}
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          {language === 'ar' ? 'جاهزة للإرسال مع التذكرة' : 'Attached'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setScreenshot(null);
                        setScreenshotName('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded font-bold cursor-pointer"
                    >
                      {language === 'ar' ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/80 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition">
                    <UploadCloud className="w-5 h-5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700">
                      {language === 'ar' ? 'اضغط لرفع لقطة الشاشة أو اسحب الصورة هنا' : 'Click to upload screenshot or drag here'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 active:scale-98 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'ar' ? 'جاري إرسال التذكرة...' : 'Submitting Ticket...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'إرسال التذكرة لفريق الدعم الفني' : 'Submit Support Ticket'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 py-1 transition text-center cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
