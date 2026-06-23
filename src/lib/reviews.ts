// 리뷰/별점 · 방문 사진 · 좋아요. (로그인 불필요, localStorage — 단일 기기 기준)
// NOTE: 여러 기기/유저 공유가 필요하면 supabase/schema_extend.sql 의 reviews 테이블로 승격 가능.
import { readJSON, writeJSON, subscribe, uid } from './storage';

const REVIEWS_KEY = 'filmhere:reviews';
const LIKES_KEY = 'filmhere:likes';

export interface Review {
  id: string;
  spotId: string;
  rating: number; // 1~5
  text: string;
  photo?: string | null; // dataURL (사진 포토로그)
  createdAt: number;
}

type ReviewMap = Record<string, Review[]>;

function allReviews(): ReviewMap {
  const v = readJSON<ReviewMap>(REVIEWS_KEY, {});
  return v && typeof v === 'object' ? v : {};
}

export function getReviews(spotId: string): Review[] {
  return (allReviews()[spotId] || []).slice().sort((a, b) => b.createdAt - a.createdAt);
}

export function addReview(input: { spotId: string; rating: number; text: string; photo?: string | null }): Review {
  const review: Review = {
    id: uid(),
    spotId: input.spotId,
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    text: input.text.trim(),
    photo: input.photo || null,
    createdAt: Date.now(),
  };
  const map = allReviews();
  map[input.spotId] = [...(map[input.spotId] || []), review];
  writeJSON(REVIEWS_KEY, map);
  return review;
}

export function deleteReview(spotId: string, reviewId: string): void {
  const map = allReviews();
  map[spotId] = (map[spotId] || []).filter((r) => r.id !== reviewId);
  writeJSON(REVIEWS_KEY, map);
}

export function getRatingSummary(spotId: string): { avg: number; count: number } {
  const list = allReviews()[spotId] || [];
  if (!list.length) return { avg: 0, count: 0 };
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { avg: Math.round(avg * 10) / 10, count: list.length };
}

// ── 좋아요 ──
export function getLikedIds(): string[] {
  const v = readJSON<string[]>(LIKES_KEY, []);
  return Array.isArray(v) ? v : [];
}
export function isLiked(spotId: string): boolean {
  return getLikedIds().includes(spotId);
}
export function toggleLike(spotId: string): boolean {
  const set = new Set(getLikedIds());
  let liked: boolean;
  if (set.has(spotId)) {
    set.delete(spotId);
    liked = false;
  } else {
    set.add(spotId);
    liked = true;
  }
  writeJSON(LIKES_KEY, [...set]);
  return liked;
}

export function subscribeReviews(cb: () => void) {
  const a = subscribe(REVIEWS_KEY, cb);
  const b = subscribe(LIKES_KEY, cb);
  return () => {
    a();
    b();
  };
}
