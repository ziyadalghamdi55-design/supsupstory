/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { StoreProduct } from '../types';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Key, 
  Layers, 
  DollarSign, 
  Search, 
  Check, 
  Trash2, 
  RefreshCw, 
  X,
  AlertCircle
} from 'lucide-react';

export default function ProductsManagementView() {
  const { language, direction } = useBilingual();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for new product
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState<number>(49);
  const [formCategory, setFormCategory] = useState('Templates');
  const [formCategoryAr, setFormCategoryAr] = useState('قوالب برمجية');
  const [formDescAr, setFormDescAr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCodesBank, setFormCodesBank] = useState(''); // 1 key per line

  // Restock modal state
  const [restockProduct, setRestockProduct] = useState<StoreProduct | null>(null);
  const [restockCodesInput, setRestockCodesInput] = useState('');
  const [isRestocking, setIsRestocking] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim() && !formNameEn.trim()) return;

    try {
      setIsSubmitting(true);
      const lines = formCodesBank
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        sku: formSku.trim() || formCode.trim() || undefined,
        name: formNameEn.trim() || formNameAr.trim(),
        name_ar: formNameAr.trim() || formNameEn.trim(),
        price: Number(formPrice),
        category: formCategory,
        category_ar: formCategoryAr,
        description: formDescEn.trim(),
        description_ar: formDescAr.trim(),
        code: formCode.trim() || ('DIGI-' + Math.random().toString(36).substr(2, 4).toUpperCase()),
        inventoryCodes: lines,
        stockCount: lines.length,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormNameAr('');
        setFormNameEn('');
        setFormSku('');
        setFormPrice(49);
        setFormDescAr('');
        setFormDescEn('');
        setFormCode('');
        setFormCodesBank('');
        showToast(language === 'ar' ? 'تمت إضافة المنتج ورصيده بنجاح!' : 'Product added successfully with inventory!');
        loadProducts();
      }
    } catch (err) {
      console.error('Failed to add product', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestockProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;

    const lines = restockCodesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      showToast(language === 'ar' ? 'يرجى إدخال كود ترخيص واحد على الأقل' : 'Please provide at least 1 valid license code');
      return;
    }

    try {
      setIsRestocking(true);
      const res = await fetch(`/api/products/${restockProduct.id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: lines }),
      });

      if (res.ok) {
        const data = await res.json();
        setRestockProduct(null);
        setRestockCodesInput('');
        showToast(
          language === 'ar' 
            ? `تم شحن ${lines.length} مفتاح ترخيص بنجاح! تم إشعار ${data.notifiedSubscribersCount || 0} عملاء مهتمين.` 
            : `Restocked ${lines.length} license keys! Notified ${data.notifiedSubscribersCount || 0} waiting customers.`
        );
        loadProducts();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to restock');
      }
    } catch (err) {
      console.error('Failed to restock product', err);
      showToast('Network error while restocking');
    } finally {
      setIsRestocking(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const confirmMsg = language === 'ar'
      ? `هل أنت متأكد من حذف المنتج: "${name}"؟`
      : `Are you sure you want to delete "${name}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(language === 'ar' ? 'تم حذف المنتج' : 'Product removed');
        loadProducts();
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(query) || p.name_ar?.toLowerCase().includes(query);
    const catMatch = p.category?.toLowerCase().includes(query) || p.category_ar?.toLowerCase().includes(query);
    return nameMatch || catMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Package className="w-7 h-7 text-indigo-600" />
            <span>{language === 'ar' ? 'إدارة المنتجات الرقمية والمخزون' : 'Digital Products & Inventory'}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'ar' 
              ? 'إدارة المنتجات، متابعة بنك التراخيص والأكواد والتنبيه التلقائي للمخزون المنخفض'
              : 'Manage digital assets, license key inventory bank and automatic low-stock alerts'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer shadow-xs"
            title={language === 'ar' ? 'تحديث البيانات' : 'Refresh list'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}</span>
          </button>
        </div>
      </div>

      {/* Stats and filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase block tracking-wider">
              {language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{products.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase block tracking-wider">
              {language === 'ar' ? 'المخزون المنخفض (أقل من 3)' : 'Low Stock (< 3 items)'}
            </span>
            <span className="text-2xl font-black text-rose-600 mt-0.5 block">
              {products.filter((p) => (p.stockCount !== undefined ? p.stockCount : 10) < 3).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase block tracking-wider">
              {language === 'ar' ? 'إجمالي المبيعات المنفذة' : 'Total Units Sold'}
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-0.5 block">
              {products.reduce((acc, p) => acc + (p.purchasesCount || 0), 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
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
          placeholder={language === 'ar' ? 'البحث عن منتج بالاسم أو الفئة...' : 'Search products by name or category...'}
          className={`w-full bg-white border border-slate-200 rounded-xl py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
            direction === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className={`px-5 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'المنتج الرقمي' : 'Product'}
                </th>
                <th className={`px-4 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </th>
                <th className={`px-4 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'السعر' : 'Price'}
                </th>
                <th className={`px-4 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'المخزون المتوفر' : 'Stock Status'}
                </th>
                <th className={`px-4 py-3.5 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'المبيعات' : 'Sales'}
                </th>
                <th className="px-4 py-3.5 text-center">
                  {language === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    <span>{language === 'ar' ? 'جاري تحميل قائمة المنتجات...' : 'Loading products...'}</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>{language === 'ar' ? 'لم يتم العثور على أي منتجات مطابقة' : 'No products found matching query'}</span>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = p.stockCount !== undefined ? p.stockCount : 10;
                  const isLowStock = stock < 3;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name & Code */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {language === 'ar' ? (p.name_ar || p.name) : p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="text-slate-400 font-sans text-[9px] uppercase">SKU:</span>
                            <span>{p.sku || p.code}</span>
                          </span>
                          {p.code && p.code !== p.sku && (
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                              <Key className="w-3 h-3 text-slate-400" />
                              <span>{p.code}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {language === 'ar' ? (p.category_ar || p.category) : p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 font-extrabold text-slate-900">
                        {p.price} <span className="text-xs font-normal text-slate-500">{language === 'ar' ? 'ر.س' : 'SAR'}</span>
                      </td>

                      {/* Stock Count with Low Stock Warning & Restock Button */}
                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-extrabold text-base ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                              {stock}
                            </span>
                            <span className="text-xs text-slate-400">{language === 'ar' ? 'كود' : 'keys'}</span>

                            {/* Low Stock Badge */}
                            {isLowStock && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                                <AlertCircle className="w-3 h-3" />
                                <span>{language === 'ar' ? 'مخزون منخفض' : 'Low Stock'}</span>
                              </span>
                            )}
                          </div>

                          {/* Fast Restock Button */}
                          <button
                            onClick={() => {
                              setRestockProduct(p);
                              setRestockCodesInput('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-300/80 text-[11px] font-bold transition shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-emerald-600" />
                            <span>{language === 'ar' ? 'شحن المخزون +' : 'Restock +'}</span>
                          </button>
                        </div>
                      </td>

                      {/* Purchases */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-700">{p.purchasesCount || 0}</span>
                        <span className="text-xs text-slate-400 ml-1 mr-1">{language === 'ar' ? 'عملية' : 'orders'}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setRestockProduct(p);
                              setRestockCodesInput('');
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title={language === 'ar' ? 'شحن مخزون التراخيص' : 'Restock license keys'}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, language === 'ar' ? (p.name_ar || p.name) : p.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title={language === 'ar' ? 'حذف المنتج' : 'Delete product'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal with Key Bank textarea */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span>{language === 'ar' ? 'إضافة منتج رقمي جديد' : 'Add New Digital Product'}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 mt-4">
              {/* Product Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'اسم المنتج (بالعربية)*' : 'Name (Arabic)*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: ترخيص دورة الذكاء الاصطناعي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'اسم المنتج (بالإنجليزية)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="AI Course License Pro"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'السعر (ر.س)*' : 'Price (SAR)*'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'الفئة والتصنيف' : 'Category'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value);
                      const arMap: Record<string, string> = {
                        'Templates': 'قوالب برمجية',
                        'UI Kits': 'حزم التصميم والواجهات',
                        'Education': 'دورات وتعليم',
                        'Scripts': 'سكربتات وأدوات',
                        'DevOps': 'بنية تحتية وسيرفرات',
                        'AI & Bots': 'ذكاء اصطناعي وبوتات',
                      };
                      setFormCategoryAr(arMap[e.target.value] || e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Templates">Templates / قوالب برمجية</option>
                    <option value="UI Kits">UI Kits / حزم التصميم</option>
                    <option value="Education">Education / دورات وتعليم</option>
                    <option value="Scripts">Scripts / سكربتات وأدوات</option>
                    <option value="DevOps">DevOps / بنية تحتية</option>
                    <option value="AI & Bots">AI & Bots / ذكاء اصطناعي</option>
                  </select>
                </div>
              </div>

              {/* Product Code Identifier & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'رمز التخزين التعريفي (SKU)' : 'Product SKU'}
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="NITRO-1M-GLOBAL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'كود التسليم الافتراضي (Code)' : 'Default License Code'}
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="DIGI-XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Key Bank Textarea */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    <span>{language === 'ar' ? 'بنك الأكواد والتراخيص (مفتاح في كل سطر)' : 'License Codes Bank (1 key per line)'}</span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                    {formCodesBank.split('\n').filter((s) => s.trim()).length} {language === 'ar' ? 'مفتاح متوفر' : 'keys'}
                  </span>
                </label>
                <p className="text-xs text-amber-700 mb-2">
                  {language === 'ar'
                    ? 'الصق الأكواد الجاهزة هنا. عند كل عملية شراء يتم سحب كود وتسليمه للعميل آلياً حتى نفاد الكمية.'
                    : 'Paste stock codes here. Each completed order automatically consumes one key from this bank.'}
                </p>
                <textarea
                  rows={4}
                  value={formCodesBank}
                  onChange={(e) => setFormCodesBank(e.target.value)}
                  placeholder={"KEY-AAAA-1111-XXXX\nKEY-BBBB-2222-YYYY\nKEY-CCCC-3333-ZZZZ"}
                  className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === 'ar' ? 'وصف المنتج' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={formDescAr}
                  onChange={(e) => setFormDescAr(e.target.value)}
                  placeholder={language === 'ar' ? 'وصف تفصيلي للمنتج الرقمي وما يتضمنه من ملفات...' : 'Detailed description of the digital product...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting 
                    ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                    : (language === 'ar' ? 'حفظ وإضافة للمخزون' : 'Save & Stock')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'ar' ? 'شحن مخزون التراخيص والأكواد' : 'Restock License Inventory'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    SKU: {restockProduct.sku || restockProduct.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestockProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockProduct} className="space-y-4 mt-4">
              {/* Product Info Banner */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {language === 'ar' ? (restockProduct.name_ar || restockProduct.name) : restockProduct.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'المخزون الحالي:' : 'Current Stock:'}{' '}
                    <strong className="text-slate-800 font-mono">{restockProduct.stockCount ?? 0} مفاتيح</strong>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {language === 'ar' ? 'تسليم فوري' : 'Instant Dispatch'}
                </span>
              </div>

              {/* Codes Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>{language === 'ar' ? 'مفاتيح التراخيص الجديدة (مفتاح في كل سطر)' : 'New License Keys (1 per line)'}</span>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {restockCodesInput.split('\n').filter((s) => s.trim()).length} {language === 'ar' ? 'مفتاح للإضافة' : 'keys to add'}
                  </span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={restockCodesInput}
                  onChange={(e) => setRestockCodesInput(e.target.value)}
                  placeholder={"LICENSE-PRO-2026-AAA1\nLICENSE-PRO-2026-BBB2\nLICENSE-PRO-2026-CCC3"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {language === 'ar'
                    ? '💡 سيتم إضافة هذه الأكواد تلقائياً إلى بنك التراخيص، وإشعار كافة العملاء المسجلين في تنبيهات توفر المنتج فوراً.'
                    : '💡 Keys will be added to the inventory bank. Waiting customers who requested back-in-stock alerts will be notified.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isRestocking}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isRestocking
                      ? (language === 'ar' ? 'جاري الشحن...' : 'Restocking...')
                      : (language === 'ar' ? 'تأكيد شحن المخزون فوراً' : 'Confirm Restock')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
