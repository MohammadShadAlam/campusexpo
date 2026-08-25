import Link from "next/link";
import React from "react";

const ICONS: Record<string, string> = {
  home: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z",
  book: "M4 4h9a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4z M20 4h-2a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h2z",
  doc: "M6 2h8l4 4v16H6z M14 2v4h4",
  id: "M3 5h18v14H3z M7 10h3v4H7z M13 10h5 M13 14h5",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0",
  check: "M4 12l5 5L20 6",
  calendar: "M3 5h18v16H3z M8 2v5 M16 2v5 M3 10h18",
  chart: "M4 20V10 M10 20V4 M16 20v-7 M22 20H2",
  bell: "M18 16V11a6 6 0 1 0-12 0v5l-2 3h16z M10 22h4",
  chat: "M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z",
  folder: "M3 6h6l2 3h10v10H3z",
  megaphone: "M3 11v2a2 2 0 0 0 2 2h2l7 5V4L7 9H5a2 2 0 0 0-2 2z M18 8a5 5 0 0 1 0 8",
  send: "M22 2L11 13 M22 2l-7 20-4-9-9-4z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 3h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L6 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z",
  layers: "M12 2l10 6-10 6L2 8z M2 16l10 6 10-6",
  percent: "M19 5L5 19 M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  pulse: "M22 12h-4l-3 8-4-16-3 8H2",
  clipboard: "M9 3h6v3H9z M8 4H6v17h12V4h-2",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
};

export function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  const d = ICONS[name] ?? ICONS.doc;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {d.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M${seg}`} />
      ))}
    </svg>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3 mt-6 first:mt-0">
      <h2 className="text-[15px] font-bold text-navy tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "navy",
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "navy" | "gold" | "green" | "purple";
}) {
  const tones: Record<string, string> = {
    navy: "bg-[#eef2fb] text-[#1c3a76]",
    gold: "bg-[#fdf4e3] text-[#b8912f]",
    green: "bg-[#e9f6ef] text-[#1e7a4d]",
    purple: "bg-[#f1eefb] text-[#5b45a8]",
  };
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-full grid place-items-center ${tones[tone]}`}>
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </div>
      <p className="mt-3 text-[12px] font-medium text-slate-500 leading-tight">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-navy">{value}</span>
        {sub && <span className="text-[11px] font-semibold text-slate-400">{sub}</span>}
      </div>
    </div>
  );
}

export function QuickAction({
  href,
  icon,
  label,
  tone = "navy",
  disabled,
}: {
  href: string;
  icon: string;
  label: string;
  tone?: "navy" | "gold" | "green" | "purple" | "rose";
  disabled?: boolean;
}) {
  const tones: Record<string, string> = {
    navy: "bg-[#eef2fb] text-[#1c3a76]",
    gold: "bg-[#fdf4e3] text-[#b8912f]",
    green: "bg-[#e9f6ef] text-[#1e7a4d]",
    purple: "bg-[#f1eefb] text-[#5b45a8]",
    rose: "bg-[#fdeef1] text-[#b03a52]",
  };
  const inner = (
    <div
      className={`card p-3 flex flex-col items-center justify-center gap-2 h-[92px] text-center ${
        disabled ? "opacity-40" : "hover:border-navy/30"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl grid place-items-center ${tones[tone]}`}>
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </div>
      <span className="text-[11px] font-semibold text-navy leading-tight">{label}</span>
    </div>
  );
  if (disabled) return <div title="Permission not granted">{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}

export function EmptyState({
  title,
  message,
  icon = "doc",
}: {
  title: string;
  message: string;
  icon?: string;
}) {
  return (
    <div className="card p-8 flex flex-col items-center text-center gap-2">
      <div className="w-12 h-12 rounded-full bg-[#eef2fb] text-[#1c3a76] grid place-items-center">
        <Icon name={icon} />
      </div>
      <p className="font-semibold text-navy">{title}</p>
      <p className="text-[13px] text-slate-500 max-w-xs">{message}</p>
    </div>
  );
}

export function Badge({ text, tone = "navy" }: { text: string; tone?: string }) {
  const tones: Record<string, string> = {
    navy: "bg-[#eef2fb] text-[#1c3a76]",
    gold: "bg-[#fdf4e3] text-[#8a6d1f]",
    green: "bg-[#e9f6ef] text-[#1e7a4d]",
    red: "bg-[#fdeef1] text-[#b03a52]",
    grey: "bg-slate-100 text-slate-500",
  };
  return <span className={`chip ${tones[tone] ?? tones.navy}`}>{text}</span>;
}

export function PageHeader({
  title,
  subtitle,
  back = "/",
}: {
  title: string;
  subtitle?: string;
  back?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Link href={back} className="w-9 h-9 rounded-full bg-white border border-slate-200 grid place-items-center text-navy">
        ←
      </Link>
      <div>
        <h1 className="text-lg font-extrabold text-navy leading-tight">{title}</h1>
        {subtitle && <p className="text-[12px] text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export function ProgressBar({ value, tone = "navy" }: { value: number; tone?: string }) {
  const colors: Record<string, string> = {
    navy: "bg-navy",
    gold: "bg-gold",
    green: "bg-emerald-600",
    red: "bg-rose-500",
  };
  return (
    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${colors[tone] ?? colors.navy}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
