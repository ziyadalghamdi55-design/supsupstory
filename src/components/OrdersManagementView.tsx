/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { StoreOrder } from '../types';
import { 
  ShoppingCart, 
  Search, 
  Send, 
  Check, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Key, 
  DollarSign, 
  UserCheck, 
  Copy,
  ExternalLink,
  Download,
  FileSpreadsheet,
  Mail,
  Layers
} from 'lucide-react';

export default function OrdersManagementView() {
  const { language, direction } = useBilingual();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/store/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast(language === 'ar' ? 'لا توجد بيانات طلبات لتصديرها حالياً' : 'No order data to export');
      return;
    }

    const headers = [
      language === 'ar' ? 'رقم الطلب' : 'Order ID',
      language === 'ar' ? 'التاريخ والوقت' : 'Date & Time',
      language === 'ar' ? 'اسم المنتج' : 'Product Name',
      language === 'ar' ? 'الكمية' : 'Quantity',
      language === 'ar' ? 'المبلغ الإجمالي (ر.س)' : 'Total Amount (SAR)',
      language === 'ar' ? 'كوبون الخصم' : 'Promo Code',
      language === 'ar' ? 'قيمة الخصم (ر.س)' : 'Discount Amount (SAR)',
      language === 'ar' ? 'بريد العميل' : 'Customer Email',
      language === 'ar' ? 'حساب تيليجرام' : 'Telegram Handle',
      language === 'ar' ? 'حالة السداد' : 'Payment Status',
      language === 'ar' ? 'حالة التسليم الفوري' : 'Delivery Status',
      language === 'ar' ? 'نسخة البريد مرسلة' : 'Email Backup Sent',
      language === 'ar' ? 'مفاتيح التراخيص الصادرة' : 'Issued License Keys'
    ];

    const rows = orders.map((order) => {
      const keys = (order.license_codes && order.license_codes.length > 0)
        ? order.license_codes.join(' | ')
        : (order.license_code || '');
      
      const qty = order.quantity || (order.license_codes ? order.license_codes.length : 1);
      const formattedDate = new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');

      return [
        order.id,
        formattedDate,
        order.product_name,
        qty,
        order.amount,
        order.promo_code || '-',
        order.discount_applied ? `${order.discount_applied}` : '0',
        order.customer_email,
        order.customer_telegram ? `@${order.customer_telegram}` : '-',
        order.status === 'completed' ? (language === 'ar' ? 'ناجح ومدفوع' : 'Paid & Completed') : order.status,
        language === 'ar' ? 'تم التسليم فوراً' : 'Instant Delivered',
        order.email_dispatched ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No'),
        keys
      ];
    });

    const csvContent = '\uFEFF' + [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shakhsi-sales-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      language === 'ar' 
        ? `تم تصدير ملف إكسل (${orders.length} طلب) بنجاح!` 
        : `Exported ${orders.length} orders to CSV successfully!`
    );
  };

  const handleResendCode = async (order: StoreOrder) => {
    try {
      setResendingId(order.id);
      const res = await fetch(`/api/store/orders/${order.id}/resend`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        showToast(
          language === 'ar'
            ? `تم إرسال كود الترخيص مجدداً إلى ${order.customer_email}`
            : `License code resent to ${order.customer_email}`
        );
      }
    } catch (err) {
      console.error('Failed to resend code', err);
    } finally {
      setResendingId(null);
    }
  };

  const copyLicenseCode = (orderId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(orderId);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const codesString = (o.license_codes || []).join(' ').toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      o.product_name.toLowerCase().includes(q) ||
      (o.license_code && o.license_code.toLowerCase().includes(q)) ||
      codesString.includes(q)
    );
  });

  const totalRevenue = orders.reduce((acc, o) => acc + (o.amount || 0), 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
            <span>{language === 'ar' ? 'سجل المبيعات والطلبات' : 'Sales & Orders Registry'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'ar' 
              ? 'متابعة كافة عمليات الشراء الرقمية، التراخيص الصادرة وتصدير كشف المبيعات بنقرة واحدة'
              : 'Monitor digital purchases, generated license keys, and export sales reports with one click'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* CSV / Excel Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'ar' ? 'تصدير إكسل (CSV)' : 'Export CSV / Excel'}</span>
          </button>

          <button
            onClick={loadOrders}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-xs"
            title={language === 'ar' ? 'تحديث السجل' : 'Refresh orders'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase block tracking-wider">
              {language === 'ar' ? 'إجمالي المبيعات المنفذة' : 'Total Orders'}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{orders.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase block tracking-wider">
              {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {totalRevenue} <span className="text-xs font-normal text-slate-500">{language === 'ar' ? 'ر.س' : 'SAR'}</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase block tracking-wider">
              {language === 'ar' ? 'معدل التسليم الفوري' : 'Instant Delivery Rate'}
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-0.5 block">100%</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className={`w-4 h-4 text-slate-400 absolute top-3.5 ${direction === 'rtl' ? 'right-3.5' : 'left-3.5'}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'ar' ? 'البحث برقم الطلب، بريد العميل، اسم المنتج أو كود الترخيص...' : 'Search by order ID, customer email, product name or license key...'}
          className={`w-full bg-white border border-slate-200 rounded-xl py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
            direction === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className={`px-5 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'رقم الطلب' : 'Order ID'}
                </th>
                <th className={`px-4 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'بريد العميل' : 'Customer Email'}
                </th>
                <th className={`px-4 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'المنتج المشتراة' : 'Product'}
                </th>
                <th className={`px-4 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'كود الترخيص' : 'License Key'}
                </th>
                <th className={`px-4 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'تاريخ العملية' : 'Date'}
                </th>
                <th className={`px-4 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'حالة الدفع' : 'Payment Status'}
                </th>
                <th className="px-4 py-3.5 text-center">
                  {language === 'ar' ? 'إجراء سريع' : 'Quick Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    <span>{language === 'ar' ? 'جاري جلب سجل الطلبات...' : 'Loading orders...'}</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>{language === 'ar' ? 'لا توجد طلبات مسجلة حتى الآن' : 'No recorded orders found'}</span>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dateFormatted = new Date(order.created_at).toLocaleDateString(
                    language === 'ar' ? 'ar-SA' : 'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order ID */}
                      <td className="px-5 py-4 font-mono font-bold text-xs text-slate-900">
                        {order.id}
                      </td>

                      {/* Customer Email */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{order.customer_email}</div>
                        {order.customer_telegram && (
                          <div className="text-xs text-sky-600 font-mono">@{order.customer_telegram}</div>
                        )}
                      </td>

                      {/* Product Name & Amount & Quantity */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">{order.product_name}</span>
                          {(order.quantity && order.quantity > 1) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200">
                              ×{order.quantity}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold mt-0.5">
                          <span>{order.amount} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                          {order.promo_code && (
                            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 font-mono">
                              {order.promo_code} (-{order.discount_applied} {language === 'ar' ? 'ر.س' : 'SAR'})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* License Code(s) with Copy button */}
                      <td className="px-4 py-4">
                        {order.license_codes && order.license_codes.length > 1 ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold text-emerald-900">
                              <Layers className="w-3 h-3 text-emerald-600" />
                              <span>{order.license_codes.length} {language === 'ar' ? 'تراخيص رقمية' : 'Licenses'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => copyLicenseCode(order.id, order.license_codes!.join('\n'))}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition cursor-pointer"
                              >
                                {copiedCodeId === order.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700">{language === 'ar' ? 'تم نسخ الكل' : 'All Copied'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-500" />
                                    <span>{language === 'ar' ? 'نسخ كافة الأكواد' : 'Copy All Keys'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-slate-800">
                            <Key className="w-3.5 h-3.5 text-slate-400" />
                            <span>{order.license_code}</span>
                            <button
                              onClick={() => copyLicenseCode(order.id, order.license_code)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                              title={language === 'ar' ? 'نسخ الكود' : 'Copy code'}
                            >
                              {copiedCodeId === order.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{language === 'ar' ? 'مدفوع ومكتمل' : 'Paid & Delivered'}</span>
                        </span>
                      </td>

                      {/* Resend Action */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleResendCode(order)}
                          disabled={resendingId === order.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-900 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold transition shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          <Send className={`w-3.5 h-3.5 ${resendingId === order.id ? 'animate-spin text-emerald-600' : ''}`} />
                          <span>
                            {resendingId === order.id
                              ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                              : (language === 'ar' ? 'إعادة إرسال الكود للعميل' : 'Resend Code')}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
