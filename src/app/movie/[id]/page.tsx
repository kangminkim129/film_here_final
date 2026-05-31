'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

import Image from 'next/image';

interface Movie {
  id: string;
  title: string;
  poster_url: string;
  release_year: number;
}

interface Scene {
  id: string;
  image_url: string;
  description: string;
  spots: {
    id: string;
    name: string;
    address: string;
  };
}

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovieData() {
      setLoading(true);
      
      // Fetch movie info
      const { data: movieData } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (movieData) setMovie(movieData as Movie);

      // Fetch scenes with spot info
      const { data: scenesData } = await supabase
        .from('scenes')
        .select(`
          id,
          image_url,
          description,
          spots (
            id,
            name,
            address
          )
        `)
        .eq('movie_id', id);
      
      if (scenesData) setScenes(scenesData as unknown as Scene[]);
      
      setLoading(false);
    }
    fetchMovieData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-antique-ivory/50">🎥 필름 로딩 중...</div>
    </div>
  );

  if (!movie) return <div className="min-h-screen bg-background text-antique-ivory p-20 text-center">작품을 찾을 수 없습니다.</div>;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        {movie.poster_url && (
          <Image 
            src={movie.poster_url} 
            className="object-cover blur-sm opacity-30" 
            alt="" 
            fill 
            unoptimized 
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-20 space-y-4">
          <Link href="/search/movie" className="w-fit flex items-center gap-1 text-antique-ivory/60 hover:text-antique-ivory transition-colors mb-4">
            <ChevronLeft size={20} />
            <span>목록으로</span>
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-antique-ivory tracking-tighter">
            {movie.title}
          </h1>
          <p className="text-lg text-antique-ivory/40">{movie.release_year}년 개봉</p>
        </div>
      </div>

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
