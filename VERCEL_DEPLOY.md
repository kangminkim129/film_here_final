# Vercel 배포 가이드 & 기능 작동 정리

> 작성일: 2026-06-23
> 목적: Vercel 배포 기준으로 **작동하는 기능 / 안 되던 기능(수정·제거)**을 정리

---

## 1. 작동 여부 판정 결과

### ✅ Vercel에서 정상 작동 (빌드 통과 확인)
- 모든 라우트가 `next build` 성공 + HTTP 200:
  `/`, `/map`, `/bookmarks`, `/movie/[id]`, `/spot/[id]`, `/search/movie`, `/search/location`
- 촬영지/작품/장면 **데이터 조회** (Supabase `spots`/`movies`/`scenes`) — *키·테이블·RLS 충족 시*
- **지도 렌더링** (Mapbox) — 유효 토큰 시 (없으면 안내 패널로 graceful 처리)
- **카카오/네이버 길찾기** (외부 링크, 키 불필요)
- **링크 복사/공유** (클립보드)

### 🔧 안 되던 것 → 작동하도록 수정
| 기능 | 문제 | 조치 |
|------|------|------|
| **찜(북마크)** | `bookmarks` 테이블이 `auth.uid()`에 의존하는데 앱에 **로그인이 없음** → 익명 insert는 `user_id=null`, 조회 시 사용자 구분 없이 **모든 사용자의 찜이 전역 공유**되어 사실상 깨짐 | **localStorage 기반으로 전환** (로그인 불필요, Vercel에서 그대로 동작). `src/lib/bookmarks.ts` 신설 후 지도·상세·찜목록 페이지 모두 적용 |

### 🗑️ 제거한 것
| 항목 | 이유 |
|------|------|
| `test-supabase.js` | 앱에서 쓰지 않는 죽은 테스트 스크립트 + **하드코딩된 키가 그대로 노출**되어 있어 삭제 |

### 🛡️ 방어 처리
- `src/lib/supabase.ts`: 환경변수 미설정 시에도 **모듈 로드 크래시 방지** (경고 로그 후 placeholder로 안전 생성)
- `src/components/MapComponent.tsx`: Mapbox 토큰 미설정/placeholder 시 지도 대신 안내 패널 렌더 (이전 단계에서 적용)

---

## 2. Vercel 배포 절차

1. GitHub 저장소를 Vercel에 **Import** (프레임워크: Next.js 자동 감지)
2. **Environment Variables** 등록 (Settings → Environment Variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
   ```
   > `.env.local`은 `.gitignore`로 배포되지 않으므로 **반드시 Vercel 대시보드에 별도 입력**해야 함.
3. **Deploy** (빌드 명령 `next build`, 출력 자동)

---

## 3. 배포 전 체크리스트 (데이터가 떠야 완성)

이 코드는 배포되지만, **데이터가 보이려면** 아래가 충족돼야 합니다:

- [ ] Supabase에 `SUPABASE_SETUP.md`의 테이블(`spots`/`movies`/`scenes`)이 생성돼 있는가
- [ ] 각 테이블에 실제 데이터가 들어 있는가 (비어 있으면 지도에 마커 0개)
- [ ] **RLS(행 수준 보안)** — `spots`/`movies`/`scenes`에 익명 **읽기 허용** 정책이 있는가
      (현재 `SUPABASE_SETUP.md`에 RLS 정책이 없어, RLS가 켜져 있으면 anon 조회가 막힐 수 있음)
- [ ] Mapbox 토큰이 `pk.`로 시작하는 유효 토큰인가

> 참고: 본 작업 환경은 외부 네트워크가 차단되어 라이브 Supabase 응답을 직접 검증하지 못했습니다.
> 위 4가지는 Vercel/실 사용 환경에서 최종 확인이 필요합니다.

---

## 4. 권장 후속 (선택)
- `bookmarks` 테이블은 현재 미사용 → 추후 로그인 도입 시 재활용하거나 정리
- 노출됐던 anon 키는 공개용(브라우저 노출 전제)이지만, **RLS로 쓰기 보호**를 반드시 설정 권장
- `FEATURE_IMPROVEMENTS.md` / `COMPETITIVE_ANALYSIS.md` 의 사용성·경쟁 기능 로드맵 참고
