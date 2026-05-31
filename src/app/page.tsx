import Link from "next/link";
import { Search, Map as MapIcon, Film, Bookmark } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      {/* Header / My Bookmarks Link */}
      <div className="absolute top-8 right-8">
        <Link 
          href="/bookmarks" 
          className="flex items-center gap-2 px-4 py-2 border border-antique-ivory/30 rounded-full hover:bg-antique-ivory/10 transition-colors"
        >
          <Bookmark size={20} className="text-antique-ivory" />
          <span className="text-antique-ivory font-medium">내 찜 목록</span>
        </Link>
      </div>

      <div className="max-w-4xl w-full space-y-12 text-center">
        <header className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-antique-ivory">
            FilmHere
          </h1>
          <p className="text-lg md:text-xl text-antique-ivory/60 font-light">
            미디어 속 그 장소, 당신만의 명장면이 되는 곳
          </p>
        </header>

        <nav className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <Link
            href="/search/location"
            className="group flex flex-col items-center justify-center p-10 space-y-4 border border-antique-ivory/20 rounded-2xl hover:border-antique-ivory/60 hover:bg-white/5 transition-all"
          >
            <div className="p-4 bg-antique-ivory/10 rounded-full group-hover:scale-110 transition-transform">
              <Search size={32} className="text-antique-ivory" />
            </div>
            <span className="text-xl font-medium text-antique-ivory">장소로 검색하기</span>
          </Link>

          <Link
            href="/map"
            className="group flex flex-col items-center justify-center p-10 space-y-4 border border-antique-ivory/20 rounded-2xl hover:border-antique-ivory/60 hover:bg-white/5 transition-all"
          >
            <div className="p-4 bg-antique-ivory/10 rounded-full group-hover:scale-110 transition-transform">
              <MapIcon size={32} className="text-antique-ivory" />
            </div>
            <span className="text-xl font-medium text-antique-ivory">지도에서 찾기</span>
          </Link>

          <Link
            href="/search/movie"
            className="group flex flex-col items-center justify-center p-10 space-y-4 border border-antique-ivory/20 rounded-2xl hover:border-antique-ivory/60 hover:bg-white/5 transition-all"
          >
            <div className="p-4 bg-antique-ivory/10 rounded-full group-hover:scale-110 transition-transform">
              <Film size={32} className="text-antique-ivory" />
            </div>
            <span className="text-xl font-medium text-antique-ivory">영화로 검색하기</span>
          </Link>
        </nav>
      </div>

      <footer className="absolute bottom-8 text-antique-ivory/30 text-sm">
        &copy; 2024 FilmHere. All cinematic spots mapped.
      </footer>
    </main>
  );
}
