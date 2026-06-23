'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { getMovieById, getScenesByMovie } from '@/lib/data';
import { encodeCourse } from '@/lib/courses';
import { ChevronLeft, MapPin, Compass, Route, PlayCircle, Clapperboard, Users, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Movie } from '@/lib/types';

interface Scene {
  id: string;
  image_url: string | null;
  description: string | null;
  spots: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null;
}

const OTT_LABEL: Record<string, string> = {
  netflix: '넷플릭스',
  tving: 'TVING',
  wavve: '웨이브',
  disney: '디즈니+',
  coupang: '쿠팡플레이',
  watcha: '왓챠',
};

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovieData() {
      setLoading(true);
      
      const [movieData, scenesData] = await Promise.all([getMovieById(id), getScenesByMovie(id)]);
      if (movieData) setMovie(movieData);
      setScenes(scenesData as Scene[]);
      setLoading(false);
    }
    fetchMovieData();
  }, [id]);

  // 작품 따라 걷기: 이 작품의 촬영지로 코스 토큰 생성
  const courseToken = useMemo(() => {
    const spotIds = Array.from(new Set(scenes.map((s) => s.spots?.id).filter(Boolean))) as string[];
    if (spotIds.length === 0) return null;
    return encodeCourse({ name: `${movie?.title ?? '작품'} 투어`, spotIds });
  }, [scenes, movie]);

  const cast = useMemo(
    () => (movie?.cast ? Array.from(new Set(movie.cast.split(',').map((c) => c.trim()).filter(Boolean))) : []),
    [movie]
  );

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-antique-ivory/50">🎥 필름 로딩 중...</div>
    </div>
  );

  if (!movie) return <div className="min-h-screen bg-background text-antique-ivory p-20 text-center">작품을 찾을 수 없습니다.</div>;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative h-[45vh] md:h-[55vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        {movie.poster_url && (
          <Image 
            src={movie.poster_url} 
            className="object-cover blur-sm opacity-20 scale-105" 
            alt="" 
            fill 
            unoptimized 
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-20 space-y-4 max-w-4xl mx-auto">
          <Link href="/search/movie" className="w-fit flex items-center gap-1 text-antique-ivory/60 hover:text-antique-ivory transition-colors mb-2 text-sm font-medium">
            <ChevronLeft size={16} />
            <span>작품 목록으로</span>
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-antique-ivory tracking-tighter">
            {movie.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap text-sm md:text-base text-antique-ivory/40">
            {movie.release_year && <span>{movie.release_year}년</span>}
            {movie.genre && <span className="flex items-center gap-1"><Tag size={13} /> {movie.genre}</span>}
            {movie.director && <span className="flex items-center gap-1"><Clapperboard size={13} /> {movie.director}</span>}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href={`/map?movie_id=${movie.id}`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-antique-ivory text-black text-xs md:text-sm font-bold rounded-xl hover:bg-white transition-all shadow-2xl hover:scale-[1.02] active:scale-95 duration-200"
            >
              <Compass size={16} />
              촬영지 전체 지도
            </Link>
            {courseToken && (
              <Link
                href={`/map?course=${courseToken}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 text-black text-xs md:text-sm font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-2xl active:scale-95 duration-200"
              >
                <Route size={16} />
                이 작품 따라 걷기
              </Link>
            )}
            {(movie.ott_url || movie.platform) && (
              <a
                href={movie.ott_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/15 text-antique-ivory text-xs md:text-sm font-bold rounded-xl hover:bg-white/10 transition-all active:scale-95"
              >
                <PlayCircle size={16} />
                {movie.platform ? `${OTT_LABEL[movie.platform] ?? movie.platform}에서 보기` : '바로 보기'}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 작품 정보 (데이터 있을 때) */}
      {(movie.synopsis || cast.length > 0) && (
        <section className="max-w-4xl mx-auto px-6 md:px-12 pt-8 space-y-6">
          {movie.synopsis && (
            <p className="text-base md:text-lg text-antique-ivory/70 leading-relaxed">{movie.synopsis}</p>
          )}
          {cast.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-antique-ivory/50 flex items-center gap-1.5 uppercase tracking-wider">
                <Users size={13} /> 출연
              </span>
              <div className="flex flex-wrap gap-2">
                {cast.map((c) => (
                  <span key={c} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-antique-ivory/80">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Scenes List */}
      <section className="max-w-4xl mx-auto p-6 md:p-12 space-y-16">
        <h2 className="text-2xl font-medium text-antique-ivory/80 border-b border-white/10 pb-4">
          촬영 장소 {scenes.length}곳
        </h2>

        {scenes.map((scene) => (
          <div key={scene.id} className="group grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-3 relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-white/5">
              {scene.image_url ? (
                <Image 
                  src={scene.image_url} 
                  alt="Scene" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-antique-ivory/20 italic">명장면 스틸컷 준비 중</div>
              )}
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <span className="inline-block px-2 py-1 bg-antique-ivory/10 text-antique-ivory/60 text-xs rounded uppercase tracking-wider font-bold">Scene info</span>
                <p className="text-xl text-antique-ivory leading-relaxed">
                  {scene.description}
                </p>
              </div>

              {scene.spots && (
                <Link
                  href={`/spot/${scene.spots.id}`}
                  className="flex flex-col p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-all group/spot"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-antique-ivory/40 group-hover/spot:text-antique-ivory transition-colors" />
                    <span className="font-medium text-antique-ivory">{scene.spots.name}</span>
                  </div>
                  <span className="text-sm text-antique-ivory/40">{scene.spots.address}</span>
                </Link>
              )}
            </div>
          </div>
        ))}

        {scenes.length === 0 && (
          <div className="text-center py-20 text-antique-ivory/30">
            등록된 촬영 장소가 아직 없습니다.
          </div>
        )}
      </section>
    </main>
  );
}
