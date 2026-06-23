// 나만의 코스(촬영지 묶음) + 폴더 역할. (로그인 불필요, localStorage)
// 코스 = { id, name, spotIds[] }. 공유는 URL 인코딩으로 처리.
import { readJSON, writeJSON, subscribe, uid } from './storage';

const KEY = 'filmhere:courses';

export interface Course {
  id: string;
  name: string;
  spotIds: string[];
}

export function getCourses(): Course[] {
  const v = readJSON<Course[]>(KEY, []);
  return Array.isArray(v) ? v : [];
}

export function createCourse(name: string): Course {
  const course: Course = { id: uid(), name: name.trim() || '새 코스', spotIds: [] };
  writeJSON(KEY, [...getCourses(), course]);
  return course;
}

export function renameCourse(id: string, name: string): void {
  writeJSON(KEY, getCourses().map((c) => (c.id === id ? { ...c, name } : c)));
}

export function deleteCourse(id: string): void {
  writeJSON(KEY, getCourses().filter((c) => c.id !== id));
}

export function addSpotToCourse(courseId: string, spotId: string): void {
  writeJSON(
    KEY,
    getCourses().map((c) =>
      c.id === courseId && !c.spotIds.includes(spotId)
        ? { ...c, spotIds: [...c.spotIds, spotId] }
        : c
    )
  );
}

export function removeSpotFromCourse(courseId: string, spotId: string): void {
  writeJSON(
    KEY,
    getCourses().map((c) =>
      c.id === courseId ? { ...c, spotIds: c.spotIds.filter((s) => s !== spotId) } : c
    )
  );
}

export function setCourseSpots(courseId: string, spotIds: string[]): void {
  writeJSON(KEY, getCourses().map((c) => (c.id === courseId ? { ...c, spotIds } : c)));
}

// 공유: 코스를 base64(JSON)로 인코딩/디코딩
export function encodeCourse(course: Pick<Course, 'name' | 'spotIds'>): string {
  try {
    return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(course)))));
  } catch {
    return '';
  }
}

export function decodeCourse(token: string): Pick<Course, 'name' | 'spotIds'> | null {
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(token))));
    const obj = JSON.parse(json);
    if (obj && typeof obj.name === 'string' && Array.isArray(obj.spotIds)) return obj;
    return null;
  } catch {
    return null;
  }
}

export function importCourse(token: string): Course | null {
  const decoded = decodeCourse(token);
  if (!decoded) return null;
  const course: Course = { id: uid(), name: decoded.name, spotIds: decoded.spotIds };
  writeJSON(KEY, [...getCourses(), course]);
  return course;
}

export function subscribeCourses(cb: () => void) {
  return subscribe(KEY, cb);
}
