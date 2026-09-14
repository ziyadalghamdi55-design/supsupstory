/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { Code, Copy, Check, Terminal, ExternalLink, Sparkles, BookOpen } from 'lucide-react';

export default function WidgetEmbedView() {
  const { language, dictionary } = useBilingual();
  const [workspaceId, setWorkspaceId] = useState('w_demo');
  const [iframeSnippet, setIframeSnippet] = useState('');
  const [copiedActive, setCopiedActive] = useState(false);

  useEffect(() => {
    // Load workspace ID
    fetch('/api/workspace')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data.workspace_id) {
          setWorkspaceId(data.workspace_id);
          assembleSnippet(data.workspace_id);
        }
      })
      .catch(() => {
        assembleSnippet('w_demo');
      });
  }, []);

  const assembleSnippet = (wsId: string) => {
    const origin = window.location.origin;
    const code = `<iframe
  src="${origin}/widget/${wsId}"
  style="position: fixed; bottom: 24px; right: 24px; width: 380px; height: 580px; border: none; z-index: 99999; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);"
  id="shakhsi-support-chat-widget">
</iframe>`;
    setIframeSnippet(code);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopiedActive(true);
    setTimeout(() => setCopiedActive(false), 2000);
  };

  return (
    <div className="flex-grow flex flex-col gap-6 select-none animate-fade-in text-slate-800">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{dictionary.embedTitle}</h1>
        <p className="text-xs text-slate-500">
          {language === 'en' 
            ? 'Add the embed iframe snippet to your digital store code base in seconds.' 
            : 'انسخ كود التضمين وضعه داخل الكود المصدري لمتجرك لتفعيل الدردشة التلقائية فوراً.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPILER PANEL (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
              <Code className="w-4.5 h-4.5 text-indigo-600" />
              {language === 'en' ? 'Iframe HTML Snippet' : 'كود التضمين البرمجي'}
            </h3>

            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-widest font-mono text-slate-500">
              {workspaceId}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{dictionary.embedDesc}</p>

          {/* Interactive display terminal with dedicated top bar */}
          <div className="rounded-xl overflow-hidden border border-slate-800 shadow-md">
            {/* Terminal Window Header Bar */}
            <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-medium ml-2 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>iframe-embed.html</span>
                </span>
              </div>

              {/* Dedicated Copy Button in Header */}
              <button
                type="button"
                onClick={handleCopyCode}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {copiedActive ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-emerald-200">{language === 'en' ? 'Copied!' : 'تم النسخ!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{dictionary.copyIframeCode}</span>
                  </>
                )}
              </button>
            </div>

            {/* Code container without any overlapping elements */}
            <pre className="bg-slate-950 text-slate-100 p-4 text-xs font-mono overflow-auto max-h-[300px] select-all leading-relaxed m-0">
              {iframeSnippet}
            </pre>
          </div>

          {copiedActive && (
            <span className="block text-[11px] font-bold text-emerald-600 text-right animate-pulse">
              {language === 'en' 
                ? '✓ Successfully copied iframe embedding snippets into clipboard!' 
                : '✓ تم نسخ كود التضمين إلى الحافظة بنجاح!'}
            </span>
          )}
        </div>

        {/* RIGHT PLATFORMS GUIDELINE PANELS (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
            <BookOpen className="w-4.5 h-4.5 text-indigo-500" />
            {language === 'en' ? 'SaaS Platforms Guidelines' : 'دليل دعم وتثبيت المنصات'}
          </h3>

          <div className="space-y-4 text-xs font-medium">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Custom Website HTML:</span>
              <p className="text-slate-500 font-normal leading-normal text-[11px]">
                Paste the snippet right before the closing <code className="bg-slate-100 font-bold px-1.5 py-0.2 rounded">&lt;/body&gt;</code> element of your store layout.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Salla Store (سلة):</span>
              <p className="text-slate-500 font-normal leading-normal text-[11px]">
                Go to Salla Store dashboard, select Custom JS Code block (أقسام وتخصيص المظهر) and inject this script directly to load automatically.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Shopify Channels:</span>
              <p className="text-slate-500 font-normal leading-normal text-[11px]">
                Open Theme Customizer, select Edit Code under <code className="bg-slate-100 font-bold px-1.5 py-0.2 rounded">theme.liquid</code>, and insert this block before body termination tags.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
