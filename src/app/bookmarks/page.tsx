'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getSpotsLite } from '@/lib/data';
import { getBookmarkIds, subscribeBookmarks } from '@/lib/bookmarks';
import { getVisitedIds, subscribeVisited } from '@/lib/visited';
import { getCourses, deleteCourse, encodeCourse, subscribeCourses, type Course } from '@/lib/courses';
import { ChevronLeft, Bookmark, MapPin, Film, Compass, Check, Route, Share2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import { SpotCardSkeleton } from '@/components/Skeleton';

interface SpotItem {
  id: string;
  name: string;
  address: string;
  is_cafe: boolean;
}

type Tab = 'saved' | 'visited' | 'courses';

export default function BookmarksPage() {
  const [tab, setTab] = useState<Tab>('saved');
  const [spotMap, setSpotMap] = useState<Record<string, SpotItem>>({});
  const [loading, setLoading] = useState(true);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getSpotsLite();
      const map: Record<string, SpotItem> = {};
      data.forEach((s) => (map[s.id] = s));
      setSpotMap(map);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const syncB = () => setBookmarkIds(getBookmarkIds());
    const syncV = () => setVisitedIds(getVisitedIds());
    const syncC = () => setCourses(getCourses());
    syncB(); syncV(); syncC();
    const ub = subscribeBookmarks(syncB);
    const uv = subscribeVisited(syncV);
    const uc = subscribeCourses(syncC);
    return () => { ub(); uv(); uc(); };
  }, []);

  const savedSpots = useMemo(() => bookmarkIds.map((id) => spotMap[id]).filter(Boolean), [bookmarkIds, spotMap]);
  const visitedSpots = useMemo(() => visitedIds.map((id) => spotMap[id]).filter(Boolean), [visitedIds, spotMap]);

  const share = useCallback((course: Course) => {
    const token = encodeCourse({ name: course.name, spotIds: course.spotIds });
    const url = `${window.location.origin}/map?course=${token}`;
    navigator.clipboard.writeText(url);
    setToast('코스 링크가 복사되었습니다!');
    setTimeout(() => setToast(''), 2000);
  }, []);

  const renderSpotGrid = (spots: SpotItem[], emptyTitle: string) =>
    spots.length === 0 ? (
      <EmptyState icon={Film} title={emptyTitle} action={{ label: '지도에서 새로운 장소를 찾아보세요', href: '/map' }} />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {spots.map((spot) => (
          <div key={spot.id} className="group p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-antique-ivory/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-full ${spot.is_cafe ? 'bg-amber-400/10 text-amber-400' : 'bg-antique-ivory/10 text-antique-ivory'}`}>
                  <MapPin size={24} />
                </div>
                <Bookmark size={20} className="text-antique-ivory" fill="currentColor" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-antique-ivory">{spot.name}</h3>
                <p className="text-sm text-antique-ivory/40 line-clamp-1">{spot.address}</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
              <Link href={`/spot/${spot.id}`} className="text-xs text-antique-ivory/50 hover:text-antique-ivory hover:underline transition-colors">
                상세 보기 &rarr;
              </Link>
              <Link href={`/map?spot_id=${spot.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-antique-ivory hover:text-black rounded-xl text-xs font-semibold text-antique-ivory/80 transition-all">
                <Compass size={12} /> 지도로 보기
              </Link>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-5 py-3.5 bg-zinc-900 border border-white/10 text-antique-ivory text-xs font-semibold rounded-full shadow-2xl">
          🔗 {toast}
        </div>
      )}
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={28} className="text-antique-ivory" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-antique-ivory tracking-tight">내 보관함</h1>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10">
          {([['saved', '찜한 곳', Bookmark, savedSpots.length], ['visited', '가본 곳', Check, visitedSpots.length], ['courses', '내 코스', Route, courses.length]] as [Tab, string, typeof Bookmark, number][]).map(
            ([id, label, Icon, count]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${
                  tab === id ? 'border-antique-ivory text-antique-ivory' : 'border-transparent text-antique-ivory/40 hover:text-antique-ivory/70'
                }`}
              >
                <Icon size={15} /> {label} <span className="text-xs opacity-60">{count}</span>
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpotCardSkeleton />
            <SpotCardSkeleton />
          </div>
        ) : tab === 'saved' ? (
          renderSpotGrid(savedSpots, '아직 찜한 장소가 없습니다.')
        ) : tab === 'visited' ? (
          renderSpotGrid(visitedSpots, '아직 다녀온 장소가 없습니다.')
        ) : courses.length === 0 ? (
          <EmptyState icon={Route} title="아직 만든 코스가 없습니다." description="촬영지 상세나 지도에서 코스에 담아보세요." action={{ label: '지도에서 코스 만들기', href: '/map' }} />
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-antique-ivory flex items-center gap-2">
                    <Route size={18} className="text-emerald-400" /> {course.name}
                    <span className="text-xs text-antique-ivory/40 font-normal">· {course.spotIds.length}곳</span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => share(course)} className="p-2 text-antique-ivory/50 hover:text-white rounded-full hover:bg-white/5" title="공유">
                      <Share2 size={16} />
                    </button>
                    <button onClick={() => deleteCourse(course.id)} className="p-2 text-antique-ivory/50 hover:text-rose-400 rounded-full hover:bg-white/5" title="삭제">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {course.spotIds.map((sid, i) => (
                    <span key={sid} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-antique-ivory/70">
                      {i + 1}. {spotMap[sid]?.name ?? '알 수 없는 장소'}
                    </span>
                  ))}
                  {course.spotIds.length === 0 && <span className="text-xs text-antique-ivory/30">아직 담긴 장소가 없습니다.</span>}
                </div>
                {course.spotIds.length > 0 && (
                  <Link
                    href={`/map?course=${encodeCourse({ name: course.name, spotIds: course.spotIds })}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all"
                  >
                    <Compass size={12} /> 지도에서 투어 보기
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
