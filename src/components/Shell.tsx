"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./ui";

type Item = { href: string; icon: string; label: string };

const NAV: Record<string, Item[]> = {
  student: [
    { href: "/student", icon: "home", label: "Home" },
    { href: "/student/academics", icon: "book", label: "Academics" },
    { href: "/student/id-card", icon: "id", label: "ID Card" },
    { href: "/student/profile", icon: "user", label: "Profile" },
  ],
  teacher: [
    { href: "/teacher", icon: "home", label: "Home" },
    { href: "/teacher/classes", icon: "users", label: "Classes" },
    { href: "/teacher/tasks", icon: "clipboard", label: "Tasks" },
    { href: "/teacher/profile", icon: "user", label: "Profile" },
  ],
  admin: [
    { href: "/admin", icon: "home", label: "Dashboard" },
    { href: "/admin/users", icon: "users", label: "Users" },
    { href: "/admin/academics", icon: "book", label: "Academics" },
    { href: "/admin/management", icon: "layers", label: "Manage" },
    { href: "/admin/settings", icon: "gear", label: "Settings" },
  ],
};

export function BottomNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = NAV[role] ?? NAV.student;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 md:max-w-2xl md:mx-auto md:rounded-t-2xl">
      {/* CHANGE 1: grid grid-cols-5 ki jagah flex w-full use kiya hai */}
      <div className="flex w-full">
        {items.map((it) => {
          const active =
            pathname === it.href || (it.href !== `/${role}` && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              {/* CHANGE 2: Shuru mein 'flex-1' add kiya hai taaki barabar space lein */}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${
                active ? "text-navy" : "text-slate-400"
              }`}
            >
              <Icon name={it.icon} className="w-[19px] h-[19px]" />
              {it.label}
              <span
                className={`h-[3px] w-6 rounded-full ${active ? "bg-gold" : "bg-transparent"}`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
