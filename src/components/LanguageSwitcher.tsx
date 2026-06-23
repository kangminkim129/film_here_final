'use client';

import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { LANGS } from '@/lib/i18n/dictionary';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="언어 선택"
        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-antique-ivory/20 bg-black/35 backdrop-blur-md text-antique-ivory text-xs font-semibold hover:bg-antique-ivory/10 transition-all"
      >
        <Globe size={16} />
        <span>{current.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-36 py-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-antique-ivory hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>{l.flag}</span>
                  {l.label}
                </span>
                {l.code === lang && <Check size={14} className="text-amber-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
