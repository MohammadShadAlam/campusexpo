"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./ui";
import { useState, useEffect } from "react";

type Item = { href: string; icon: string; label: string };

const NAV: Record<string, Item[]> = {
  student: [
    { href: "/student", icon: "home", label: "Home" },
    { href: "/student/timetable", icon: "clock", label: "Timetable" },
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

  // Agar user community page par hai, toh navbar render hi nahi hoga
  if (pathname === "/student/community") {
    return null;
  }

  const items = NAV[role] ?? NAV.student;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleActivity = () => {
      setIsVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    window.addEventListener("scroll", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    window.addEventListener("mousemove", handleActivity, { passive: true });

    timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      className={`fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 transition-all duration-300 transform ${
        isVisible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      <nav className="bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-full px-3 py-2 flex items-center justify-around gap-2 max-w-sm w-full">
        {items.map((it) => {
          const active =
            pathname === it.href || (it.href !== `/${role}` && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-2 rounded-full transition-all ${
                active ? "text-purple-600 bg-purple-50" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon name={it.icon} className="w-[18px] h-[18px]" />
              <span className="text-[9px] font-bold tracking-tight">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}