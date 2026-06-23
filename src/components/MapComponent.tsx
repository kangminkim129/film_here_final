'use client';

import { useState, useEffect } from 'react';
import { Map, Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';
import { MapPin, Film, Search, X, ChevronLeft, Bookmark, Compass, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_cafe: boolean;
  scenes?: {
    image_url: string;
    description: string;
    movies: {
      id: string;
      title: string;
    };
  }[];
}

export default function MapComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const spotIdParam = searchParams.get('spot_id');
  const movieIdParam = searchParams.get('movie_id');

  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [bookmarkedSpotIds, setBookmarkedSpotIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMovieTitle, setFilterMovieTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [viewState, setViewState] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
    zoom: 11
  });

  // 1. Fetch Spots on Mount
  useEffect(() => {
    async function fetchSpots() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('spots')
          .select(`
            *,
            scenes (
              image_url,
              description,
              movies (
                id,
                title
              )
            )
          `);
        
        if (error) {
          console.error('Error fetching spots with join:', error);
          // Fallback to simple spots fetch
          const { data: simpleData, error: simpleError } = await supabase
            .from('spots')
            .select('*');
          
          if (!simpleError) {
            setSpots(simpleData as Spot[] || []);
          }
        } else {
          setSpots(data as unknown as Spot[] || []);
        }
      } catch (err) {
        console.error('Unexpected error in fetchSpots:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSpots();
  }, []);

  // 2. Fetch User Bookmarks
  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const { data, error } = await supabase.from('bookmarks').select('spot_id');
        if (!error && data) {
          setBookmarkedSpotIds(new Set(data.map(b => b.spot_id)));
        }
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
      }
    }
    fetchBookmarks();
  }, []);

  // 3. Fetch Movie Title if filtered by movie_id
  useEffect(() => {
    if (movieIdParam) {
      async function fetchMovieTitle() {
        try {
          const { data, error } = await supabase
            .from('movies')
            .select('title')
            .eq('id', movieIdParam)
            .single();
          if (!error && data) {
            setFilterMovieTitle(data.title);
          }
        } catch (err) {
          console.error('Error fetching movie title:', err);
        }
      }
      fetchMovieTitle();
    } else {
      setFilterMovieTitle(null);
    }
  }, [movieIdParam]);

  // 4. Center map based on spot_id query param
  useEffect(() => {
    if (spots.length > 0 && spotIdParam) {
      const spot = spots.find(s => s.id === spotIdParam);
      if (spot) {
        setSelectedSpot(spot);
        setViewState({
          latitude: spot.lat,
          longitude: spot.lng,
          zoom: 14
        });
      }
    }
  }, [spots, spotIdParam]);

  // 5. Center map based on movie spots if movie_id query param matches
  useEffect(() => {
    if (spots.length > 0 && movieIdParam) {
      // Find the first spot matching the movie
      const movieSpot = spots.find(s => 
        s.scenes?.some(sc => sc.movies?.id === movieIdParam)
      );
      if (movieSpot) {
        setViewState({
          latitude: movieSpot.lat,
          longitude: movieSpot.lng,
          zoom: 12
        });
      }
    }
  }, [spots, movieIdParam]);

  // Toggle bookmark function
  const toggleBookmark = async (spotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const isBookmarked = bookmarkedSpotIds.has(spotId);
    
    try {
      if (isBookmarked) {
        const { error } = await supabase.from('bookmarks').delete().eq('spot_id', spotId);
        if (!error) {
          setBookmarkedSpotIds(prev => {
            const next = new Set(prev);
            next.delete(spotId);
            return next;
          });
        }
      } else {
        const { error } = await supabase.from('bookmarks').insert({ spot_id: spotId });
        if (!error) {
          setBookmarkedSpotIds(prev => {
            const next = new Set(prev);
            next.add(spotId);
            return next;
          });
        }
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const handleMarkerClick = (spot: Spot) => {
    setSelectedSpot(spot);
    setViewState({
      ...viewState,
      latitude: spot.lat,
      longitude: spot.lng,
      zoom: 14
    });
  };

  const clearMovieFilter = () => {
    router.push('/map');
  };

  // Search filter logic
  const filteredSpots = spots.filter(spot => {
    if (movieIdParam) {
      const hasMovie = spot.scenes?.some(scene => scene.movies?.id === movieIdParam);
      if (!hasMovie) return false;
    }

    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = spot.name.toLowerCase().includes(query);
    const addressMatch = spot.address?.toLowerCase().includes(query) || false;
    const movieMatch = spot.scenes?.some(scene => 
      scene.movies?.title.toLowerCase().includes(query)
    ) || false;

    return nameMatch || addressMatch || movieMatch;
  });

  return (
    <div className="relative w-full h-screen bg-cinematic-dark text-white font-sans">
      {/* ── SIDE PANEL (DESKTOP) ── */}
      <div className="absolute top-4 left-4 z-20 w-[380px] h-[calc(100vh-32px)] bg-zinc-950/85 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden hidden md:flex shadow-2xl">
        {selectedSpot ? (
          /* Spot Detail Screen */
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
              <button 
                onClick={() => setSelectedSpot(null)} 
                className="flex items-center gap-1.5 text-antique-ivory/60 hover:text-white text-sm font-medium transition-colors"
              >
                <ChevronLeft size={18} />
                목록으로 돌아가기
              </button>
              <button 
                onClick={(e) => toggleBookmark(selectedSpot.id, e)}
                className={`p-2 rounded-full border transition-all ${
                  bookmarkedSpotIds.has(selectedSpot.id)
                    ? 'bg-antique-ivory border-antique-ivory text-black hover:bg-white' 
                    : 'border-white/10 text-antique-ivory/80 hover:bg-white/5'
                }`}
              >
                <Bookmark size={16} fill={bookmarkedSpotIds.has(selectedSpot.id) ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Still Cut */}
            <div className="relative w-full aspect-video bg-zinc-800 border-b border-white/10 group overflow-hidden">
              {selectedSpot.scenes && selectedSpot.scenes.length > 0 && selectedSpot.scenes[0].image_url ? (
                <img 
                  src={selectedSpot.scenes[0].image_url} 
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2 bg-zinc-900">
                  <Film size={40} className="opacity-20 animate-pulse" />
                  <span className="text-xs font-light">스틸컷 준비 중</span>
                </div>
              )}
              {selectedSpot.scenes && selectedSpot.scenes.length > 0 && (
                <Link
                  href={`/movie/${selectedSpot.scenes[0].movies.id}`}
                  className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-full text-[10px] font-bold text-antique-ivory border border-white/10 hover:bg-antique-ivory hover:text-black transition-all flex items-center gap-1"
                >
                  <Film size={10} />
                  {selectedSpot.scenes[0].movies.title}
                </Link>
              )}
            </div>

            {/* Content Details */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${selectedSpot.is_cafe ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {selectedSpot.is_cafe ? '감성 카페' : '촬영지'}
                    </span>
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
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <Link 
                  href={`/spot/${selectedSpot.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-3 bg-antique-ivory text-black rounded-xl text-xs font-bold hover:bg-white transition-all active:scale-95 shadow-lg"
                >
                  명장면 상세 정보
                  <ExternalLink size={12} />
                </Link>
                
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={`https://map.kakao.com/link/to/${encodeURIComponent(selectedSpot.name)},${selectedSpot.lat},${selectedSpot.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-2.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-300 rounded-xl transition-all"
                  >
                    <Compass size={12} />
                    카카오 길찾기
                  </a>
                  <a 
                    href={`https://map.naver.com/v5/search/${encodeURIComponent(selectedSpot.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-2.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-300 rounded-xl transition-all"
                  >
                    <Compass size={12} />
                    네이버 길찾기
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Search & List Screen */
          <div className="flex flex-col h-full">
            {/* Search Input Box */}
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
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Movie Filter Badge */}
              {movieIdParam && filterMovieTitle && (
                <div className="flex items-center justify-between px-3 py-2 bg-antique-ivory/10 border border-antique-ivory/20 rounded-xl text-xs">
                  <span className="text-antique-ivory/80 font-medium truncate">
                    🎬 {filterMovieTitle} 촬영지
                  </span>
                  <button onClick={clearMovieFilter} className="text-antique-ivory/60 hover:text-white p-0.5">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Spot Cards List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
                  <div className="animate-spin w-5 h-5 border-2 border-antique-ivory border-t-transparent rounded-full" />
                  <span className="text-[11px] font-light">장소 데이터를 불러오는 중...</span>
                </div>
              ) : filteredSpots.length > 0 ? (
                filteredSpots.map(spot => {
                  const isBookmarked = bookmarkedSpotIds.has(spot.id);
                  const movieTitle = spot.scenes?.[0]?.movies?.title;
                  
                  return (
                    <div 
                      key={spot.id}
                      onClick={() => handleMarkerClick(spot)}
                      className="p-4 hover:bg-white/5 transition-all duration-200 cursor-pointer group flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${spot.is_cafe ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <h3 className="font-bold text-sm text-zinc-200 group-hover:text-antique-ivory transition-colors truncate">
                            {spot.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate font-light">{spot.address}</p>
                        {movieTitle && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-zinc-300 font-medium">
                            <Film size={8} />
                            {movieTitle}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => toggleBookmark(spot.id, e)}
                          className={`p-1.5 rounded-full border transition-all ${
                            isBookmarked 
                              ? 'bg-antique-ivory border-antique-ivory text-black' 
                              : 'border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <Bookmark size={12} fill={isBookmarked ? "currentColor" : "none"} />
                        </button>
                        <ChevronRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs font-light">
                  검색 결과와 일치하는 장소가 없습니다.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM SHEET (MOBILE) ── */}
      {selectedSpot ? (
        <div className="fixed bottom-0 left-0 right-0 h-[45vh] bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl z-[1000] flex flex-col overflow-hidden md:hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
          {/* Drag Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3" />

          {/* Quick Header */}
          <div className="px-5 pb-3 border-b border-white/5 flex items-center justify-between">
            <button 
              onClick={() => setSelectedSpot(null)}
              className="flex items-center gap-1 text-antique-ivory/60 hover:text-white text-xs font-medium"
            >
              <ChevronLeft size={16} />
              목록으로
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => toggleBookmark(selectedSpot.id, e)}
                className={`p-1.5 rounded-full border transition-all ${
                  bookmarkedSpotIds.has(selectedSpot.id)
                    ? 'bg-antique-ivory border-antique-ivory text-black' 
                    : 'border-white/10 text-antique-ivory/80'
                }`}
              >
                <Bookmark size={14} fill={bookmarkedSpotIds.has(selectedSpot.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Scrollable details */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-24 bg-zinc-800 rounded-xl border border-white/10 overflow-hidden shrink-0">
                {selectedSpot.scenes && selectedSpot.scenes.length > 0 && selectedSpot.scenes[0].image_url ? (
                  <img 
                    src={selectedSpot.scenes[0].image_url} 
                    alt={selectedSpot.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 bg-zinc-900">
                    <Film size={20} />
                  </div>
                )}
              </div>

              {/* Title Info */}
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedSpot.is_cafe ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    {selectedSpot.is_cafe ? '감성 카페' : '촬영지'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-antique-ivory truncate">{selectedSpot.name}</h2>
                <p className="text-[11px] text-zinc-400 truncate font-light">{selectedSpot.address}</p>
                {selectedSpot.scenes && selectedSpot.scenes.length > 0 && (
                  <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] text-zinc-300 font-medium">
                    🎬 {selectedSpot.scenes[0].movies.title}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {selectedSpot.scenes && selectedSpot.scenes.length > 0 && selectedSpot.scenes[0].description && (
              <p className="text-xs text-zinc-300 leading-relaxed italic bg-white/5 border border-white/5 rounded-xl p-3 font-light">
                &ldquo;{selectedSpot.scenes[0].description}&rdquo;
              </p>
            )}

            {/* CTA Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Link 
                href={`/spot/${selectedSpot.id}`}
                className="flex items-center justify-center col-span-1 py-3.5 bg-antique-ivory text-black rounded-xl text-[10px] font-bold text-center active:scale-95 shadow-md"
              >
                명장면 상세
              </Link>
              <a 
                href={`https://map.kakao.com/link/to/${encodeURIComponent(selectedSpot.name)},${selectedSpot.lat},${selectedSpot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 py-3.5 bg-zinc-900 border border-white/10 text-[10px] font-bold text-zinc-300 rounded-xl text-center"
              >
                <Compass size={10} />
                카카오 길찾기
              </a>
              <a 
                href={`https://map.naver.com/v5/search/${encodeURIComponent(selectedSpot.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 py-3.5 bg-zinc-900 border border-white/10 text-[10px] font-bold text-zinc-300 rounded-xl text-center"
              >
                <Compass size={10} />
                네이버 길찾기
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Search Drawer (collapsible / floating trigger or compact top bar) */
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
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {movieIdParam && filterMovieTitle && (
            <div className="flex items-center justify-between px-2.5 py-1 bg-antique-ivory/10 border border-antique-ivory/20 rounded-lg text-[10px]">
              <span className="text-antique-ivory/80 truncate">
                🎬 {filterMovieTitle} 촬영지 필터
              </span>
              <button onClick={clearMovieFilter} className="text-antique-ivory/60 hover:text-white">
                <X size={10} />
              </button>
            </div>
          )}
          
          {/* Scrollable Mini List if searchQuery exists */}
          {searchQuery && (
            <div className="max-h-[25vh] overflow-y-auto divide-y divide-white/5 pt-1">
              {filteredSpots.length > 0 ? (
                filteredSpots.map(spot => (
                  <div 
                    key={spot.id}
                    onClick={() => handleMarkerClick(spot)}
                    className="py-2.5 flex items-center justify-between text-xs cursor-pointer active:bg-white/5"
                  >
                    <div className="truncate pr-4 flex-1">
                      <p className="font-bold text-zinc-200 truncate">{spot.name}</p>
                      <p className="text-[9px] text-zinc-400 truncate">{spot.address}</p>
                    </div>
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
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        
        {filteredSpots.map(spot => {
          const isSelected = selectedSpot?.id === spot.id;
          
          return (
            <Marker
              key={spot.id}
              latitude={spot.lat}
              longitude={spot.lng}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(spot);
              }}
            >
              <div className="cursor-pointer group relative">
                {/* Visual Glow for selected markers */}
                {isSelected && (
                  <div className="absolute inset-0 bg-antique-ivory/30 rounded-full blur-md scale-150 animate-pulse" />
                )}
                
                <MapPin 
                  className={`transition-all duration-300 ${
                    isSelected 
                      ? 'text-red-500 scale-125 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' 
                      : spot.is_cafe 
                        ? 'text-amber-400 group-hover:scale-110' 
                        : 'text-antique-ivory group-hover:scale-110'
                  }`} 
                  size={isSelected ? 36 : 32} 
                  fill="currentColor" 
                  fillOpacity={isSelected ? 0.3 : 0.2}
                />
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
