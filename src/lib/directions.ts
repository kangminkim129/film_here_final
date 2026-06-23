// 외부 길찾기/로드뷰 딥링크 (카카오/네이버/구글). 키 불필요.

export function kakaoDirections(name: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
}

export function kakaoRoadview(lat: number, lng: number): string {
  return `https://map.kakao.com/link/roadview/${lat},${lng}`;
}

export function naverSearch(name: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(name)}`;
}

// 구글 대중교통 경로 (현재 위치 → 목적지)
export function googleTransit(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
}

export function googleDirections(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// 여러 촬영지를 순서대로 잇는 구글 멀티-경유지 길찾기(코스 투어용)
export function googleMultiStop(points: { lat: number; lng: number }[]): string {
  if (points.length === 0) return 'https://www.google.com/maps';
  const dest = points[points.length - 1];
  const waypoints = points.slice(0, -1).map((p) => `${p.lat},${p.lng}`).join('|');
  const base = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=walking`;
  return waypoints ? `${base}&waypoints=${encodeURIComponent(waypoints)}` : base;
}
