'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { getSpotById, getScenesBySpot, getSpotsWithScenes } from '@/lib/data';
import { isBookmarked as readBookmark, toggleBookmark as toggleBookmarkLocal } from '@/lib/bookmarks';
import { isVisited as readVisited, toggleVisited as toggleVisitedLocal } from '@/lib/visited';
import { isLiked, toggleLike, getReviews, addReview, deleteReview, getRatingSummary, type Review } from '@/lib/reviews';
import { pushRecentSpot } from '@/lib/recent';
import { haversineKm, formatDistance } from '@/lib/geo';
import { kakaoDirections, naverSearch, kakaoRoadview, googleTransit } from '@/lib/directions';
import AddToCourseButton from '@/components/AddToCourseButton';
import { StarRating, StarInput } from '@/components/Stars';
import {
  ChevronLeft, Bookmark, MapPin, Share2, Compass, Check, Heart, Eye, Bus,
  Clock, Ticket, CalendarX, Accessibility, Lightbulb, AlertTriangle, ImagePlus, Trash2, Camera,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Spot, SceneInfo } from '@/lib/types';

export default function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [scenes, setScenes] = useState<SceneInfo[]>([]);
  const [nearby, setNearby] = useState<(Spot & { distanceKm: number })[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [visited, setVisited] = useState(false);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showReal, setShowReal] = useState<Record<number, boolean>>({});

  // 리뷰
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const refreshReviews = useCallback(() => {
    setReviews(getReviews(id));
    setSummary(getRatingSummary(id));
  }, [id]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [spotData, scenesData, allSpots] = await Promise.all([
          getSpotById(id),
          getScenesBySpot(id),
          getSpotsWithScenes(),
        ]);
        if (spotData) setSpot(spotData);
        setScenes(scenesData);

        // 근처 촬영지(자기 제외) — 거리순 상위 4
        if (spotData) {
          const ranked = allSpots
            .filter((s) => s.id !== id)
            .map((s) => ({ ...s, distanceKm: haversineKm(spotData, s) }))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 4);
          setNearby(ranked);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // 로컬 상태 + 최근 본 기록
  useEffect(() => {
    setIsBookmarked(readBookmark(id));
    setVisited(readVisited(id));
    setLiked(isLiked(id));
    refreshReviews();
    pushRecentSpot(id);
  }, [id, refreshReviews]);

  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('2MB 이하 이미지를 올려주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submitReview = () => {
    if (!reviewText.trim() && !photo) {
      alert('후기 내용이나 사진을 입력해 주세요.');
      return;
    }
    addReview({ spotId: id, rating, text: reviewText, photo });
    setReviewText('');
    setPhoto(null);
    setRating(5);
    refreshReviews();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-antique-ivory/50">장소 정보 불러오는 중...</div>
      </div>
    );

  if (!spot) return <div className="min-h-screen bg-background text-antique-ivory p-20 text-center">장소를 찾을 수 없습니다.</div>;

  const hasInfo = spot.hours || spot.closed_day || spot.fee || spot.reservation_url || spot.accessibility || spot.tips;

  return (
    <main className="min-h-screen bg-background text-antique-ivory relative">
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-5 py-3.5 bg-zinc-900 border border-white/10 text-antique-ivory text-xs font-semibold rounded-full shadow-2xl">
          🔗 링크가 클립보드에 복사되었습니다!
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-background to-transparent">
        <button onClick={() => window.history.back()} className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-all">
            <Share2 size={22} />
          </button>
          <button
            onClick={() => setLiked(toggleLike(id))}
            className={`p-2 backdrop-blur-md rounded-full border border-white/10 transition-all ${liked ? 'bg-rose-500 text-white' : 'bg-black/40 text-antique-ivory hover:bg-black/60'}`}
          >
            <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setVisited(toggleVisitedLocal(id))}
            className={`p-2 backdrop-blur-md rounded-full border border-white/10 transition-all ${visited ? 'bg-emerald-500 text-black' : 'bg-black/40 text-antique-ivory hover:bg-black/60'}`}
          >
            <Check size={22} />
          </button>
          <button
            onClick={() => setIsBookmarked(toggleBookmarkLocal(id))}
            className={`p-2 backdrop-blur-md rounded-full border border-white/10 transition-all ${isBookmarked ? 'bg-antique-ivory text-black' : 'bg-black/40 text-antique-ivory hover:bg-black/60'}`}
          >
            <Bookmark size={22} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto pt-24 px-6 pb-24 space-y-12">
        {/* Spot Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-antique-ivory/60 flex-wrap">
            <MapPin size={18} />
            <span className="text-sm tracking-wide uppercase font-medium">{spot.is_cafe ? '감성 카페' : '영화 촬영지'}</span>
            {summary.count > 0 && (
              <span className="flex items-center gap-1 text-sm">
                <StarRating value={summary.avg} /> <span className="text-antique-ivory/50">{summary.avg} ({summary.count})</span>
              </span>
            )}
            {spot.status === 'closed' && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full text-[11px] border border-rose-500/30">
                <AlertTriangle size={11} /> 폐업
              </span>
            )}
            {spot.status === 'moved' && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[11px] border border-amber-500/30">
                <AlertTriangle size={11} /> 이전함
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{spot.name}</h1>
          <p className="text-lg md:text-xl text-antique-ivory/40">{spot.address}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link href={`/map?spot_id=${spot.id}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-antique-ivory text-black text-xs font-bold rounded-xl hover:bg-white transition-all shadow-md active:scale-95">
              <Compass size={14} /> 지도로 위치 보기
            </Link>
            <a href={kakaoDirections(spot.name, spot.lat, spot.lng)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 text-antique-ivory/80 hover:bg-white/10 text-xs font-semibold rounded-xl transition-all">
              <Compass size={14} /> 카카오 길찾기
            </a>
            <a href={naverSearch(spot.name)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 text-antique-ivory/80 hover:bg-white/10 text-xs font-semibold rounded-xl transition-all">
              <Compass size={14} /> 네이버 길찾기
            </a>
            <a href={googleTransit(spot.lat, spot.lng)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 text-antique-ivory/80 hover:bg-white/10 text-xs font-semibold rounded-xl transition-all">
              <Bus size={14} /> 대중교통
            </a>
            <a href={kakaoRoadview(spot.lat, spot.lng)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 text-antique-ivory/80 hover:bg-white/10 text-xs font-semibold rounded-xl transition-all">
              <Eye size={14} /> 로드뷰
            </a>
            <div className="w-full sm:w-auto">
              <AddToCourseButton spotId={spot.id} compact />
            </div>
          </div>
        </div>

        {/* 방문 정보 (데이터 있을 때만) */}
        {hasInfo && (
          <div className="grid sm:grid-cols-2 gap-3">
            {spot.hours && (
              <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                <Clock size={18} className="text-antique-ivory/50 mt-0.5" />
                <div><p className="text-xs text-antique-ivory/40">영업시간</p><p className="text-sm">{spot.hours}</p></div>
              </div>
            )}
            {spot.closed_day && (
              <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                <CalendarX size={18} className="text-antique-ivory/50 mt-0.5" />
                <div><p className="text-xs text-antique-ivory/40">휴무</p><p className="text-sm">{spot.closed_day}</p></div>
              </div>
            )}
            {spot.fee && (
              <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                <Ticket size={18} className="text-antique-ivory/50 mt-0.5" />
                <div><p className="text-xs text-antique-ivory/40">입장료</p><p className="text-sm">{spot.fee}</p></div>
              </div>
            )}
            {spot.accessibility && (
              <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                <Accessibility size={18} className="text-antique-ivory/50 mt-0.5" />
                <div><p className="text-xs text-antique-ivory/40">접근성</p><p className="text-sm">{spot.accessibility}</p></div>
              </div>
            )}
            {spot.tips && (
              <div className="flex items-start gap-3 p-4 bg-amber-400/5 border border-amber-400/10 rounded-2xl sm:col-span-2">
                <Lightbulb size={18} className="text-amber-400/70 mt-0.5" />
                <div><p className="text-xs text-amber-400/60">방문 팁</p><p className="text-sm">{spot.tips}</p></div>
              </div>
            )}
            {spot.reservation_url && (
              <a href={spot.reservation_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 bg-antique-ivory text-black rounded-2xl text-sm font-bold hover:bg-white transition-all sm:col-span-2">
                예약하기 →
              </a>
            )}
          </div>
        )}

        {/* 명장면 갤러리 */}
        <div className="space-y-8">
          <h2 className="text-2xl font-medium border-b border-white/10 pb-4">미디어 속 명장면 {scenes.length > 0 && `(${scenes.length})`}</h2>
          <div className="grid gap-12">
            {scenes.map((scene, idx) => {
              const real = scene.real_image_url;
              const showingReal = real && showReal[idx];
              const displaySrc = showingReal ? real : scene.image_url;
              return (
                <div key={scene.id || idx} className="space-y-6">
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-800">
                    {displaySrc ? (
                      <Image src={displaySrc} alt={scene.description || 'Scene'} fill unoptimized className="object-cover transition-opacity duration-300" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-antique-ivory/20 gap-2">
                        <Camera size={40} className="opacity-20" />
                        <span className="text-sm italic">이미지가 등록되지 않았습니다</span>
                      </div>
                    )}
                    {real && (
                      <button
                        onClick={() => setShowReal((s) => ({ ...s, [idx]: !s[idx] }))}
                        className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-md border border-white/15 rounded-full text-[11px] font-bold text-antique-ivory hover:bg-black/90 transition-all"
                      >
                        {showingReal ? '🎬 명장면 보기' : '📍 실제 모습 보기'}
                      </button>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/10">
                      {showingReal ? 'NOW · 실제' : 'SCENE · 명장면'}
                    </span>
                  </div>

                  {scene.video_url && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                      <iframe src={scene.video_url} title="scene video" className="w-full h-full" allowFullScreen />
                    </div>
                  )}

                  <div className="space-y-3">
                    {scene.movies && (
                      <Link
                        href={`/movie/${scene.movies.id}`}
                        className="inline-block px-3 py-1 bg-antique-ivory/10 text-antique-ivory text-sm rounded-full border border-antique-ivory/20 hover:bg-antique-ivory hover:text-black transition-all"
                      >
                        {scene.movies.title}
                      </Link>
                    )}
                    {scene.description && <p className="text-2xl font-light leading-relaxed">&ldquo;{scene.description}&rdquo;</p>}
                  </div>
                </div>
              );
            })}
            {scenes.length === 0 && (
              <div className="text-center py-10 text-antique-ivory/30 italic">이 장소가 등장한 작품 정보가 등록되지 않았습니다.</div>
            )}
          </div>
        </div>

        {/* 근처 다른 촬영지 */}
        {nearby.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-medium border-b border-white/10 pb-4">근처 다른 촬영지</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {nearby.map((n) => (
                <Link key={n.id} href={`/spot/${n.id}`} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-antique-ivory/30 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-full shrink-0 ${n.is_cafe ? 'bg-amber-400/10 text-amber-400' : 'bg-antique-ivory/10 text-antique-ivory'}`}>
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{n.name}</p>
                      <p className="text-xs text-antique-ivory/40 truncate">{n.address}</p>
                    </div>
                  </div>
                  <span className="text-xs text-antique-ivory/50 shrink-0 ml-2">{formatDistance(n.distanceKm)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 리뷰 */}
        <div className="space-y-5">
          <h2 className="text-2xl font-medium border-b border-white/10 pb-4 flex items-center gap-3">
            리뷰
            {summary.count > 0 && (
              <span className="text-base text-antique-ivory/50 flex items-center gap-1.5">
                <StarRating value={summary.avg} size={16} /> {summary.avg} · {summary.count}개
              </span>
            )}
          </h2>

          {/* 작성 폼 */}
          <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-4">
            <StarInput value={rating} onChange={setRating} />
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="방문 후기를 남겨보세요. (포토스팟, 분위기, 팁 등)"
              rows={3}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-antique-ivory/50 resize-none"
            />
            {photo && (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/10">
                <Image src={photo} alt="첨부 사진" fill unoptimized className="object-cover" />
                <button onClick={() => setPhoto(null)} className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white">
                  <Trash2 size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-antique-ivory/70 cursor-pointer hover:bg-white/10 transition-all">
                <ImagePlus size={14} /> 사진 첨부
                <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
              </label>
              <button onClick={submitReview} className="px-5 py-2 bg-antique-ivory text-black rounded-xl text-xs font-bold hover:bg-white transition-all active:scale-95">
                리뷰 등록
              </button>
            </div>
          </div>

          {/* 목록 */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-antique-ivory/30 text-center py-6">첫 리뷰를 남겨보세요!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <StarRating value={r.rating} />
                    <button onClick={() => { deleteReview(id, r.id); refreshReviews(); }} className="text-antique-ivory/30 hover:text-rose-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {r.text && <p className="text-sm text-antique-ivory/80 leading-relaxed">{r.text}</p>}
                  {r.photo && (
                    <div className="relative w-full max-w-xs aspect-video rounded-xl overflow-hidden border border-white/10">
                      <Image src={r.photo} alt="리뷰 사진" fill unoptimized className="object-cover" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
