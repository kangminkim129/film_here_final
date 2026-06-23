// 데이터 접근 계층: Supabase를 우선 시도하고, 비어있거나 실패하면 시드(seed.ts)로 폴백.
// 덕분에 Supabase 미설정/RLS 차단/데이터 없음 상황에서도 지도·검색·상세가 그대로 동작한다.
import { supabase } from './supabase';
import {
  seedMovies,
  seedSpotsWithScenes,
  seedSpotById,
  seedScenesBySpot,
  seedMovieById,
  seedScenesByMovie,
} from './seed';
import type { Movie, Spot, SceneInfo } from './types';

const nonEmpty = (arr: unknown): arr is unknown[] => Array.isArray(arr) && arr.length > 0;

export async function getSpotsWithScenes(): Promise<Spot[]> {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select(`*, scenes ( image_url, description, movies ( id, title ) )`);
    if (!error && nonEmpty(data)) return data as unknown as Spot[];
  } catch {
    /* fall through */
  }
  return seedSpotsWithScenes();
}

export async function getMovies(): Promise<Movie[]> {
  try {
    const { data, error } = await supabase.from('movies').select('*').order('title');
    if (!error && nonEmpty(data)) return data as Movie[];
  } catch {
    /* fall through */
  }
  return seedMovies();
}

export async function getSpotById(id: string): Promise<Spot | null> {
  try {
    const { data, error } = await supabase.from('spots').select('*').eq('id', id).single();
    if (!error && data) return data as Spot;
  } catch {
    /* fall through */
  }
  return seedSpotById(id);
}

export async function getScenesBySpot(id: string): Promise<SceneInfo[]> {
  try {
    const { data, error } = await supabase
      .from('scenes')
      .select(`id, image_url, real_image_url, video_url, description, movies ( id, title )`)
      .eq('spot_id', id);
    if (!error && nonEmpty(data)) return data as unknown as SceneInfo[];
    if (!error && Array.isArray(data)) {
      // 컬럼은 있으나 결과가 0건 → 시드 폴백(시드 id일 때만 매칭)
      const seeded = seedScenesBySpot(id);
      if (seeded.length) return seeded;
      return [];
    }
  } catch {
    /* fall through */
  }
  // real_image_url/video_url 컬럼 부재 등 에러 → 기본 컬럼 재시도 후 시드
  try {
    const { data, error } = await supabase
      .from('scenes')
      .select(`id, image_url, description, movies ( id, title )`)
      .eq('spot_id', id);
    if (!error && nonEmpty(data)) return data as unknown as SceneInfo[];
  } catch {
    /* fall through */
  }
  return seedScenesBySpot(id);
}

export async function getMovieById(id: string): Promise<Movie | null> {
  try {
    const { data, error } = await supabase.from('movies').select('*').eq('id', id).single();
    if (!error && data) return data as Movie;
  } catch {
    /* fall through */
  }
  return seedMovieById(id);
}

export interface MovieScene {
  id: string;
  image_url: string | null;
  description: string | null;
  spots: { id: string; name: string; address: string; lat: number; lng: number } | null;
}

export async function getScenesByMovie(id: string): Promise<MovieScene[]> {
  try {
    const { data, error } = await supabase
      .from('scenes')
      .select(`id, image_url, description, spots ( id, name, address, lat, lng )`)
      .eq('movie_id', id);
    if (!error && nonEmpty(data)) return data as unknown as MovieScene[];
  } catch {
    /* fall through */
  }
  return seedScenesByMovie(id) as MovieScene[];
}

// 라이트 목록(찜/가본곳/코스에서 id→정보 매핑용)
export async function getSpotsLite(): Promise<Pick<Spot, 'id' | 'name' | 'address' | 'is_cafe'>[]> {
  const spots = await getSpotsWithScenes();
  return spots.map((s) => ({ id: s.id, name: s.name, address: s.address, is_cafe: s.is_cafe }));
}
