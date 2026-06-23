'use client';

import Link from "next/link";
import { Search, Map as MapIcon, Film, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  const hoverEffect = {
    scale: 1.03,
    y: -5,
    boxShadow: "0px 12px 30px rgba(253, 251, 247, 0.1)",
    borderColor: "rgba(253, 251, 247, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-background overflow-hidden">
      {/* Cinematic Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft light leak glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-antique-ivory/5 blur-[120px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-antique-ivory/3 blur-[100px]" />
        
        {/* Subtle grid lines for design depth */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Header / My Bookmarks Link */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-8 right-8 z-10"
      >
        <Link 
          href="/bookmarks" 
          className="flex items-center gap-2 px-5 py-2.5 border border-antique-ivory/20 rounded-full hover:bg-antique-ivory/10 transition-all hover:scale-105 active:scale-95 shadow-xl bg-black/35 backdrop-blur-md"
        >
          <Bookmark size={18} className="text-antique-ivory" fill="currentColor" fillOpacity={0.2} />
          <span className="text-antique-ivory text-xs font-semibold tracking-wide">내 찜 목록</span>
        </Link>
      </motion.div>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full space-y-16 text-center z-10">
        <header className="space-y-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-block"
          >
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-antique-ivory select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              FilmHere
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-base md:text-lg text-antique-ivory/60 font-light tracking-widest max-w-md mx-auto"
          >
            미디어 속 그 장소, 당신만의 명장면이 되는 곳
          </motion.p>
        </header>

        {/* Menu Navigation Grid */}
        <motion.nav 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6"
        >
          {/* Menu 1: Search by Location */}
          <motion.div variants={itemVariants}>
            <Link
              href="/search/location"
              className="block"
            >
              <motion.div
                whileHover={hoverEffect}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-10 h-64 space-y-5 border border-antique-ivory/15 rounded-3xl bg-zinc-950/20 backdrop-blur-sm transition-all duration-300 shadow-xl"
              >
                <div className="p-4 bg-antique-ivory/5 rounded-2xl border border-white/5">
                  <Search size={28} className="text-antique-ivory" />
                </div>
                <div className="space-y-1">
                  <span className="text-lg font-bold text-antique-ivory block">장소로 검색</span>
                  <span className="text-xs text-antique-ivory/40 font-light">동네, 명칭으로 장소 찾기</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Menu 2: Find on Map */}
          <motion.div variants={itemVariants}>
            <Link
              href="/map"
              className="block"
            >
              <motion.div
                whileHover={hoverEffect}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-10 h-64 space-y-5 border border-antique-ivory/15 rounded-3xl bg-zinc-950/20 backdrop-blur-sm transition-all duration-300 shadow-xl"
              >
                <div className="p-4 bg-antique-ivory/5 rounded-2xl border border-white/5">
                  <MapIcon size={28} className="text-antique-ivory" />
                </div>
                <div className="space-y-1">
                  <span className="text-lg font-bold text-antique-ivory block">지도에서 찾기</span>
                  <span className="text-xs text-antique-ivory/40 font-light">서울 전역 촬영지 탐색</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Menu 3: Search by Movie */}
          <motion.div variants={itemVariants}>
            <Link
              href="/search/movie"
              className="block"
            >
              <motion.div
                whileHover={hoverEffect}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-10 h-64 space-y-5 border border-antique-ivory/15 rounded-3xl bg-zinc-950/20 backdrop-blur-sm transition-all duration-300 shadow-xl"
              >
                <div className="p-4 bg-antique-ivory/5 rounded-2xl border border-white/5">
                  <Film size={28} className="text-antique-ivory" />
                </div>
                <div className="space-y-1">
                  <span className="text-lg font-bold text-antique-ivory block">작품으로 검색</span>
                  <span className="text-xs text-antique-ivory/40 font-light">영화, 드라마별 촬영지 탐색</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </motion.nav>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-8 text-antique-ivory/30 text-xs font-light select-none tracking-widest"
      >
        &copy; 2026 FilmHere. All cinematic spots mapped.
      </motion.footer>
    </main>
  );
}
