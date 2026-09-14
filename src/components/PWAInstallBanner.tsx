/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { Download, X, Share2, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const { language } = useBilingual();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if dismissed before in session
    const isDismissed = sessionStorage.getItem('shakhsi_pwa_dismissed');
    if (isDismissed) return;

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

    if (isStandalone) {
      // Already running as installed PWA
      return;
    }

    if (isIOSDevice) {
      setIsIOS(true);
      // Show banner after brief delay on iOS mobile
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chromium beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    sessionStorage.setItem('shakhsi_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Gentle Floating Mobile Banner */}
      <div className="fixed bottom-3 inset-x-3 z-40 sm:hidden">
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-5 h-5 text-slate-950" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 truncate">
                {language === 'ar'
                  ? '📲 تثبيت تطبيق شخصي Platform'
                  : '📲 Install Shakhsi App'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {language === 'ar'
                  ? 'لسهولة الشراء واسترجاع البطاقات والتراخيص'
                  : 'Fast checkout & quick license key vault'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تثبيت' : 'Install'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Manual Install Instructions Drawer Modal */}
      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-in slide-in-from-bottom-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  {language === 'ar' ? 'تثبيت التطبيق على آيفون (iOS)' : 'Install on iPhone (iOS)'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside leading-relaxed">
              <li>
                {language === 'ar' 
                  ? 'اضغط على زر المشاركة (Share) أسفل متصفح Safari.' 
                  : 'Tap the Share button at the bottom of Safari.'}
              </li>
              <li>
                {language === 'ar' 
                  ? 'مرر للأسفل واختر "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).' 
                  : 'Scroll down and tap "Add to Home Screen".'}
              </li>
              <li>
                {language === 'ar' 
                  ? 'اضغط على "إضافة" (Add) أعلى اليمين للوصول للتطبيق كأيقونة فورية.' 
                  : 'Tap "Add" in the top corner to install the icon.'}
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              {language === 'ar' ? 'فهمت ذلك' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
