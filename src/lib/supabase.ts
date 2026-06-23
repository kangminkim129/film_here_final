import { createClient } from '@supabase/supabase-js';

// 환경변수가 비어 있어도 모듈 로드 시 크래시하지 않도록 방어한다.
// (Vercel에 NEXT_PUBLIC_SUPABASE_* 미설정 시 빌드/런타임이 통째로 죽는 것 방지)
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Sanitize URL: remove trailing slashes and /rest/v1/ suffix if present
const cleanedUrl = rawUrl.replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '');

if (!cleanedUrl || !supabaseAnonKey) {
  // 데이터가 안 뜰 뿐, 페이지 자체는 렌더링되도록 한다.
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다. ' +
      'Vercel 프로젝트 환경변수를 확인하세요.'
  );
}

// createClient는 빈 값이면 throw하므로 placeholder로 대체해 안전하게 생성한다.
export const supabase = createClient(
  cleanedUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
