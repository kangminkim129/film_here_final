import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  // 대체 제안 칩(검색 0건일 때)
  suggestions?: { label: string; onClick?: () => void; href?: string }[];
}

export default function EmptyState({ icon: Icon, title, description, action, suggestions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
      <div className="p-6 bg-white/5 rounded-full border border-white/5">
        <Icon size={44} className="text-antique-ivory/20" />
      </div>
      <div className="space-y-2">
        <p className="text-xl text-antique-ivory/50 font-light">{title}</p>
        {description && <p className="text-sm text-antique-ivory/30">{description}</p>}
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {suggestions.map((s, i) =>
            s.href ? (
              <Link
                key={i}
                href={s.href}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-antique-ivory/70 hover:bg-antique-ivory hover:text-black transition-all"
              >
                {s.label}
              </Link>
            ) : (
              <button
                key={i}
                onClick={s.onClick}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-antique-ivory/70 hover:bg-antique-ivory hover:text-black transition-all"
              >
                {s.label}
              </button>
            )
          )}
        </div>
      )}

      {action && (
        <Link href={action.href} className="text-antique-ivory hover:underline underline-offset-4 text-sm">
          {action.label}
        </Link>
      )}
    </div>
  );
}
