import Link from "next/link";
import { Icon, Badge } from "./ui";

export function AppHeader({
  greeting,
  name,
  meta,
  roleLabel,
  unread = 0,
}: {
  greeting: string;
  name: string;
  meta?: string;
  roleLabel: string;
  unread?: number;
}) {
  return (
    <header className="pt-6 pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] text-slate-500 font-medium">{greeting} 👋</p>
          <h1 className="text-[26px] leading-tight font-extrabold text-navy truncate">{name}</h1>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge text={roleLabel} tone="navy" />
            {meta && <span className="text-[12px] text-slate-500">{meta}</span>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/search"
            className="w-11 h-11 rounded-full bg-white border border-slate-200 grid place-items-center text-navy"
          >
            <Icon name="search" />
          </Link>
          <Link
            href="/notifications"
            className="relative w-11 h-11 rounded-full bg-white border border-slate-200 grid place-items-center text-navy"
          >
            <Icon name="bell" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gold text-white text-[10px] font-bold grid place-items-center">
                {unread}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
