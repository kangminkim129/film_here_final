// 공용 데이터 타입. 기본 컬럼 + 데이터가 추가되면 자동 노출되는 선택 컬럼(graceful).
// 선택 컬럼은 supabase/schema_extend.sql 로 추가 가능하며, 없으면 UI에서 자동으로 숨겨진다.

export interface MovieRef {
  id: string;
  title: string;
  poster_url?: string | null;
  release_year?: number | null;
}

export interface SceneInfo {
  id?: string;
  image_url: string | null;
  description: string | null;
  // then/now 비교용 실제 현장 사진(선택)
  real_image_url?: string | null;
  // 장면 영상 임베드 URL(선택)
  video_url?: string | null;
  movies: MovieRef;
}

export interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_cafe: boolean;
  // ── 선택(데이터 있으면 표시) ──
  category?: string | null; // 'cafe' | 'restaurant' | 'landmark' | 'nature' ...
  hours?: string | null; // 영업시간
  closed_day?: string | null; // 휴무
  fee?: string | null; // 입장료
  reservation_url?: string | null; // 예약 링크
  tips?: string | null; // 방문 팁
  accessibility?: string | null; // 접근성 정보
  status?: 'open' | 'closed' | 'moved' | null; // 운영 상태
  thumbnail_url?: string | null;
  scenes?: SceneInfo[];
}

export interface Movie {
  id: string;
  title: string;
  poster_url?: string | null;
  release_year?: number | null;
  // ── 선택 ──
  synopsis?: string | null;
  director?: string | null;
  cast?: string | null; // 콤마 구분
  genre?: string | null;
  platform?: string | null; // 'netflix' | 'tving' | 'disney' ...
  ott_url?: string | null;
}

export type Coord = { lat: number; lng: number };
