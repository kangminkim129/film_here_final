'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

// 별점 표시 (읽기 전용)
export function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? 'text-amber-400' : 'text-zinc-600'}
          fill={n <= Math.round(value) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

// 별점 입력
export function StarInput({ value, onChange, size = 28 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n}점`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={size}
            className={n <= (hover || value) ? 'text-amber-400' : 'text-zinc-600'}
            fill={n <= (hover || value) ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}
