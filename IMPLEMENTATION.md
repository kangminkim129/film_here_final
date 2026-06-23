# FilmHere 구현 보고서 (기능 60 + 보안)

> 작성일: 2026-06-23
> 범위: `FEATURE_IMPROVEMENTS.md`의 사용성 60개 전부 + `sentinel` 보안 점검 코드 적용분
> 인증/계정은 요청에 따라 제외(찜·코스·리뷰·가본곳은 **로그인 없이 localStorage**로 동작)

상태 표기: ✅ 구현 · ◐ 구현했으나 **데이터 컬럼 필요**(있으면 자동 표시, `supabase/schema_extend.sql`) · 🌐 localStorage 기반

---

## 1. 현장 방문 동선
| # | 기능 | 상태 | 위치 |
|---|------|------|------|
| 1 | 현재 위치 + 추적 | ✅ | `MapComponent` 위치 버튼/마커 |
| 2 | 내 주변 촬영지 | ✅ | 지도 "내 주변" 토글 + 반경(1/3/5/10km), 홈 `?near=1` 진입 |
| 3 | 외부 길찾기(카카오/네이버/구글) | ✅ | `lib/directions.ts`, 지도·상세 |
| 4 | 대중교통 소요/경로 | ✅ | 상세 "대중교통"(구글 transit) |
| 5 | 로드뷰 연동 | ✅ | 카카오 로드뷰 링크(지도·상세) |
| 6 | 주변 편의 | ◐ | (구글 길찾기로 주변 탐색 대체, 데이터화는 후속) |
| 7 | 주소·좌표 공유 강화 | ✅ | 상세 링크 복사 + 코스 공유 |

## 2. 검색·탐색
| # | 기능 | 상태 | 위치 |
|---|------|------|------|
| 8 | 통합 검색 | ✅ | `/search` (작품+촬영지 한 입구) |
| 9 | 자동완성/추천 | ✅ | `/search` 입력 시 추천 드롭다운 |
| 10 | 초성·오타·동의어 | ✅ | `lib/korean.ts` koMatch(초성 매칭) 전 검색 적용 |
| 11 | 결과 0건 대체 제안 | ✅ | `EmptyState` suggestions(인기검색 칩) |
| 12 | 필터(타입/카페) | ✅ | `/search` 탭 + 카페만, 지도 찜만 |
| 13 | 정렬(거리순 등) | ✅ | 지도 리스트 거리순(위치 시), 검색 관련도 |
| 14 | 최근/인기 검색 | 🌐 | `lib/recentSearches.ts`, `/search` |
| 15 | 지도-목록 동기화 | ✅ | 검색/필터 시 리스트=마커 동일 소스 |
| 16 | 공유 딥링크 | ✅ | `/map?spot_id=`, `/map?course=`, `/search?q=` |

## 3. 지도 경험
| # | 기능 | 상태 | 위치 |
|---|------|------|------|
| 17 | 마커 클러스터링 | ✅ | 줌 연동 그리드 클러스터 + 클릭 확대 |
| 18 | 부드러운 카메라 이동 | ✅ | `flyTo`(ref) 적용 |
| 19 | 모바일 하단 카드 | ✅ | 바텀시트 + 검색 드로어 |
| 20 | 마커 포스터 썸네일 | ✅ | 줌≥13 시 썸네일 마커 |
| 21 | 지도 스타일 토글 | ✅ | 다크/밝게/위성 |
| 22 | 코스 라인 표시 | ✅ | `?course=` 진입 시 동선 라인(Source/Layer) |
| 23 | 카페/명소 마커 구분 | ✅ | 색상 + 방문 시 emerald |
| 24 | 반경 검색 | ✅ | 내 주변 반경 선택 |

## 4. 촬영지 상세
| # | 기능 | 상태 | 위치 |
|---|------|------|------|
| 25 | 명장면 갤러리 | ✅ | 다중 scene 갤러리 |
| 26 | then/now 비교 | ◐ | `scenes.real_image_url` 있으면 토글 |
| 27 | 영업/입장/예약 | ◐ | `spots.hours/fee/closed_day/reservation_url` |
| 28 | 방문 팁 | ◐ | `spots.tips` |
| 29 | 인근 다른 촬영지 | ✅ | 거리순 상위 4 자동 |
| 30 | 폐업/이전 상태 뱃지 | ◐ | `spots.status` |
| 31 | 영상 임베드 | ◐ | `scenes.video_url` 있으면 iframe |
| 32 | 접근성 정보 | ◐ | `spots.accessibility` |

## 5. 작품 경험
| # | 기능 | 상태 | 위치 |
|---|------|------|------|
| 33 | 작품 메타(시놉/감독/출연/장르) | ◐ | `movies.synopsis/director/cast/genre` |
| 34 | 작품 촬영지 지도 | ✅ | "촬영지 전체 지도" |
| 35 | OTT 바로보기 | ◐ | `movies.platform/ott_url` |
| 36 | 작품 투어 코스 자동 | ✅ | "이 작품 따라 걷기" → `/map?course=` |
| 37 | 장르/무드 컬렉션 | ✅ | 홈 큐레이션 칩 → `/search?q=` |
| 38 | 배우별 | ◐ | 출연 칩(데이터 시), 검색 연동 |
| 39 | 신작 큐레이션 배너 | ✅ | 홈 큐레이션 영역 |

## 6. 찜·코스 (🌐 전부 localStorage)
| # | 기능 | 상태 | 위치 |
|---|------|------|------|
| 40 | 가본 곳/가보고 싶은 곳 | 🌐 | `lib/visited.ts`, 상세·지도·보관함 |
| 41 | 찜 지도 표시 | ✅ | 지도 "찜만" + 마커 뱃지 |
| 42 | 나만의 코스 | 🌐 | `lib/courses.ts`, `AddToCourseButton` |
| 43 | 코스 동선 최적화 | ✅ | `geo.nearestNeighborOrder` |
| 44 | 폴더/리스트 분류 | 🌐 | 코스 = 분류 단위 |
| 45 | 코스 공유/복제 | ✅ | base64 토큰 `/map?course=`, 보관함 공유 |
| 46 | 체크인/스탬프 | 🌐 | 가본 곳 체크 = 스탬프(보관함 탭) |
| 47 | 최근 본 히스토리 | 🌐 | `lib/recent.ts` |

## 7. 리뷰·UGC (🌐 localStorage)
| # | 기능 | 상태 | 위치 |
|---|------|------|------|
| 48 | 리뷰/별점 | 🌐 | `lib/reviews.ts`, 상세 |
| 49 | 방문 사진(포토로그) | 🌐 | 리뷰 사진 첨부(dataURL) |
| 50 | 좋아요/저장 수 | 🌐 | 상세 하트 토글 |
| 51 | 촬영지 제보 | 🌐 | `/report` (localStorage + mailto) |

## 8. 기본기·반응성
| # | 기능 | 상태 | 위치 |
|---|------|------|------|
| 52 | 로딩 스켈레톤/에러 바운더리 | ✅ | `Skeleton`, `app/error.tsx`, `loading.tsx`, `global-error.tsx` |
| 53 | 키 미설정 graceful | ✅ | `lib/supabase.ts`, 지도 안내 패널 |
| 54 | 이미지 최적화 | ✅ | `<img>`→`next/image`, remotePatterns `**` |
| 55 | 마커 좌표 정확도 | ◐ | 좌표 기반 렌더(지오코딩 검증은 운영 데이터 영역) |
| 56 | 전환/애니메이션 | ✅ | framer-motion(홈), flyTo, transition |
| 57 | 빈 상태 디자인 | ✅ | `EmptyState` 전 페이지 |
| 58 | 접근성 | ◐/✅ | aria-label(별점/언어/위치), 시맨틱 — 추가 개선 여지 |
| 59 | PWA | ✅ | `manifest.webmanifest`, `sw.js`, `PWARegister`, 메타 |
| 60 | 다국어(ko/en/ja/zh) | ✅ | `lib/i18n`, 언어 스위처(홈), 핵심 문자열 |

---

## 9. 보안 (sentinel 점검 → 코드 적용)
| 항목 | 적용 | 위치 |
|------|------|------|
| CSP 헤더 | ✅ | `next.config.ts` (Mapbox/Supabase 허용) |
| 클릭재킹(X-Frame-Options/frame-ancestors) | ✅ | DENY + CSP |
| X-Content-Type-Options nosniff | ✅ | next.config |
| Referrer-Policy | ✅ | strict-origin-when-cross-origin |
| Permissions-Policy | ✅ | geolocation=self, camera/mic 차단 |
| HSTS | ✅ | max-age 1y; preload |
| COOP / CORP / Origin-Agent-Cluster | ✅ | next.config |
| 서버 지문 제거(X-Powered-By) | ✅ | `poweredByHeader:false` |
| security.txt / robots.txt / llms.txt | ✅ | `public/.well-known/security.txt` 등 |
| 노출 비밀(test-supabase.js) | ✅ | 파일 제거(이전 단계) |
| 입력/출력(React 자동 이스케이프, dataURL 크기 제한) | ✅ | 리뷰 사진 2MB 제한 |

### 코드로 해결 불가(인프라/도메인 — Vercel·DNS 영역, 문서로 안내)
- SPF/DMARC/CAA/DNSSEC, DHE/Logjam·TLS 스위트, NS 위임, 와일드카드 DNS, SCT → **도메인/Vercel 설정**
- `/admin`,`/wp-admin`,`/phpmyadmin`,`/upload*`,`/login` 등 "노출 경로" → 본 앱에 **존재하지 않는 경로**(Vercel SPA가 200/403 반환하는 **오탐**). 실제 관리자/업로드 엔드포인트 없음
- 레이트리밋/봇 매니지먼트 → Vercel WAF/Edge 설정 영역
- 노출됐던 anon/Mapbox 키: **public 전제 키**지만 권장 조치 = Supabase RLS 적용(`schema_extend.sql`) + Mapbox 토큰 URL 제한

---

## 10. 검증
- `tsc --noEmit` ✅ · `next build` ✅ (10 라우트) · 전 라우트 200 · 보안 헤더 응답 확인
- 데이터 표시는 Supabase에 데이터 + `schema_extend.sql`(RLS 읽기 허용) 적용 필요
