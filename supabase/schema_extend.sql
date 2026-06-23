-- ─────────────────────────────────────────────────────────────
-- FilmHere 스키마 확장 (선택 컬럼)
-- 신규 UX 기능 중 "데이터가 있으면 표시"되는 항목을 위한 컬럼.
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- 모든 컬럼은 NULL 허용이라 기존 데이터/기능을 깨지 않습니다.
-- ─────────────────────────────────────────────────────────────

-- spots: 방문정보 / 상태 / 카테고리 / 썸네일
ALTER TABLE spots ADD COLUMN IF NOT EXISTS category        TEXT;     -- 'cafe' | 'restaurant' | 'landmark' | 'nature' ...
ALTER TABLE spots ADD COLUMN IF NOT EXISTS hours           TEXT;     -- 영업시간
ALTER TABLE spots ADD COLUMN IF NOT EXISTS closed_day      TEXT;     -- 휴무
ALTER TABLE spots ADD COLUMN IF NOT EXISTS fee             TEXT;     -- 입장료
ALTER TABLE spots ADD COLUMN IF NOT EXISTS reservation_url TEXT;     -- 예약 링크
ALTER TABLE spots ADD COLUMN IF NOT EXISTS tips            TEXT;     -- 방문 팁
ALTER TABLE spots ADD COLUMN IF NOT EXISTS accessibility   TEXT;     -- 접근성 정보
ALTER TABLE spots ADD COLUMN IF NOT EXISTS status          TEXT;     -- 'open' | 'closed' | 'moved'
ALTER TABLE spots ADD COLUMN IF NOT EXISTS thumbnail_url   TEXT;     -- 마커/카드 썸네일

-- movies: 메타 정보 / OTT
ALTER TABLE movies ADD COLUMN IF NOT EXISTS synopsis  TEXT;          -- 시놉시스
ALTER TABLE movies ADD COLUMN IF NOT EXISTS director  TEXT;          -- 감독
ALTER TABLE movies ADD COLUMN IF NOT EXISTS "cast"    TEXT;          -- 출연(콤마 구분)
ALTER TABLE movies ADD COLUMN IF NOT EXISTS genre     TEXT;          -- 장르
ALTER TABLE movies ADD COLUMN IF NOT EXISTS platform  TEXT;          -- 'netflix' | 'tving' | 'disney' ...
ALTER TABLE movies ADD COLUMN IF NOT EXISTS ott_url   TEXT;          -- OTT 바로보기 링크

-- scenes: then/now 비교 + 영상 임베드
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS real_image_url TEXT;     -- 실제 현장 사진(then/now)
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS video_url      TEXT;     -- 장면 영상 임베드 URL(youtube/embed)

-- ─────────────────────────────────────────────────────────────
-- RLS: 익명(anon) 읽기 허용 — 데이터가 화면에 뜨려면 필요
-- (쓰기는 막아 두는 것을 권장. 찜/리뷰/코스는 클라이언트 localStorage로 처리됨)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE spots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read spots"  ON spots;
DROP POLICY IF EXISTS "public read movies" ON movies;
DROP POLICY IF EXISTS "public read scenes" ON scenes;

CREATE POLICY "public read spots"  ON spots  FOR SELECT USING (true);
CREATE POLICY "public read movies" ON movies FOR SELECT USING (true);
CREATE POLICY "public read scenes" ON scenes FOR SELECT USING (true);
