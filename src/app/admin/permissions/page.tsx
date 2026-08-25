import Link from "next/link";
import { requireUser, ALL_PERMISSIONS } from "@/lib/auth";
import { db } from "@/db";
import { users, teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";
import { updatePermissionsAction } from "@/lib/actions";

export default async function PermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  await requireUser("admin");
  const sp = await searchParams;
  const rows = await db
    .select({
      id: users.id,
      name: users.fullName,
      email: users.email,
      department: users.department,
      status: users.status,
      designation: teachers.designation,
      permissions: teachers.permissions,
    })
    .from(users)
    .innerJoin(teachers, eq(teachers.userId, users.id))
    .where(eq(users.role, "teacher"));

  const selected = rows.find((r) => String(r.id) === sp.userId) ?? rows[0];

  return (
    <div className="py-6">
      <PageHeader title="Role & Permissions" subtitle="Individually control what each teacher can do" back="/admin" />
      {rows.length === 0 ? (
        <EmptyState icon="shield" title="No teachers" message="Approved faculty accounts will appear here." />
      ) : (
        <div className="grid md:grid-cols-[260px_1fr] gap-4">
          <div className="space-y-2">
            {rows.map((r) => (
              <Link key={r.id} href={`/admin/permissions?userId=${r.id}`}>
                <Card
                  className={`${selected?.id === r.id ? "border-navy" : ""} flex items-center justify-between gap-2`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-navy text-[14px] truncate">{r.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{r.designation}</p>
                  </div>
                  <Badge text={r.status} tone={r.status === "approved" ? "green" : "gold"} />
                </Card>
              </Link>
            ))}
          </div>

          {selected && (
            <Card>
              <p className="font-bold text-navy text-[16px]">Teacher: {selected.name}</p>
              <p className="text-[12px] text-slate-500">
                {selected.email} · {selected.department}
              </p>
              <form action={updatePermissionsAction} className="mt-4">
                <input type="hidden" name="userId" value={selected.id} />
                <input type="hidden" name="keys" value={ALL_PERMISSIONS.map((p) => p.key).join(",")} />
                <div className="divide-y divide-slate-100">
                  {ALL_PERMISSIONS.map((p) => {
                    const on = !!(selected.permissions as Record<string, boolean>)?.[p.key];
                    return (
                      <label key={p.key} className="flex items-center justify-between py-3 cursor-pointer">
                        <div>
                          <p className="text-[14px] font-semibold text-navy">{p.label}</p>
                          <p className="text-[11px] text-slate-400">{p.group}</p>
                        </div>
                        <span className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            name={`perm_${p.key}`}
                            defaultChecked={on}
                            className="sr-only peer"
                          />
                          <span className="w-11 h-6 rounded-full bg-slate-200 peer-checked:bg-navy transition-colors" />
                          <span className="absolute left-1 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                        </span>
                      </label>
                    );
                  })}
                </div>
                <button className="btn btn-primary w-full mt-4">Save Permissions</button>
              </form>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
