/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { Send, ExternalLink } from 'lucide-react';

export default function TelegramFloatingButton() {
  const { language } = useBilingual();
  const [botUsername, setBotUsername] = useState('ShakhsiDemoBot');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    fetch('/api/workspace')
      .then((r) => r.json())
      .then((ws) => {
        if (ws?.telegram_bot_username) {
          setBotUsername(ws.telegram_bot_username.replace('@', ''));
        }
      })
      .catch(() => {});
  }, []);

  const telegramUrl = `https://t.me/${botUsername}`;

  return (
    <div 
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 group"
      id="shakhsi-telegram-floating-btn"
    >
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2.5 px-3.5 py-3 bg-[#229ED9] hover:bg-[#1e8cc0] active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-sky-400/40 cursor-pointer"
        aria-label={language === 'ar' ? 'تواصل عبر تيليجرام' : 'Chat on Telegram'}
      >
        <div className="relative flex items-center justify-center">
          {/* Telegram paper plane icon style */}
          <Send className="w-4 h-4 text-white -rotate-12 translate-x-px" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#229ED9]" />
        </div>
        
        <span className="text-xs font-semibold text-white hidden sm:inline whitespace-nowrap">
          {language === 'ar' ? 'دعم تيليجرام الفوري' : 'Telegram Support'}
        </span>
        <ExternalLink className="w-3 h-3 text-sky-100 opacity-80 hidden sm:inline" />
      </a>

      {/* Floating hover badge on mobile or hover */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl border border-slate-700 whitespace-nowrap animate-in fade-in">
          {language === 'ar' ? `فتح محادثة البوت @${botUsername}` : `Open @${botUsername}`}
        </div>
      )}
    </div>
  );
}
