'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Bookmark, MapPin, Share2, Compass } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Image from 'next/image';

interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_cafe: boolean;
}

interface SceneWithMovie {
  id: string;
  image_url: string;
  description: string;
  movies: {
    id: string;
    title: string;
  };
}

export default function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [spot, setSpot] = useState<Spot | null>(null);
  const [scenes, setScenes] = useState<SceneWithMovie[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchSpotData() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentUser = null;
        if (session) {
          setUser(session.user);
          currentUser = session.user;
        }

        // Fetch spot info
        const { data: spotData, error: spotError } = await supabase
          .from('spots')
          .select('*')
          .eq('id', id)
          .single();
        
        if (spotError) {
          console.error('Error fetching spot:', spotError);
        } else if (spotData) {
          setSpot(spotData as Spot);
        }

        // Fetch scenes related to this spot
        const { data: scenesData, error: scenesError } = await supabase
          .from('scenes')
          .select(`
            id,
            image_url,
            description,
            movies (
              id,
              title
            )
          `)
          .eq('spot_id', id);
        
        if (scenesError) {
          console.error('Error fetching scenes:', scenesError);
        } else if (scenesData) {
          setScenes(scenesData as unknown as SceneWithMovie[]);
        }

        // Check if bookmarked (personal to user)
        if (currentUser) {
          const { data: bookmarkData } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('spot_id', id)
            .eq('user_id', currentUser.id)
            .maybeSingle();
          
          setIsBookmarked(!!bookmarkData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSpotData();
  }, [id]);

  const toggleBookmark = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요한 기능입니다. 로그인 페이지로 이동합니다.');
      router.push('/login');
      return;
    }

    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('spot_id', id)
        .eq('user_id', session.user.id);
      setIsBookmarked(false);
    } else {
      await supabase
        .from('bookmarks')
        .insert({ 
          spot_id: id,
          user_id: session.user.id
        });
      setIsBookmarked(true);
    }
  };

  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-antique-ivory/50">장소 정보 불러오는 중...</div>
    </div>
  );

  if (!spot) return <div className="min-h-screen bg-background text-antique-ivory p-20 text-center">장소를 찾을 수 없습니다.</div>;

  return (
    <main className="min-h-screen bg-background text-antique-ivory relative">
      {/* Toast popup */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-5 py-3.5 bg-zinc-900 border border-white/10 text-antique-ivory text-xs font-semibold rounded-full shadow-2xl transition-all duration-300">
          🔗 링크가 클립보드에 복사되었습니다!
        </div>
      )}

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-background to-transparent">
        <button onClick={() => window.history.back()} className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3">
          <button 
            onClick={copyToClipboard}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-all"
          >
            <Share2 size={24} />
          </button>
          <button 
            onClick={toggleBookmark}
            className={`p-2 backdrop-blur-md rounded-full border border-white/10 transition-all ${isBookmarked ? 'bg-antique-ivory text-black' : 'bg-black/40 text-antique-ivory hover:bg-black/60'}`}
          >
            <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto pt-24 px-6 pb-20 space-y-12">
        {/* Spot Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-antique-ivory/60">
            <MapPin size={18} />
            <span className="text-sm tracking-wide uppercase font-medium">{spot.is_cafe ? '감성 카페' : '영화 촬영지'}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {spot.name}
          </h1>
          <p className="text-lg md:text-xl text-antique-ivory/40">
            {spot.address}
          </p>
          
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/map?spot_id=${spot.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-antique-ivory text-black text-xs font-bold rounded-xl hover:bg-white transition-all shadow-md active:scale-95 duration-200"
            >
              <Compass size={14} />
              지도로 위치 보기
            </Link>
            
            <a
              href={`https://map.kakao.com/link/to/${encodeURIComponent(spot.name)},${spot.lat},${spot.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 text-antique-ivory/80 hover:bg-white/10 hover:border-white/20 text-xs font-semibold rounded-xl transition-all"
            >
              카카오 길찾기
            </a>
            
            <a
              href={`https://map.naver.com/v5/search/${encodeURIComponent(spot.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 text-antique-ivory/80 hover:bg-white/10 hover:border-white/20 text-xs font-semibold rounded-xl transition-all"
            >
              네이버 길찾기
            </a>
          </div>
        </div>

        {/* Cinematic Scenes */}
        <div className="space-y-8">
          <h2 className="text-2xl font-medium border-b border-white/10 pb-4">미디어 속 명장면</h2>
          <div className="grid gap-12">
            {scenes.map((scene) => (
              <div key={scene.id} className="space-y-6">
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-800">
                  {scene.image_url ? (
                    <Image 
                      src={scene.image_url} 
                      alt={scene.description || "Scene"} 
                      fill 
                      className="object-cover transition-opacity duration-300"
                      unoptimized
                      onLoadingComplete={(img) => img.classList.add('opacity-100')}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-antique-ivory/20 gap-2">
                      <Share2 size={40} className="opacity-20" />
                      <span className="text-sm italic">이미지가 등록되지 않았습니다</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <Link 
                    href={`/movie/${scene.movies.id}`}
                    className="inline-block px-3 py-1 bg-antique-ivory/10 text-antique-ivory text-sm rounded-full border border-antique-ivory/20 hover:bg-antique-ivory hover:text-black transition-all"
                  >
                    {scene.movies.title}
                  </Link>
                  <p className="text-2xl font-light leading-relaxed">
                    &ldquo;{scene.description}&rdquo;
                  </p>
                </div>
              </div>
            ))}
            {scenes.length === 0 && (
              <div className="text-center py-10 text-antique-ivory/30 italic">이 장소가 등장한 작품 정보가 등록되지 않았습니다.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
