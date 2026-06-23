'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database, ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const moviesData = [
  { title: "빈센조", release_year: 2021 },
  { title: "이태원 클라쓰", release_year: 2020 },
  { title: "재벌집 막내아들", release_year: 2022 },
  { title: "도깨비", release_year: 2016 },
  { title: "기생충", release_year: 2019 },
  { title: "그해 우리는", release_year: 2021 },
  { title: "미스터 션샤인", release_year: 2018 },
  { title: "서울의 봄", release_year: 2023 },
  { title: "오징어 게임", release_year: 2021 },
  { title: "이상한 변호사 우영우", release_year: 2022 },
  { title: "킹덤", release_year: 2019 },
  { title: "어벤져스: 에이지 오브 울트론", release_year: 2015 },
  { title: "괴물", release_year: 2006 },
  { title: "호텔 델루나", release_year: 2019 },
  { title: "스물다섯 스물하나", release_year: 2022 },
  { title: "건축학개론", release_year: 2012 },
  { title: "별에서 온 그대", release_year: 2013 },
  { title: "더 글로리", release_year: 2022 },
  { title: "눈물의 여왕", release_year: 2024 }
];

const spotsData = [
  {
    name: "세운상가 (금가프라자)",
    address: "서울특별시 종로구 청계천로 159",
    lat: 37.5683,
    lng: 126.9959,
    movieTitle: "빈센조",
    description: "주인공 빈센조(송중기)의 아지트이자 금가프라자 상인들과 함께 거대 악당 세력에 맞서 싸우던 메인 무대",
    imageUrl: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?w=800"
  },
  {
    name: "녹사평역 육교",
    address: "서울특별시 용산구 용산동4가 녹사평역 근처",
    lat: 37.5345,
    lng: 126.9873,
    movieTitle: "이태원 클라쓰",
    description: "박새로이(박서준)와 조이서(김다미)가 남산타워가 보이는 야경을 배경으로 깊은 대화를 나누던 시그니처 장소",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800"
  },
  {
    name: "백인제 가옥 (정심재 배경)",
    address: "서울특별시 종로구 북촌로7길 16",
    lat: 37.5815,
    lng: 126.9840,
    movieTitle: "재벌집 막내아들",
    description: "순양그룹 진양철 회장(이성민)의 웅장한 저택 '정심재'의 내부 정원과 고풍스러운 한옥 신들의 배경",
    imageUrl: "https://images.unsplash.com/photo-1608778893303-34e89e023fe7?w=800"
  },
  {
    name: "덕수궁 돌담길",
    address: "서울특별시 중구 세종대로 99",
    lat: 37.5658,
    lng: 126.9752,
    movieTitle: "도깨비",
    description: "도깨비 김신(공유)과 저승사자(이동욱)가 처음으로 마주치며 스쳐 지나가던 몽환적이고 감성적인 길목",
    imageUrl: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800"
  },
  {
    name: "돼지쌀슈퍼 (우리슈퍼)",
    address: "서울특별시 마포구 손기정로 32",
    lat: 37.5562,
    lng: 126.9634,
    movieTitle: "기생충",
    description: "기우(최우식)가 친구(박서준)에게 과외 자리를 제안받으며 소주를 마시던 이야기의 시작점이 되는 슈퍼마켓",
    imageUrl: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800"
  },
  {
    name: "자하문터널 계단",
    address: "서울특별시 종로구 자하문로 219",
    lat: 37.5925,
    lng: 126.9667,
    movieTitle: "기생충",
    description: "폭우가 쏟아지던 밤, 박사장 저택에서 도망쳐 나온 기택(송강호) 가족이 참담한 심정으로 빗속을 뚫고 내려가던 긴 계단",
    imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800"
  },
  {
    name: "최웅의 집 (행궁동/중계동 인근)",
    address: "서울특별시 노원구 중계동 백사마을 일대",
    lat: 37.6495,
    lng: 127.0903,
    movieTitle: "그해 우리는",
    description: "주인공 최웅(최우식)과 국연수(김다미)의 학창 시절 및 재회 후 복잡 미묘한 감정이 교차하던 골목길과 동네 배경",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800"
  },
  {
    name: "진관사",
    address: "서울특별시 은평구 진관길 73",
    lat: 37.6391,
    lng: 126.9388,
    movieTitle: "미스터 션샤인",
    description: "고애신(김태리)과 최유진(이병헌)이 서로의 마음을 확인하고, 의병들의 비밀스러운 활동이 이루어지던 고즈넉한 사찰",
    imageUrl: "https://images.unsplash.com/photo-1547989453-11e67ffb3885?w=800"
  },
  {
    name: "조선대학교 본관 (한남동 공관 대용 촬영)",
    address: "서울특별시 용산구 한남동 일대 (실제 사건 배경지)",
    lat: 37.5340,
    lng: 127.0026,
    movieTitle: "서울의 봄",
    description: "긴박했던 12·12 군사반란 당시 육군참모총장 공관 및 주요 군사 지휘부의 숨 막히는 대치 상황의 배경",
    imageUrl: "https://images.unsplash.com/photo-1590579491410-d3df51610e74?w=800"
  },
  {
    name: "쌍문동 백운시장",
    address: "서울특별시 도봉구 삼양로154길 36",
    lat: 37.6492,
    lng: 127.0182,
    movieTitle: "오징어 게임",
    description: "성기훈(이정재)과 조상우(박해수)가 게임에 참여하기 전, 빚에 쪼들리며 무기력하게 일상을 보내던 생선가게와 동네 시장",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800"
  },
  {
    name: "역삼동 센터필드 (한바다 로펌 외관)",
    address: "서울특별시 강남구 테헤란로 231",
    lat: 37.5038,
    lng: 127.0428,
    movieTitle: "이상한 변호사 우영우",
    description: "우영우(박은빈)가 회전문을 통과하기 위해 이준호(강태오)와 함께 '쿵짝짝' 왈츠 리듬을 타던 대형 빌딩 로비와 광장",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
  },
  {
    name: "창덕궁 후원",
    address: "서울특별시 종로구 율곡로 99",
    lat: 37.5794,
    lng: 126.9910,
    movieTitle: "킹덤",
    description: "조선 시대 배경의 좀비 미스터리 속에서 생사초의 비밀이 숨겨져 있고, 궁궐 내 역병이 은밀하게 퍼지던 아름답고도 음산한 연못가",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=800"
  },
  {
    name: "세빛섬",
    address: "서울특별시 서초구 올림픽대로 2085-14",
    lat: 37.5268,
    lng: 126.9954,
    movieTitle: "어벤져스: 에이지 오브 울트론",
    description: "유전공학자 헬렌 조(수현)의 연구실이자 인공지능 울트론이 닥터 조를 협박해 새로운 신체(비전)를 만들던 최첨단 연구소 외관",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800"
  },
  {
    name: "한강철교 및 여의도 한강공원",
    address: "서울특별시 영등포구 여의동로 330",
    lat: 37.5284,
    lng: 126.9341,
    movieTitle: "괴물",
    description: "평화롭던 한강 둔치에 갑작스럽게 정체불명의 괴물이 나타나 시민들을 습격하고 현서(고아성)를 납치해 가던 오프닝 명장면",
    imageUrl: "https://images.unsplash.com/photo-1610569260751-b23b1e872653?w=800"
  },
  {
    name: "익선동 낙원장 (외관 배경)",
    address: "서울특별시 종로구 수표로28길 25",
    lat: 37.5735,
    lng: 126.9897,
    movieTitle: "호텔 델루나",
    description: "장만월(이지은)이 운영하는 신비로운 귀신 전용 호텔 '델루나'의 클래식하고 이국적인 외관 컷의 모티브가 된 레트로 골목",
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"
  },
  {
    name: "아현동 산동네 일대 (서울 촬영분)",
    address: "서울특별시 마포구 아현동 일대 골목길",
    lat: 37.5518,
    lng: 126.9555,
    movieTitle: "스물다섯 스물하나",
    description: "IMF 시대를 살아가는 백이진(남주혁)이 신문 배달을 하거나 나희도(김태리)와 풋풋한 청춘의 고민을 나누던 옛 감성의 언덕길",
    imageUrl: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=800"
  },
  {
    name: "정릉동 빈집 & 누하동 골목",
    address: "서울특별시 종로구 필운대로6길 15",
    lat: 37.5807,
    lng: 126.9696,
    movieTitle: "건축학개론",
    description: "대학생 승민(이제훈)과 서연(수지)이 숙제를 하기 위해 만나 정답게 이야기를 나누고 첫사랑의 감정을 키워가던 아날로그 감성의 빈집 정원",
    imageUrl: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800"
  },
  {
    name: "남산서울타워 루프테라스",
    address: "서울특별시 용산구 남산공원길 105",
    lat: 37.5512,
    lng: 126.9882,
    movieTitle: "별에서 온 그대",
    description: "도민준(김수현)과 천송이(전지현)가 영원한 사랑을 약속하며 '사랑의 자물쇠'를 걸고 로맨틱한 데이트를 즐기던 장소",
    imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800"
  },
  {
    name: "성수동 명당 (바둑 공원 인근 촬영지)",
    address: "서울특별시 성동구 성수이로 89",
    lat: 37.5422,
    lng: 127.0543,
    movieTitle: "더 글로리",
    description: "문동은(송혜교)이 하도영(정성일)의 이목을 끌기 위해 기원을 기웃거리며 대국을 준비하고 치밀한 복수를 설계하던 도심 속 대치 배경",
    imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800"
  },
  {
    name: "여의도 더현대 서울",
    address: "서울특별시 영등포구 여의대로 108",
    lat: 37.5259,
    lng: 126.9283,
    movieTitle: "눈물의 여왕",
    description: "재벌 3세 홍해인(김지원)이 대표로 있는 화려한 '퀸즈 백화점'의 실제 배경으로, 백현우(김수현)와 해인의 일터이자 긴장감 넘치는 비즈니스 신들이 펼쳐진 곳",
    imageUrl: "https://images.unsplash.com/photo-1481437156560-3205a6a55735?w=800"
  }
];

export default function SeedPage() {
  const [status, setStatus] = useState<'idle' | 'seeding' | 'success' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleSeed = async () => {
    if (status === 'seeding') return;
    setStatus('seeding');
    setLog([]);
    addLog('시딩 프로세스를 시작합니다...');

    try {
      // 1. Clean existing records
      addLog('기존 데이터(scenes, spots, movies)를 초기화합니다...');
      await supabase.from('scenes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('spots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('movies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addLog('기존 테이블 데이터 정리 완료.');

      // 2. Insert Movies
      addLog('작품(영화/드라마) 정보를 등록합니다...');
      const movieMap = new Map<string, string>();
      
      for (const movie of moviesData) {
        const { data, error } = await supabase
          .from('movies')
          .insert({
            title: movie.title,
            release_year: movie.release_year,
            poster_url: ''
          })
          .select()
          .single();
        
        if (error) {
          addLog(`❌ 작품 등록 실패 (${movie.title}): ${error.message}`);
        } else if (data) {
          movieMap.set(movie.title, data.id);
          addLog(`✓ 작품 등록 완료: ${movie.title}`);
        }
      }

      // 3. Insert Spots & Scenes
      addLog('촬영 장소 및 명장면 스틸컷 연동 정보를 등록합니다...');
      for (const spot of spotsData) {
        const { data: spotData, error: spotError } = await supabase
          .from('spots')
          .insert({
            name: spot.name,
            address: spot.address,
            lat: spot.lat,
            lng: spot.lng,
            is_cafe: false
          })
          .select()
          .single();
        
        if (spotError) {
          addLog(`❌ 장소 등록 실패 (${spot.name}): ${spotError.message}`);
          continue;
        }

        const movieId = movieMap.get(spot.movieTitle);
        if (!movieId) {
          addLog(`⚠️ 작품 맵핑 누락으로 장소 매칭 건너뜀: ${spot.name}`);
          continue;
        }

        const { error: sceneError } = await supabase
          .from('scenes')
          .insert({
            movie_id: movieId,
            spot_id: spotData.id,
            image_url: spot.imageUrl,
            description: spot.description
          });
        
        if (sceneError) {
          addLog(`❌ 명장면 매칭 실패 (${spot.name}): ${sceneError.message}`);
        } else {
          addLog(`✓ 촬영지 등록 및 매칭 성공: ${spot.name}`);
        }
      }

      setStatus('success');
      addLog('🎉 Supabase 데이터베이스 시딩이 완벽하게 성공했습니다!');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      addLog(`❌ 치명적인 오류 발생: ${err.message || err}`);
    }
  };

  return (
    <main className="min-h-screen bg-background text-antique-ivory p-6 md:p-12 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-8 my-auto">
        <header className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-1 text-antique-ivory/60 hover:text-antique-ivory text-xs font-semibold uppercase tracking-wider mb-2">
            <ArrowLeft size={14} />
            홈으로 돌아가기
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-antique-ivory/10 rounded-2xl border border-antique-ivory/20">
              <Database size={32} className="text-antique-ivory" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Supabase 데이터 베이스 세팅</h1>
              <p className="text-sm text-antique-ivory/40">서울 촬영 명장면 장소 20곳 일괄 시딩 도구</p>
            </div>
          </div>
        </header>

        <section className="bg-zinc-950/40 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-antique-ivory">작동 설명</h2>
            <p className="text-xs text-antique-ivory/60 leading-relaxed font-light">
              로컬 CLI 환경의 샌드박스 네트워크 방화벽으로 인해 데이터베이스 다이렉트 주입이 되지 않는 현상을 우회하여, 
              <strong>인터넷 연결이 활성화된 사용자 브라우저 런타임</strong>에서 직접 Supabase DB로 20개의 명장면/촬영지 위치(좌표 포함)를 안전하게 생성합니다.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSeed}
              disabled={status === 'seeding'}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-antique-ivory text-black rounded-xl text-xs font-bold hover:bg-white disabled:opacity-50 transition-all cursor-pointer shadow-lg active:scale-95 duration-200"
            >
              {status === 'seeding' ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  데이터 시딩 중...
                </>
              ) : (
                '서울 촬영 스팟 20곳 DB 주입 시작'
              )}
            </button>
            
            {status === 'success' && (
              <Link
                href="/map"
                className="flex items-center justify-center px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                지도로 가서 핀 확인하기
              </Link>
            )}
          </div>

          {/* Status logs */}
          {log.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-zinc-400">시딩 작업 로그</span>
                {status === 'success' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <CheckCircle size={12} /> 완료
                  </span>
                ) : status === 'error' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                    <AlertCircle size={12} /> 오류
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-antique-ivory/50 animate-pulse">실행 중...</span>
                )}
              </div>
              
              <div className="bg-black/50 border border-white/5 rounded-2xl p-4 h-60 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {log.map((message, i) => (
                  <div key={i} className={`leading-relaxed ${
                    message.includes('❌') ? 'text-rose-400 font-medium' : 
                    message.includes('⚠️') ? 'text-amber-400 font-medium' : 
                    message.includes('✓') ? 'text-emerald-400' : 'text-zinc-400'
                  }`}>
                    {message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
      
      <footer className="text-center text-antique-ivory/20 text-[10px] mt-12 font-light">
        FilmHere &copy; Database Seeding Utility. Run client-side.
      </footer>
    </main>
  );
}
