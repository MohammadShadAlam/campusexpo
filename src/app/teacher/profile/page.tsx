import Link from "next/link";
import { requireUser, ALL_PERMISSIONS } from "@/lib/auth";
import { PageHeader, Card, SectionTitle, Badge } from "@/components/ui";
import { logoutAction } from "@/lib/actions";

export default async function TeacherProfile() {
  const user = await requireUser("teacher");
  const t = user.teacher!;
  return (
    <>
      <PageHeader title="Profile" subtitle="Faculty account" back="/teacher" />
      <Card className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-navy text-white grid place-items-center text-2xl font-extrabold">
          {user.fullName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-navy text-lg leading-tight">{user.fullName}</p>
          <p className="text-[12px] text-slate-500 truncate">{user.email}</p>
          <p className="text-[12px] text-gold font-semibold">{t.designation}</p>
        </div>
      </Card>

      <SectionTitle title="Details" />
      <Card>
        {[
          ["Employee ID", t.employeeId],
          ["Department", user.department],
          ["Subjects", t.subjects || "—"],
          ["Phone", user.phone],
          ["Status", user.status],
        ].map(([k, v]) => (
          <div key={String(k)} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
            <span className="text-[12px] text-slate-500">{k}</span>
            <span className="text-[13px] font-semibold text-navy">{v ?? "—"}</span>
          </div>
        ))}
      </Card>

      <SectionTitle title="My Permissions" />
      <Card className="flex flex-wrap gap-2">
        {ALL_PERMISSIONS.map((p) => (
          <Badge key={p.key} text={p.label} tone={user.permissions[p.key] ? "green" : "grey"} />
        ))}
      </Card>
      <p className="text-[11px] text-slate-500 mt-2">
        Permissions are controlled by the administrator and update immediately.
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Link href="/notifications" className="btn btn-ghost">Notifications</Link>
        <Link href="/search" className="btn btn-ghost">Search</Link>
      </div>
      <form action={logoutAction} className="mt-3">
        <button className="btn btn-primary w-full">Sign out</button>
      </form>
    </>
  );
}
