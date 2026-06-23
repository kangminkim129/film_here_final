// 큐레이션 시드 데이터 (서울 K-콘텐츠 촬영지 20).
// 원본 데이터에 좌표가 없어 서울 실제 위치를 lat/lng로 보정해 넣었다.
// 용도: Supabase가 비어있거나(미설정/RLS 차단/네트워크) 데이터가 없을 때 앱이 그대로 동작하도록 하는 폴백.
//      실제 DB로 운영하려면 supabase/seed.sql 을 적용하면 된다.
import type { Movie, Spot, SceneInfo } from './types';

interface SeedMovie {
  id: string;
  title: string;
  type: string; // 드라마 | 영화
  release_year: number;
}

interface SeedSpot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  movieId: string;
  scene: string;
}

export const SEED_MOVIES: SeedMovie[] = [
  { id: 'mv-vincenzo', title: '빈센조', type: '드라마', release_year: 2021 },
  { id: 'mv-itaewon', title: '이태원 클라쓰', type: '드라마', release_year: 2020 },
  { id: 'mv-chaebol', title: '재벌집 막내아들', type: '드라마', release_year: 2022 },
  { id: 'mv-goblin', title: '도깨비', type: '드라마', release_year: 2016 },
  { id: 'mv-parasite', title: '기생충', type: '영화', release_year: 2019 },
  { id: 'mv-ourbeloved', title: '그해 우리는', type: '드라마', release_year: 2021 },
  { id: 'mv-sunshine', title: '미스터 션샤인', type: '드라마', release_year: 2018 },
  { id: 'mv-12121979', title: '서울의 봄', type: '영화', release_year: 2023 },
  { id: 'mv-squidgame', title: '오징어 게임', type: '드라마', release_year: 2021 },
  { id: 'mv-woo', title: '이상한 변호사 우영우', type: '드라마', release_year: 2022 },
  { id: 'mv-kingdom', title: '킹덤', type: '드라마', release_year: 2019 },
  { id: 'mv-avengers', title: '어벤져스: 에이지 오브 울트론', type: '영화', release_year: 2015 },
  { id: 'mv-thehost', title: '괴물', type: '영화', release_year: 2006 },
  { id: 'mv-deluna', title: '호텔 델루나', type: '드라마', release_year: 2019 },
  { id: 'mv-2521', title: '스물다섯 스물하나', type: '드라마', release_year: 2022 },
  { id: 'mv-archi', title: '건축학개론', type: '영화', release_year: 2012 },
  { id: 'mv-mylove', title: '별에서 온 그대', type: '드라마', release_year: 2013 },
  { id: 'mv-theglory', title: '더 글로리', type: '드라마', release_year: 2022 },
  { id: 'mv-queenoftears', title: '눈물의 여왕', type: '드라마', release_year: 2024 },
];

export const SEED_SPOTS: SeedSpot[] = [
  { id: 'sp1', name: '세운상가 (금가프라자)', address: '서울특별시 종로구 청계천로 159', lat: 37.5662, lng: 126.9913, movieId: 'mv-vincenzo', scene: "주인공 빈센조(송중기)의 아지트이자 금가프라자 상인들과 함께 거대 악당 세력에 맞서 싸우던 메인 무대" },
  { id: 'sp2', name: '녹사평역 육교', address: '서울특별시 용산구 용산동4가 녹사평역 근처', lat: 37.5340, lng: 126.9873, movieId: 'mv-itaewon', scene: "박새로이(박서준)와 조이서(김다미)가 남산타워가 보이는 야경을 배경으로 깊은 대화를 나누던 시그니처 장소" },
  { id: 'sp3', name: '백인제 가옥 (정심재 배경)', address: '서울특별시 종로구 북촌로7길 16', lat: 37.5818, lng: 126.9856, movieId: 'mv-chaebol', scene: "순양그룹 진양철 회장(이성민)의 웅장한 저택 '정심재'의 내부 정원과 고풍스러운 한옥 신들의 배경" },
  { id: 'sp4', name: '덕수궁 돌담길', address: '서울특별시 중구 세종대로 99', lat: 37.5658, lng: 126.9748, movieId: 'mv-goblin', scene: "도깨비 김신(공유)과 저승사자(이동욱)가 처음으로 마주치며 스쳐 지나가던 몽환적이고 감성적인 길목" },
  { id: 'sp5', name: '돼지쌀슈퍼 (우리슈퍼)', address: '서울특별시 마포구 손기정로 32', lat: 37.5552, lng: 126.9639, movieId: 'mv-parasite', scene: "기우(최우식)가 친구(박서준)에게 과외 자리를 제안받으며 소주를 마시던 이야기의 시작점이 되는 슈퍼마켓" },
  { id: 'sp6', name: '자하문터널 계단', address: '서울특별시 종로구 자하문로 219', lat: 37.5928, lng: 126.9655, movieId: 'mv-parasite', scene: "폭우가 쏟아지던 밤, 박사장 저택에서 도망쳐 나온 기택(송강호) 가족이 참담한 심정으로 빗속을 뚫고 내려가던 긴 계단" },
  { id: 'sp7', name: '최웅의 집 (백사마을 일대)', address: '서울특별시 노원구 중계동 백사마을 일대', lat: 37.6499, lng: 127.0815, movieId: 'mv-ourbeloved', scene: "최웅(최우식)과 국연수(김다미)의 학창 시절 및 재회 후 복잡 미묘한 감정이 교차하던 골목길과 동네 배경" },
  { id: 'sp8', name: '진관사', address: '서울특별시 은평구 진관길 73', lat: 37.6376, lng: 126.9556, movieId: 'mv-sunshine', scene: "고애신(김태리)과 최유진(이병헌)이 서로의 마음을 확인하고, 의병들의 비밀스러운 활동이 이루어지던 고즈넉한 사찰" },
  { id: 'sp9', name: '한남동 공관 일대', address: '서울특별시 용산구 한남동 일대', lat: 37.5343, lng: 127.0008, movieId: 'mv-12121979', scene: "긴박했던 12·12 군사반란 당시 육군참모총장 공관 및 주요 군사 지휘부의 숨 막히는 대치 상황의 배경" },
  { id: 'sp10', name: '쌍문동 백운시장', address: '서울특별시 도봉구 삼양로154길 36', lat: 37.6520, lng: 127.0307, movieId: 'mv-squidgame', scene: "성기훈(이정재)과 조상우(박해수)가 게임에 참여하기 전, 빚에 쪼들리며 무기력하게 일상을 보내던 생선가게와 동네 시장" },
  { id: 'sp11', name: '역삼동 센터필드 (한바다 로펌 외관)', address: '서울특별시 강남구 테헤란로 231', lat: 37.5012, lng: 127.0366, movieId: 'mv-woo', scene: "우영우(박은빈)가 회전문을 통과하기 위해 이준호(강태오)와 함께 '쿵짝짝' 왈츠 리듬을 타던 대형 빌딩 로비와 광장" },
  { id: 'sp12', name: '창덕궁 후원', address: '서울특별시 종로구 율곡로 99', lat: 37.5847, lng: 126.9943, movieId: 'mv-kingdom', scene: "조선 시대 배경의 좀비 미스터리 속 생사초의 비밀이 숨겨져 있고, 궁궐 내 역병이 은밀하게 퍼지던 아름답고도 음산한 연못가" },
  { id: 'sp13', name: '세빛섬', address: '서울특별시 서초구 올림픽대로 2085-14', lat: 37.5118, lng: 126.9956, movieId: 'mv-avengers', scene: "헬렌 조(수현)의 연구실이자 인공지능 울트론이 새로운 신체(비전)를 만들던 최첨단 연구소 외관" },
  { id: 'sp14', name: '한강철교 및 여의도 한강공원', address: '서울특별시 영등포구 여의동로 330', lat: 37.5275, lng: 126.9330, movieId: 'mv-thehost', scene: "평화롭던 한강 둔치에 갑작스럽게 괴물이 나타나 시민들을 습격하고 현서(고아성)를 납치해 가던 오프닝 명장면" },
  { id: 'sp15', name: '익선동 낙원장 (외관 배경)', address: '서울특별시 종로구 수표로28길 25', lat: 37.5743, lng: 126.9905, movieId: 'mv-deluna', scene: "장만월(이지은)이 운영하는 신비로운 귀신 전용 호텔 '델루나'의 클래식하고 이국적인 외관 컷의 모티브가 된 레트로 골목" },
  { id: 'sp16', name: '아현동 산동네 일대', address: '서울특별시 마포구 아현동 일대 골목길', lat: 37.5547, lng: 126.9560, movieId: 'mv-2521', scene: "IMF 시대를 살아가는 백이진(남주혁)이 신문 배달을 하거나 나희도(김태리)와 풋풋한 청춘의 고민을 나누던 옛 감성의 언덕길" },
  { id: 'sp17', name: '누하동 골목 (서촌)', address: '서울특별시 종로구 필운대로6길 15', lat: 37.5793, lng: 126.9698, movieId: 'mv-archi', scene: "승민(이제훈)과 서연(수지)이 숙제를 하며 정답게 이야기를 나누고 첫사랑의 감정을 키워가던 아날로그 감성의 빈집 정원" },
  { id: 'sp18', name: '남산서울타워 루프테라스', address: '서울특별시 용산구 남산공원길 105', lat: 37.5512, lng: 126.9882, movieId: 'mv-mylove', scene: "도민준(김수현)과 천송이(전지현)가 영원한 사랑을 약속하며 '사랑의 자물쇠'를 걸고 로맨틱한 데이트를 즐기던 장소" },
  { id: 'sp19', name: '성수동 명당 (기원 인근)', address: '서울특별시 성동구 성수이로 89', lat: 37.5447, lng: 127.0560, movieId: 'mv-theglory', scene: "문동은(송혜교)이 하도영(정성일)의 이목을 끌기 위해 기원을 기웃거리며 치밀한 복수를 설계하던 도심 속 대치 배경" },
  { id: 'sp20', name: '여의도 더현대 서울', address: '서울특별시 영등포구 여의대로 108', lat: 37.5258, lng: 126.9285, movieId: 'mv-queenoftears', scene: "재벌 3세 홍해인(김지원)이 대표로 있는 화려한 '퀸즈 백화점'의 실제 배경으로, 백현우(김수현)와의 비즈니스 신들이 펼쳐진 곳" },
];

const movieRef = (id: string) => {
  const m = SEED_MOVIES.find((x) => x.id === id);
  return { id, title: m?.title ?? '작품', release_year: m?.release_year ?? null };
};

export function seedMovies(): Movie[] {
  return SEED_MOVIES.map((m) => ({
    id: m.id,
    title: m.title,
    poster_url: null,
    release_year: m.release_year,
    genre: m.type,
  }));
}

export function seedSpotsWithScenes(): Spot[] {
  return SEED_SPOTS.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    is_cafe: false,
    scenes: [{ id: `${s.id}-sc`, image_url: null, real_image_url: null, video_url: null, description: s.scene, movies: movieRef(s.movieId) }],
  }));
}

export function seedSpotById(id: string): Spot | null {
  const s = SEED_SPOTS.find((x) => x.id === id);
  if (!s) return null;
  return { id: s.id, name: s.name, address: s.address, lat: s.lat, lng: s.lng, is_cafe: false };
}

export function seedScenesBySpot(id: string): SceneInfo[] {
  const s = SEED_SPOTS.find((x) => x.id === id);
  if (!s) return [];
  return [{ id: `${s.id}-sc`, image_url: null, real_image_url: null, video_url: null, description: s.scene, movies: movieRef(s.movieId) }];
}

export function seedMovieById(id: string): Movie | null {
  const m = SEED_MOVIES.find((x) => x.id === id);
  if (!m) return null;
  return { id: m.id, title: m.title, poster_url: null, release_year: m.release_year, genre: m.type };
}

// movie 상세에서 쓰는 scene(스팟 임베드) 형태
export function seedScenesByMovie(movieId: string) {
  return SEED_SPOTS.filter((s) => s.movieId === movieId).map((s) => ({
    id: `${s.id}-sc`,
    image_url: null as string | null,
    description: s.scene,
    spots: { id: s.id, name: s.name, address: s.address, lat: s.lat, lng: s.lng },
  }));
}
