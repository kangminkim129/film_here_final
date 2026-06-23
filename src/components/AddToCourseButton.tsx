'use client';

import { useEffect, useState } from 'react';
import { Plus, Route, Check, X } from 'lucide-react';
import {
  getCourses,
  createCourse,
  addSpotToCourse,
  removeSpotFromCourse,
  subscribeCourses,
  type Course,
} from '@/lib/courses';

// 촬영지를 코스에 담는 버튼 + 모달. (localStorage 기반)
export default function AddToCourseButton({
  spotId,
  className = '',
  compact = false,
}: {
  spotId: string;
  className?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const sync = () => setCourses(getCourses());
    sync();
    return subscribeCourses(sync);
  }, []);

  const inCourse = (c: Course) => c.spotIds.includes(spotId);

  const toggle = (c: Course) => {
    if (inCourse(c)) removeSpotFromCourse(c.id, spotId);
    else addSpotToCourse(c.id, spotId);
  };

  const create = () => {
    const c = createCourse(newName);
    addSpotToCourse(c.id, spotId);
    setNewName('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          className ||
          `flex items-center justify-center gap-1.5 ${
            compact ? 'px-3 py-2 text-[11px]' : 'w-full py-3 text-xs'
          } bg-white/5 border border-white/10 hover:bg-white/10 text-antique-ivory rounded-xl font-semibold transition-all`
        }
      >
        <Route size={compact ? 12 : 14} />
        코스에 담기
      </button>

      {open && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6" onClick={() => setOpen(false)}>
          <div
            className="w-full md:max-w-md bg-zinc-900 border border-white/10 rounded-t-3xl md:rounded-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-antique-ivory flex items-center gap-2">
                <Route size={18} /> 코스에 담기
              </h3>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/5 rounded-full text-antique-ivory/60">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {courses.length === 0 && (
                <p className="text-xs text-antique-ivory/40 py-2">아직 만든 코스가 없어요. 아래에서 새 코스를 만들어보세요.</p>
              )}
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggle(c)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-antique-ivory transition-all"
                >
                  <span className="truncate">
                    {c.name} <span className="text-antique-ivory/40 text-xs">· {c.spotIds.length}곳</span>
                  </span>
                  {inCourse(c) ? (
                    <Check size={18} className="text-amber-400 shrink-0" />
                  ) : (
                    <Plus size={18} className="text-antique-ivory/40 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && create()}
                placeholder="새 코스 이름 (예: 성수동 드라마 투어)"
                className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-antique-ivory/50"
              />
              <button
                onClick={create}
                className="px-4 py-2.5 bg-antique-ivory text-black rounded-xl text-xs font-bold hover:bg-white transition-all active:scale-95 shrink-0"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
