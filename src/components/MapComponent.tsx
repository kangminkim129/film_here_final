'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Map, Marker, Popup, NavigationControl, Source, Layer, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';
import { getSpotsWithScenes, getMovieById } from '@/lib/data';
import { getBookmarkIds, toggleBookmark as toggleBookmarkLocal } from '@/lib/bookmarks';
import { getVisitedIds, toggleVisited as toggleVisitedLocal, subscribeVisited } from '@/lib/visited';
import { pushRecentSpot } from '@/lib/recent';
import { haversineKm, formatDistance, nearestNeighborOrder } from '@/lib/geo';
import { koMatch } from '@/lib/korean';
import { kakaoDirections, naverSearch, kakaoRoadview, googleMultiStop } from '@/lib/directions';
import { decodeCourse } from '@/lib/courses';
import AddToCourseButton from './AddToCourseButton';
import {
  MapPin, Film, Search, X, ChevronLeft, Bookmark, Compass, ExternalLink, ChevronRight,
  LocateFixed, Layers, Eye, Check, Route, Navigation,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Spot } from '@/lib/types';

// Mapbox 토큰 유효성: 미설정이거나 placeholder면 지도를 마운트하지 않는다.
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const HAS_VALID_MAPBOX_TOKEN = Boolean(
  MAPBOX_TOKEN && MAPBOX_TOKEN.startsWith('pk.') && !MAPBOX_TOKEN.includes('placeholder')
);

const MAP_STYLES = [
  { id: 'dark', label: '다크', url: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'light', label: '밝게', url: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite', label: '위성', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
] as const;

const RADIUS_OPTIONS = [1, 3, 5, 10];

type ClusterItem =
  | { type: 'point'; spot: Spot }
  | { type: 'cluster'; lat: number; lng: number; count: number; key: string };

// 화면(지오) 그리드 기반 경량 클러스터링: 줌이 낮을수록 셀이 커져 마커가 묶인다.
// 주의: 이 파일은 react-map-gl의 `Map`을 import하므로 전역 Map 생성자 대신 plain object를 쓴다.
function clusterize(spots: Spot[], zoom: number, excludeId?: string): ClusterItem[] {
  const cell = (360 / Math.pow(2, zoom)) * 0.4;
  const groups: Record<string, Spot[]> = {};
  for (const s of spots) {
    if (s.id === excludeId) continue;
    const key = `${Math.floor(s.lat / cell)}:${Math.floor(s.lng / cell)}`;
    if (groups[key]) groups[key].push(s);
    else groups[key] = [s];
  }
  const out: ClusterItem[] = [];
  for (const key of Object.keys(groups)) {
    const arr = groups[key];
    if (arr.length === 1) {
      out.push({ type: 'point', spot: arr[0] });
    } else {
      const lat = arr.reduce((a, s) => a + s.lat, 0) / arr.length;
      const lng = arr.reduce((a, s) => a + s.lng, 0) / arr.length;
      out.push({ type: 'cluster', lat, lng, count: arr.length, key });
    }
  }
  return out;
}

export default function MapComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapRef = useRef<MapRef>(null);
  const nearTriggered = useRef(false);

  const spotIdParam = searchParams.get('spot_id');
  const movieIdParam = searchParams.get('movie_id');
  const courseParam = searchParams.get('course');

  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [popupSpot, setPopupSpot] = useState<Spot | null>(null);
  const [bookmarkedSpotIds, setBookmarkedSpotIds] = useState<Set<string>>(new Set());
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMovieTitle, setFilterMovieTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [viewState, setViewState] = useState({ latitude: 37.5665, longitude: 126.978, zoom: 11 });

  // 신규: 위치/스타일/필터 상태
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [styleIdx, setStyleIdx] = useState(0);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [radiusKm, setRadiusKm] = useState(3);

  const courseData = useMemo(() => (courseParam ? decodeCourse(courseParam) : null), [courseParam]);
  const courseIdSet = useMemo(() => new Set(courseData?.spotIds ?? []), [courseData]);
  const courseActive = courseIdSet.size > 0;

  const flyTo = useCallback((lng: number, lat: number, zoom?: number) => {
    const map = mapRef.current;
    if (map) map.flyTo({ center: [lng, lat], zoom: zoom ?? 14, duration: 1200, essential: true });
    else setViewState((v) => ({ latitude: lat, longitude: lng, zoom: zoom ?? v.zoom }));
  }, []);

  // 1. Fetch Spots (Supabase 우선, 없으면 시드 폴백)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setSpots(await getSpotsWithScenes());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. 찜/방문 (localStorage)
  useEffect(() => {
    setBookmarkedSpotIds(new Set(getBookmarkIds()));
    setVisitedIds(new Set(getVisitedIds()));
    return subscribeVisited(() => setVisitedIds(new Set(getVisitedIds())));
  }, []);

  // 3. 영화 필터 제목
  useEffect(() => {
    if (movieIdParam) {
      getMovieById(movieIdParam).then((m) => setFilterMovieTitle(m?.title ?? null));
    } else {
      setFilterMovieTitle(null);
    }
  }, [movieIdParam]);

  // 4. spot_id 파라미터로 센터링 (부드러운 이동)
  useEffect(() => {
    if (spots.length > 0 && spotIdParam) {
      const spot = spots.find((s) => s.id === spotIdParam);
      if (spot) {
        setSelectedSpot(spot);
        flyTo(spot.lng, spot.lat, 15);
      }
    }
  }, [spots, spotIdParam, flyTo]);

  // 5. movie_id 파라미터로 센터링
  useEffect(() => {
    if (spots.length > 0 && movieIdParam) {
      const movieSpot = spots.find((s) => s.scenes?.some((sc) => sc.movies?.id === movieIdParam));
      if (movieSpot) flyTo(movieSpot.lng, movieSpot.lat, 12);
    }
  }, [spots, movieIdParam, flyTo]);

  // 코스 진입 시 첫 지점으로 이동
  useEffect(() => {
    if (spots.length > 0 && courseActive) {
      const first = spots.find((s) => courseIdSet.has(s.id));
      if (first) flyTo(first.lng, first.lat, 13);
    }
  }, [spots, courseActive, courseIdSet, flyTo]);

  const toggleBookmark = (spotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nowBookmarked = toggleBookmarkLocal(spotId);
    setBookmarkedSpotIds((prev) => {
      const next = new Set(prev);
      if (nowBookmarked) next.add(spotId);
      else next.delete(spotId);
      return next;
    });
  };

  const toggleVisited = (spotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleVisitedLocal(spotId);
    setVisitedIds(new Set(getVisitedIds()));
  };

  const handleMarkerClick = (spot: Spot) => {
    setSelectedSpot(spot);
    setPopupSpot(null);
    pushRecentSpot(spot.id);
    flyTo(spot.lng, spot.lat, Math.max(viewState.zoom, 14));
  };

  // 지도 핀 클릭 → 간단 정보 팝업
  const openPopup = (spot: Spot) => {
    setPopupSpot(spot);
    pushRecentSpot(spot.id);
    flyTo(spot.lng, spot.lat, Math.max(viewState.zoom, 14));
  };

  const clearMovieFilter = () => router.push('/map');

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('이 브라우저에서는 위치 기능을 사용할 수 없습니다.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocating(false);
        flyTo(loc.lng, loc.lat, 14);
      },
      () => {
        setLocating(false);
        alert('위치 권한을 허용해 주세요.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 홈의 "내 주변" 진입(?near=1): 자동으로 위치 요청 + 근처 필터 on (StrictMode 중복 실행 방지)
  useEffect(() => {
    if (nearTriggered.current) return;
    if (searchParams.get('near') === '1') {
      nearTriggered.current = true;
      setNearMe(true);
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 필터링 ──
  const baseSpots = useMemo(() => {
    let list = spots;
    if (courseActive) list = list.filter((s) => courseIdSet.has(s.id));
    if (movieIdParam) list = list.filter((s) => s.scenes?.some((sc) => sc.movies?.id === movieIdParam));
    if (showBookmarksOnly) list = list.filter((s) => bookmarkedSpotIds.has(s.id));
    if (nearMe && userLocation) list = list.filter((s) => haversineKm(userLocation, s) <= radiusKm);
    if (searchQuery) {
      list = list.filter(
        (s) =>
          koMatch(s.name, searchQuery) ||
          koMatch(s.address, searchQuery) ||
          (s.scenes?.some((sc) => koMatch(sc.movies?.title, searchQuery)) ?? false)
      );
    }
    return list;
  }, [spots, courseActive, courseIdSet, movieIdParam, showBookmarksOnly, bookmarkedSpotIds, nearMe, userLocation, radiusKm, searchQuery]);

  // 코스는 최적 동선 순서, 그 외엔 거리순(위치 있을 때)
  const courseOrdered = useMemo(() => {
    if (!courseActive) return [];
    const inCourse = spots.filter((s) => courseIdSet.has(s.id));
    if (!inCourse.length) return [];
    const origin = userLocation ?? { lat: inCourse[0].lat, lng: inCourse[0].lng };
    return nearestNeighborOrder(origin, inCourse);
  }, [courseActive, spots, courseIdSet, userLocation]);

  const listSpots = useMemo(() => {
    if (courseActive) return courseOrdered;
    if (userLocation) return [...baseSpots].sort((a, b) => haversineKm(userLocation, a) - haversineKm(userLocation, b));
    return baseSpots;
  }, [courseActive, courseOrdered, baseSpots, userLocation]);

  // 정수 줌 단계에서만 재클러스터링 → fly/zoom 중 마커 깜빡임 방지. id만 의존(객체 참조 변화 무시).
  const clusterZoom = Math.round(viewState.zoom);
  const activeSpot = selectedSpot ?? popupSpot; // 패널 선택 또는 팝업 대상 = 강조 핀
  const selectedId = activeSpot?.id;
  const clusters = useMemo(
    () => clusterize(baseSpots, clusterZoom, selectedId),
    [baseSpots, clusterZoom, selectedId]
  );

  const courseLine = useMemo(() => {
    if (!courseActive || courseOrdered.length < 2) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: courseOrdered.map((s) => [s.lng, s.lat]) },
    };
  }, [courseActive, courseOrdered]);

  const distanceLabel = (spot: Spot) =>
    userLocation ? formatDistance(haversineKm(userLocation, spot)) : null;

  const sceneImg = (spot: Spot) => spot.thumbnail_url || spot.scenes?.[0]?.image_url || null;

  return (
    <div className="relative w-full h-screen bg-cinematic-dark text-white font-sans">
      {/* ── SIDE PANEL (DESKTOP) ── */}
      <div className="absolute top-4 left-4 z-20 w-[380px] h-[calc(100vh-32px)] bg-zinc-950/85 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden hidden md:flex shadow-2xl">
        {selectedSpot ? (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
              <button
                onClick={() => setSelectedSpot(null)}
                className="flex items-center gap-1.5 text-antique-ivory/60 hover:text-white text-sm font-medium transition-colors"
              >
                <ChevronLeft size={18} />
                목록으로 돌아가기
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleVisited(selectedSpot.id, e)}
                  title="가봤어요"
                  className={`p-2 rounded-full border transition-all ${
                    visitedIds.has(selectedSpot.id)
                      ? 'bg-emerald-500 border-emerald-500 text-black'
                      : 'border-white/10 text-antique-ivory/80 hover:bg-white/5'
                  }`}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={(e) => toggleBookmark(selectedSpot.id, e)}
                  className={`p-2 rounded-full border transition-all ${
                    bookmarkedSpotIds.has(selectedSpot.id)
                      ? 'bg-antique-ivory border-antique-ivory text-black hover:bg-white'
                      : 'border-white/10 text-antique-ivory/80 hover:bg-white/5'
                  }`}
                >
                  <Bookmark size={16} fill={bookmarkedSpotIds.has(selectedSpot.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-video bg-zinc-800 border-b border-white/10 group overflow-hidden">
              {sceneImg(selectedSpot) ? (
                <Image
                  src={sceneImg(selectedSpot) as string}
                  alt={selectedSpot.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2 bg-zinc-900">
                  <Film size={40} className="opacity-20 animate-pulse" />
                  <span className="text-xs font-light">스틸컷 준비 중</span>
                </div>
              )}
              {selectedSpot.scenes?.[0]?.movies && (
                <Link
                  href={`/movie/${selectedSpot.scenes[0].movies.id}`}
                  className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-full text-[10px] font-bold text-antique-ivory border border-white/10 hover:bg-antique-ivory hover:text-black transition-all flex items-center gap-1"
                >
                  <Film size={10} />
                  {selectedSpot.scenes[0].movies.title}
                </Link>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${selectedSpot.is_cafe ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {selectedSpot.is_cafe ? '감성 카페' : '촬영지'}
                    </span>
                    {distanceLabel(selectedSpot) && (
                      <span className="ml-1 text-[10px] text-antique-ivory/60 flex items-center gap-0.5">
                        <Navigation size={9} /> {distanceLabel(selectedSpot)}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-antique-ivory tracking-tight">{selectedSpot.name}</h2>
                  <p className="text-xs text-zinc-400 font-light">{selectedSpot.address}</p>
                </div>

                {selectedSpot.scenes && selectedSpot.scenes.length > 0 && selectedSpot.scenes[0].description && (
                  <div className="relative bg-white/5 border border-white/5 rounded-2xl p-4">
                    <p className="text-sm text-zinc-200 leading-relaxed font-light italic">
                      &ldquo;{selectedSpot.scenes[0].description}&rdquo;
                    </p>
                  </div>
                )}

                {(selectedSpot.hours || selectedSpot.fee) && (
                  <div className="text-xs text-zinc-300 space-y-1 bg-white/5 border border-white/5 rounded-2xl p-4">
                    {selectedSpot.hours && <p>🕒 {selectedSpot.hours}</p>}
                    {selectedSpot.fee && <p>💵 {selectedSpot.fee}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <Link
                  href={`/spot/${selectedSpot.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-3 bg-antique-ivory text-black rounded-xl text-xs font-bold hover:bg-white transition-all active:scale-95 shadow-lg"
                >
                  명장면 상세 정보
                  <ExternalLink size={12} />
                </Link>

                <AddToCourseButton spotId={selectedSpot.id} />

                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={kakaoDirections(selectedSpot.name, selectedSpot.lat, selectedSpot.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-2.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-300 rounded-xl transition-all"
                  >
                    <Compass size={12} />
                    카카오
                  </a>
                  <a
                    href={naverSearch(selectedSpot.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-2.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-300 rounded-xl transition-all"
                  >
                    <Compass size={12} />
                    네이버
                  </a>
                  <a
                    href={kakaoRoadview(selectedSpot.lat, selectedSpot.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-2.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-300 rounded-xl transition-all"
                  >
                    <Eye size={12} />
                    로드뷰
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 space-y-3 bg-zinc-900/30">
              <h1 className="text-lg font-bold text-antique-ivory flex items-center gap-1.5">
                <Film className="text-antique-ivory" size={18} />
                FilmHere 탐색
              </h1>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="영화, 촬영지, 주소 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-xs text-white focus:outline-none focus:border-antique-ivory/50 focus:bg-zinc-900 transition-all placeholder-zinc-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* 빠른 필터 칩 */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setShowBookmarksOnly((v) => !v)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                    showBookmarksOnly ? 'bg-antique-ivory text-black border-antique-ivory' : 'border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Bookmark size={10} /> 찜만
                </button>
                <button
                  onClick={() => {
                    if (!userLocation) requestLocation();
                    setNearMe((v) => !v);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                    nearMe ? 'bg-antique-ivory text-black border-antique-ivory' : 'border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Navigation size={10} /> 내 주변
                </button>
                {nearMe && (
                  <div className="flex items-center gap-1">
                    {RADIUS_OPTIONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRadiusKm(r)}
                        className={`px-1.5 py-1 rounded-full text-[10px] border transition-all ${
                          radiusKm === r ? 'bg-white/15 border-white/30 text-white' : 'border-white/10 text-zinc-500'
                        }`}
                      >
                        {r}km
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {movieIdParam && filterMovieTitle && (
                <div className="flex items-center justify-between px-3 py-2 bg-antique-ivory/10 border border-antique-ivory/20 rounded-xl text-xs">
                  <span className="text-antique-ivory/80 font-medium truncate">🎬 {filterMovieTitle} 촬영지</span>
                  <button onClick={clearMovieFilter} className="text-antique-ivory/60 hover:text-white p-0.5">
                    <X size={12} />
                  </button>
                </div>
              )}

              {courseActive && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs">
                    <span className="text-emerald-300 font-medium truncate flex items-center gap-1">
                      <Route size={12} /> {courseData?.name} · {courseOrdered.length}곳
                    </span>
                    <button onClick={() => router.push('/map')} className="text-emerald-300/60 hover:text-white p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                  {courseOrdered.length > 0 && (
                    <a
                      href={googleMultiStop(courseOrdered.map((s) => ({ lat: s.lat, lng: s.lng })))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all"
                    >
                      <Navigation size={12} /> 최적 동선으로 투어 시작
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
                  <div className="animate-spin w-5 h-5 border-2 border-antique-ivory border-t-transparent rounded-full" />
                  <span className="text-[11px] font-light">장소 데이터를 불러오는 중...</span>
                </div>
              ) : listSpots.length > 0 ? (
                listSpots.map((spot, i) => {
                  const isBookmarked = bookmarkedSpotIds.has(spot.id);
                  const isVisited = visitedIds.has(spot.id);
                  const movieTitle = spot.scenes?.[0]?.movies?.title;
                  const dist = distanceLabel(spot);
                  return (
                    <div
                      key={spot.id}
                      onClick={() => handleMarkerClick(spot)}
                      className="p-4 hover:bg-white/5 transition-all duration-200 cursor-pointer group flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {courseActive && <span className="text-[10px] font-bold text-emerald-400">{i + 1}.</span>}
                          <span className={`w-1.5 h-1.5 rounded-full ${spot.is_cafe ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <h3 className="font-bold text-sm text-zinc-200 group-hover:text-antique-ivory transition-colors truncate">
                            {spot.name}
                          </h3>
                          {isVisited && <Check size={11} className="text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate font-light">{spot.address}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {movieTitle && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-zinc-300 font-medium">
                              <Film size={8} />
                              {movieTitle}
                            </span>
                          )}
                          {dist && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-antique-ivory/50">
                              <Navigation size={8} /> {dist}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleBookmark(spot.id, e)}
                          className={`p-1.5 rounded-full border transition-all ${
                            isBookmarked ? 'bg-antique-ivory border-antique-ivory text-black' : 'border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <Bookmark size={12} fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                        <ChevronRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs font-light">
                  {showBookmarksOnly ? '찜한 장소가 없습니다.' : nearMe ? `반경 ${radiusKm}km 내 촬영지가 없습니다.` : '검색 결과와 일치하는 장소가 없습니다.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 지도 컨트롤 (위치/스타일) ── */}
      {HAS_VALID_MAPBOX_TOKEN && (
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          <button
            onClick={requestLocation}
            title="내 위치"
            className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
              userLocation ? 'bg-antique-ivory text-black border-antique-ivory' : 'bg-zinc-950/85 border-white/10 text-antique-ivory hover:bg-zinc-900'
            }`}
          >
            <LocateFixed size={18} className={locating ? 'animate-pulse' : ''} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowStylePicker((v) => !v)}
              title="지도 스타일"
              className="p-2.5 rounded-xl border border-white/10 bg-zinc-950/85 backdrop-blur-md shadow-lg text-antique-ivory hover:bg-zinc-900 transition-all"
            >
              <Layers size={18} />
            </button>
            {showStylePicker && (
              <div className="absolute right-0 mt-2 w-24 py-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                {MAP_STYLES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setStyleIdx(i);
                      setShowStylePicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${
                      styleIdx === i ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM SHEET (MOBILE) ── */}
      {selectedSpot ? (
        <div className="fixed bottom-0 left-0 right-0 h-[48vh] bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl z-[1000] flex flex-col overflow-hidden md:hidden shadow-2xl">
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3" />
          <div className="px-5 pb-3 border-b border-white/5 flex items-center justify-between">
            <button onClick={() => setSelectedSpot(null)} className="flex items-center gap-1 text-antique-ivory/60 hover:text-white text-xs font-medium">
              <ChevronLeft size={16} />
              목록으로
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => toggleVisited(selectedSpot.id, e)}
                className={`p-1.5 rounded-full border transition-all ${
                  visitedIds.has(selectedSpot.id) ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/10 text-antique-ivory/80'
                }`}
              >
                <Check size={14} />
              </button>
              <button
                onClick={(e) => toggleBookmark(selectedSpot.id, e)}
                className={`p-1.5 rounded-full border transition-all ${
                  bookmarkedSpotIds.has(selectedSpot.id) ? 'bg-antique-ivory border-antique-ivory text-black' : 'border-white/10 text-antique-ivory/80'
                }`}
              >
                <Bookmark size={14} fill={bookmarkedSpotIds.has(selectedSpot.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex gap-4">
              <div className="relative w-24 h-24 bg-zinc-800 rounded-xl border border-white/10 overflow-hidden shrink-0">
                {sceneImg(selectedSpot) ? (
                  <Image src={sceneImg(selectedSpot) as string} alt={selectedSpot.name} fill unoptimized className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 bg-zinc-900">
                    <Film size={20} />
                  </div>
                )}
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedSpot.is_cafe ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    {selectedSpot.is_cafe ? '감성 카페' : '촬영지'}
                  </span>
                  {distanceLabel(selectedSpot) && (
                    <span className="text-[9px] text-antique-ivory/60">· {distanceLabel(selectedSpot)}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-antique-ivory truncate">{selectedSpot.name}</h2>
                <p className="text-[11px] text-zinc-400 truncate font-light">{selectedSpot.address}</p>
                {selectedSpot.scenes?.[0]?.movies && (
                  <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] text-zinc-300 font-medium">
                    🎬 {selectedSpot.scenes[0].movies.title}
                  </span>
                )}
              </div>
            </div>

            {selectedSpot.scenes && selectedSpot.scenes.length > 0 && selectedSpot.scenes[0].description && (
              <p className="text-xs text-zinc-300 leading-relaxed italic bg-white/5 border border-white/5 rounded-xl p-3 font-light">
                &ldquo;{selectedSpot.scenes[0].description}&rdquo;
              </p>
            )}

            <AddToCourseButton spotId={selectedSpot.id} />

            <div className="grid grid-cols-4 gap-2">
              <Link
                href={`/spot/${selectedSpot.id}`}
                className="flex items-center justify-center py-3 bg-antique-ivory text-black rounded-xl text-[10px] font-bold text-center active:scale-95 shadow-md"
              >
                상세
              </Link>
              <a
                href={kakaoDirections(selectedSpot.name, selectedSpot.lat, selectedSpot.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 py-3 bg-zinc-900 border border-white/10 text-[10px] font-bold text-zinc-300 rounded-xl text-center"
              >
                <Compass size={10} /> 카카오
              </a>
              <a
                href={naverSearch(selectedSpot.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 py-3 bg-zinc-900 border border-white/10 text-[10px] font-bold text-zinc-300 rounded-xl text-center"
              >
                <Compass size={10} /> 네이버
              </a>
              <a
                href={kakaoRoadview(selectedSpot.lat, selectedSpot.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 py-3 bg-zinc-900 border border-white/10 text-[10px] font-bold text-zinc-300 rounded-xl text-center"
              >
                <Eye size={10} /> 로드뷰
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute top-20 left-4 right-4 z-20 md:hidden bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="영화, 촬영지 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-2 pl-8 pr-8 text-xs text-white focus:outline-none focus:border-antique-ivory/50 placeholder-zinc-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <X size={12} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowBookmarksOnly((v) => !v)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                showBookmarksOnly ? 'bg-antique-ivory text-black border-antique-ivory' : 'border-white/10 text-zinc-400'
              }`}
            >
              <Bookmark size={10} /> 찜만
            </button>
            <button
              onClick={() => {
                if (!userLocation) requestLocation();
                setNearMe((v) => !v);
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                nearMe ? 'bg-antique-ivory text-black border-antique-ivory' : 'border-white/10 text-zinc-400'
              }`}
            >
              <Navigation size={10} /> 내 주변
            </button>
          </div>
          {movieIdParam && filterMovieTitle && (
            <div className="flex items-center justify-between px-2.5 py-1 bg-antique-ivory/10 border border-antique-ivory/20 rounded-lg text-[10px]">
              <span className="text-antique-ivory/80 truncate">🎬 {filterMovieTitle} 촬영지 필터</span>
              <button onClick={clearMovieFilter} className="text-antique-ivory/60 hover:text-white">
                <X size={10} />
              </button>
            </div>
          )}

          {(searchQuery || nearMe || showBookmarksOnly) && (
            <div className="max-h-[25vh] overflow-y-auto divide-y divide-white/5 pt-1">
              {listSpots.length > 0 ? (
                listSpots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => handleMarkerClick(spot)}
                    className="py-2.5 flex items-center justify-between text-xs cursor-pointer active:bg-white/5"
                  >
                    <div className="truncate pr-4 flex-1">
                      <p className="font-bold text-zinc-200 truncate">{spot.name}</p>
                      <p className="text-[9px] text-zinc-400 truncate">{spot.address}</p>
                    </div>
                    {distanceLabel(spot) && <span className="text-[9px] text-antique-ivory/50 shrink-0 mr-2">{distanceLabel(spot)}</span>}
                    <ChevronRight size={12} className="text-zinc-600 shrink-0" />
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-center text-zinc-500 py-3">검색 결과가 없습니다.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MAPBOX CONTAINER ── */}
      {!HAS_VALID_MAPBOX_TOKEN ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-zinc-900 text-center px-8">
          <Compass size={40} className="text-antique-ivory/40" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-200">지도를 불러올 수 없습니다</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mapbox 액세스 토큰이 설정되지 않았습니다.<br />
              <code className="text-[10px] text-amber-400">.env.local</code> 파일에{' '}
              <code className="text-[10px] text-amber-400">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> 을
              <br />입력한 뒤 개발 서버를 다시 시작해 주세요.
            </p>
          </div>
        </div>
      ) : (
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={MAP_STYLES[styleIdx].url}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" />

          {/* 코스 동선 라인 */}
          {courseLine && (
            <Source id="course-line-src" type="geojson" data={courseLine}>
              <Layer
                id="course-line"
                type="line"
                paint={{ 'line-color': '#34d399', 'line-width': 3, 'line-dasharray': [2, 1], 'line-opacity': 0.8 }}
              />
            </Source>
          )}

          {/* 내 위치 마커 */}
          {userLocation && (
            <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
              <div className="relative">
                <div className="absolute inset-0 -m-3 bg-sky-400/30 rounded-full blur-sm animate-pulse" />
                <div className="w-4 h-4 bg-sky-400 rounded-full border-2 border-white shadow-lg relative" />
              </div>
            </Marker>
          )}

          {/* 클러스터 + 단일 마커 */}
          {clusters.map((item) => {
            if (item.type === 'cluster') {
              return (
                <Marker key={item.key} latitude={item.lat} longitude={item.lng} anchor="center">
                  <button
                    onClick={() => flyTo(item.lng, item.lat, Math.min(viewState.zoom + 2.5, 16))}
                    className="flex items-center justify-center rounded-full bg-antique-ivory/90 text-black font-bold border-2 border-white shadow-xl hover:scale-110 transition-transform"
                    style={{ width: 36 + Math.min(item.count, 20), height: 36 + Math.min(item.count, 20) }}
                  >
                    {item.count}
                  </button>
                </Marker>
              );
            }
            const spot = item.spot;
            const isBookmarked = bookmarkedSpotIds.has(spot.id);
            const isVisited = visitedIds.has(spot.id);
            const thumb = sceneImg(spot);
            const showThumb = thumb && viewState.zoom >= 13;
            return (
              <Marker
                key={spot.id}
                latitude={spot.lat}
                longitude={spot.lng}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  openPopup(spot);
                }}
              >
                <div className="cursor-pointer group relative">
                  {showThumb ? (
                    <div
                      className={`relative w-9 h-9 rounded-full overflow-hidden border-2 shadow-lg group-hover:scale-110 transition-transform ${
                        spot.is_cafe ? 'border-amber-400' : 'border-antique-ivory'
                      }`}
                    >
                      <Image src={thumb as string} alt={spot.name} fill unoptimized className="object-cover" />
                    </div>
                  ) : (
                    <MapPin
                      className={`transition-all duration-300 ${
                        isVisited
                          ? 'text-emerald-400 group-hover:scale-110'
                          : spot.is_cafe
                          ? 'text-amber-400 group-hover:scale-110'
                          : 'text-antique-ivory group-hover:scale-110'
                      }`}
                      size={32}
                      fill="currentColor"
                      fillOpacity={0.2}
                    />
                  )}
                  {isBookmarked && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-antique-ivory rounded-full flex items-center justify-center border border-black">
                      <Bookmark size={8} className="text-black" fill="currentColor" />
                    </span>
                  )}
                </div>
              </Marker>
            );
          })}

          {/* 강조 마커(패널 선택 또는 팝업 대상) */}
          {activeSpot && (
            <Marker latitude={activeSpot.lat} longitude={activeSpot.lng} anchor="bottom">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-md scale-150 animate-pulse" />
                <MapPin size={38} className="text-red-500 relative drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" fill="currentColor" fillOpacity={0.3} />
              </div>
            </Marker>
          )}

          {/* 핀 클릭 시 간단 정보 팝업 */}
          {popupSpot && (
            <Popup
              latitude={popupSpot.lat}
              longitude={popupSpot.lng}
              anchor="bottom"
              offset={42}
              closeButton={false}
              closeOnClick={false}
              onClose={() => setPopupSpot(null)}
              className="custom-popup"
              maxWidth="280px"
            >
              <div className="w-64 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-left">
                {sceneImg(popupSpot) && (
                  <div className="relative w-full h-28 bg-zinc-800">
                    <Image src={sceneImg(popupSpot) as string} alt={popupSpot.name} fill unoptimized className="object-cover" />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${popupSpot.is_cafe ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {popupSpot.is_cafe ? '감성 카페' : '촬영지'}
                      </span>
                      {distanceLabel(popupSpot) && (
                        <span className="text-[10px] text-antique-ivory/60 flex items-center gap-0.5">
                          · <Navigation size={9} /> {distanceLabel(popupSpot)}
                        </span>
                      )}
                    </div>
                    <button onClick={() => setPopupSpot(null)} className="text-zinc-500 hover:text-white shrink-0 -mt-0.5">
                      <X size={14} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-antique-ivory leading-tight">{popupSpot.name}</h3>
                    <p className="text-[11px] text-zinc-400 font-light truncate">{popupSpot.address}</p>
                  </div>

                  {popupSpot.scenes?.[0]?.movies && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-zinc-300 font-medium">
                      <Film size={9} />
                      {popupSpot.scenes[0].movies.title}
                    </span>
                  )}

                  {popupSpot.scenes?.[0]?.description && (
                    <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2 italic font-light">
                      &ldquo;{popupSpot.scenes[0].description}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      onClick={() => handleMarkerClick(popupSpot)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-antique-ivory text-black rounded-lg text-[11px] font-bold hover:bg-white transition-all active:scale-95"
                    >
                      상세
                      <ChevronRight size={12} />
                    </button>
                    <a
                      href={kakaoDirections(popupSpot.name, popupSpot.lat, popupSpot.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 px-2.5 py-2 bg-zinc-800 border border-white/10 rounded-lg text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700 transition-all"
                    >
                      <Compass size={12} /> 길찾기
                    </a>
                    <button
                      onClick={(e) => toggleBookmark(popupSpot.id, e)}
                      className={`p-2 rounded-lg border transition-all ${
                        bookmarkedSpotIds.has(popupSpot.id)
                          ? 'bg-antique-ivory border-antique-ivory text-black'
                          : 'border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Bookmark size={12} fill={bookmarkedSpotIds.has(popupSpot.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      )}
    </div>
  );
}
