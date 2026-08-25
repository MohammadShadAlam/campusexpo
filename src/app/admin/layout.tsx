import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { BottomNav } from "@/components/Shell";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/lib/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users & Approvals" },
  { href: "/admin/permissions", label: "Permissions" },
  { href: "/admin/academics", label: "Academics" },
  { href: "/admin/management", label: "Content Management" },
  { href: "/admin/settings", label: "Activity & Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("admin");
  return (
    <div className="min-h-dvh md:flex">
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-navy text-white p-5 sticky top-0 h-dvh">
        <div className="flex items-center gap-2">
          <Logo size={34} dark />
          <div>
            <p className="font-extrabold">CampusExpo</p>
            <p className="text-[10px] text-white/50">Administration</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1 flex-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/75 hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="text-[11px] text-white/50">{user.email}</div>
        <form action={logoutAction} className="mt-2">
          <button className="btn w-full border border-white/25 text-white hover:bg-white/10">Sign out</button>
        </form>
      </aside>
      <main className="flex-1 min-w-0 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8">{children}</div>
      </main>
      <div className="md:hidden">
        <BottomNav role="admin" />
      </div>
    </div>
  );
}
