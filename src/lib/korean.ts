// 한국어 검색 보조: 초성 추출 · 정규화 · 초성/부분일치 매칭
// 예) "이클" → "이태원 클라쓰" 매칭, "ㅇㅌㅇ" → "이태원" 매칭

const CHO = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

// 문자열에서 한글의 초성만 뽑아낸다(한글 외 문자는 그대로 유지).
export function getChosung(str: string): string {
  let out = '';
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      out += CHO[Math.floor((code - 0xac00) / 588)];
    } else {
      out += ch;
    }
  }
  return out;
}

export function normalize(str: string): string {
  return (str || '').toLowerCase().replace(/\s+/g, '').trim();
}

const isAllChosung = (s: string) => /^[ㄱ-ㅎ]+$/.test(s);

// text가 query에 매칭되는지: 일반 부분일치 + 초성 부분일치 모두 시도.
export function koMatch(text: string | null | undefined, query: string): boolean {
  if (!query) return true;
  if (!text) return false;
  const t = normalize(text);
  const q = normalize(query);
  if (!q) return true;
  if (t.includes(q)) return true;
  // 쿼리가 전부 초성이면 텍스트의 초성열과 비교
  if (isAllChosung(q)) {
    return getChosung(t).includes(q);
  }
  // 쿼리에 일부 초성이 섞인 경우도 텍스트 초성과 한 번 더 비교
  return getChosung(t).includes(getChosung(q));
}
