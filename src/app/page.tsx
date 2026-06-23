'use client';

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Map as MapIcon, Film, Bookmark, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const CURATION = ['로맨스', '서울', '감성 카페', '드라마', '바다', '레트로'];

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  const [q, setQ] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
  };
  const hoverEffect = {
    scale: 1.03,
    y: -5,
    boxShadow: "0px 12px 30px rgba(253, 251, 247, 0.1)",
    borderColor: "rgba(253, 251, 247, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  };

  const submitSearch = () => {
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  };

  const cards = [
    { href: '/search/location', icon: Search, title: t('nav.searchLocation'), sub: t('nav.searchLocation.sub') },
    { href: '/map', icon: MapIcon, title: t('nav.map'), sub: t('nav.map.sub') },
    { href: '/search/movie', icon: Film, title: t('nav.searchMovie'), sub: t('nav.searchMovie.sub') },
    { href: '/map?near=1', icon: Navigation, title: t('nav.nearby'), sub: t('nav.nearby.sub') },
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-background overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-antique-ivory/5 blur-[120px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-antique-ivory/3 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-8 right-8 z-10 flex items-center gap-2"
      >
        <LanguageSwitcher />
        <Link
          href="/bookmarks"
          className="flex items-center gap-2 px-5 py-2.5 border border-antique-ivory/20 rounded-full hover:bg-antique-ivory/10 transition-all hover:scale-105 active:scale-95 shadow-xl bg-black/35 backdrop-blur-md"
        >
          <Bookmark size={18} className="text-antique-ivory" fill="currentColor" fillOpacity={0.2} />
          <span className="text-antique-ivory text-xs font-semibold tracking-wide">{t('nav.bookmarks')}</span>
        </Link>
      </motion.div>

      <div className="max-w-4xl w-full space-y-10 text-center z-10">
        <header className="space-y-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: "easeOut" }} className="inline-block">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-antique-ivory select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              FilmHere
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }} className="text-base md:text-lg text-antique-ivory/60 font-light tracking-widest max-w-xl mx-auto">
            {t('app.tagline')}
          </motion.p>
        </header>

        {/* Unified search bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.8 }} className="max-w-xl mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-antique-ivory/40" size={22} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              placeholder={t('search.placeholder')}
              className="w-full bg-zinc-950/40 backdrop-blur-md border border-antique-ivory/20 rounded-full py-4 pl-14 pr-28 text-base text-antique-ivory focus:outline-none focus:border-antique-ivory/60 transition-all shadow-xl"
            />
            <button
              onClick={submitSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-antique-ivory text-black text-sm font-bold rounded-full hover:bg-white transition-all active:scale-95"
            >
              검색
            </button>
          </div>
          {/* Curation chips */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {CURATION.map((c) => (
              <Link
                key={c}
                href={`/search?q=${encodeURIComponent(c)}`}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-antique-ivory/60 hover:bg-antique-ivory hover:text-black transition-all"
              >
                #{c}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Menu grid */}
        <motion.nav variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {cards.map((card) => (
            <motion.div key={card.href} variants={itemVariants}>
              <Link href={card.href} className="block">
                <motion.div
                  whileHover={hoverEffect}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center p-8 h-52 space-y-4 border border-antique-ivory/15 rounded-3xl bg-zinc-950/20 backdrop-blur-sm transition-all duration-300 shadow-xl"
                >
                  <div className="p-4 bg-antique-ivory/5 rounded-2xl border border-white/5">
                    <card.icon size={26} className="text-antique-ivory" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-base font-bold text-antique-ivory block">{card.title}</span>
                    <span className="text-[11px] text-antique-ivory/40 font-light">{card.sub}</span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.nav>
      </div>

      <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="absolute bottom-8 text-antique-ivory/30 text-xs font-light select-none tracking-widest">
        {t('footer.rights')}
      </motion.footer>
    </main>
  );
}
