import { requireUser, ALL_PERMISSIONS } from "@/lib/auth";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader, Card, EmptyState, SectionTitle, Badge } from "@/components/ui";
import { logoutAction } from "@/lib/actions";

export default async function AdminSettings() {
  const user = await requireUser("admin");
  const logs = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(60);

  return (
    <div className="py-6">
      <PageHeader title="Activity & Settings" subtitle="Security, accountability and configuration" back="/admin" />

      <SectionTitle title="Administrator" />
      <Card>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-[12px] text-slate-500">Name</span>
          <span className="text-[13px] font-semibold text-navy">{user.fullName}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-[12px] text-slate-500">Email</span>
          <span className="text-[13px] font-semibold text-navy">{user.email}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-[12px] text-slate-500">Access</span>
          <span className="text-[13px] font-semibold text-navy">Full system control</span>
        </div>
      </Card>

      <SectionTitle title="Permission Catalogue" />
      <Card className="flex flex-wrap gap-2">
        {ALL_PERMISSIONS.map((p) => (
          <Badge key={p.key} text={`${p.group}: ${p.label}`} tone="navy" />
        ))}
      </Card>

      <SectionTitle title="Roles Supported" />
      <Card className="flex flex-wrap gap-2">
        {["Student", "Teacher", "Admin", "HOD", "Class Coordinator", "Exam Cell", "Librarian", "Accountant", "Super Admin"].map(
          (r) => (
            <Badge key={r} text={r} tone="grey" />
          ),
        )}
      </Card>

      <SectionTitle title="Activity Log" />
      {logs.length === 0 ? (
        <EmptyState icon="pulse" title="No activity" message="System actions will be recorded here." />
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <Card key={l.id} className="flex items-center justify-between gap-3">
              <p className="text-[13px] text-slate-700">
                <b className="text-navy">{l.actorName || "System"}</b> {l.action}
                {l.target ? <span className="text-slate-400"> · {l.target}</span> : null}
              </p>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(l.createdAt).toLocaleString()}
              </span>
            </Card>
          ))}
        </div>
      )}

      <form action={logoutAction} className="mt-6 max-w-xs">
        <button className="btn btn-primary w-full">Sign out</button>
      </form>
    </div>
  );
}
