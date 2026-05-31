# Supabase Setup Guide for FilmHere

Supabase 대시보드의 **SQL Editor**에 아래 코드를 복사해서 붙여넣고 실행(Run)해 주세요. 
이 스크립트는 서비스에 필요한 모든 테이블과 관계를 자동으로 생성합니다.

```sql
-- 1. Spots 테이블 (촬영지 및 카페 정보)
CREATE TABLE spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_cafe BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Movies 테이블 (영화/드라마 작품 정보)
CREATE TABLE movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  poster_url TEXT,
  release_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Scenes 테이블 (작품과 장소를 잇는 상세 정보)
CREATE TABLE scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  image_url TEXT, -- 명장면 스틸컷
  description TEXT, -- 장면에 대한 설명 (예: "주인공이 고백하던 그 장소")
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bookmarks 테이블 (유저 찜 목록)
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid(), -- Supabase Auth 연동용
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, spot_id)
);

-- 테스트용 데이터 (Seed Data) - 필요 시 아래 주석을 해제하고 실행하세요.
/*
INSERT INTO movies (title, release_year) VALUES ('괴물', 2006), ('이태원 클라쓰', 2020);

INSERT INTO spots (name, lat, lng, is_cafe) VALUES 
('한강대교', 37.5175, 126.9592, false),
('이태원 단밤', 37.5345, 126.9873, true);

-- 장소와 영화 연결
INSERT INTO scenes (movie_id, spot_id, description) 
SELECT m.id, s.id, '강두가 괴물과 사투를 벌이던 장소' 
FROM movies m, spots s 
WHERE m.title = '괴물' AND s.name = '한강대교';
*/
```

## 환경 변수 설정
프로젝트 루트 디렉토리에 `.env.local` 파일을 만들고 아래 내용을 채워주세요 (Supabase Settings -> API에서 확인 가능).

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```
