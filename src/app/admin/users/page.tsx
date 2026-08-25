import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { users, students, teachers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";
import { reviewUserAction, updateStudentAssignmentAction } from "@/lib/actions";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "students", label: "Students" },
  { key: "teachers", label: "Teachers" },
];

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireUser("admin");
  const { tab = "pending" } = await searchParams;

  const rows = await db
    .select({
      id: users.id,
      name: users.fullName,
      email: users.email,
      role: users.role,
      status: users.status,
      department: users.department,
      createdAt: users.createdAt,
      roll: students.rollNumber,
      semester: students.semester,
      section: students.section,
      course: students.course,
      employeeId: teachers.employeeId,
      designation: teachers.designation,
    })
    .from(users)
    .leftJoin(students, eq(students.userId, users.id))
    .leftJoin(teachers, eq(teachers.userId, users.id))
    .orderBy(desc(users.createdAt));

  const filtered = rows.filter((r) =>
    tab === "pending"
      ? r.status === "pending"
      : tab === "students"
        ? r.role === "student"
        : r.role === "teacher",
  );

  return (
    <div className="py-6">
      <PageHeader title="Users & Approvals" subtitle="Manage all campus accounts" back="/admin" />
      <div className="card p-1 grid grid-cols-3 gap-1 mb-4 max-w-md">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/users?tab=${t.key}`}
            className={`rounded-xl py-2 text-center text-[13px] font-semibold ${
              tab === t.key ? "bg-navy text-white" : "text-slate-500"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="users" title="Nothing here" message="There are no accounts in this category right now." />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((u) => (
            <Card key={u.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-navy text-[15px]">{u.name}</p>
                  <p className="text-[12px] text-slate-500 truncate">{u.email}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {u.role === "student"
                      ? `${u.roll ?? "—"} · ${u.course ?? ""} · Sem ${u.semester ?? "-"} Sec ${u.section ?? "-"}`
                      : `${u.employeeId ?? "—"} · ${u.designation ?? ""}`}
                  </p>
                  <p className="text-[11px] text-slate-400">{u.department}</p>
                  <p className="text-[11px] text-slate-400">
                    Registered {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  text={u.status}
                  tone={
                    u.status === "approved" ? "green" : u.status === "pending" ? "gold" : "red"
                  }
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {(["approved", "rejected", "suspended"] as const).map((d) =>
                  u.status === d ? null : (
                    <form key={d} action={reviewUserAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="decision" value={d} />
                      <button
                        className={`btn ${d === "approved" ? "btn-primary" : "btn-ghost"} text-[12px] py-1.5 px-3 capitalize`}
                      >
                        {d === "approved" ? "Approve / Activate" : d}
                      </button>
                    </form>
                  ),
                )}
                {u.role === "teacher" && (
                  <Link href={`/admin/permissions?userId=${u.id}`} className="btn btn-ghost text-[12px] py-1.5 px-3">
                    Permissions
                  </Link>
                )}
              </div>

              {u.role === "student" && (
                <details className="mt-3">
                  <summary className="text-[12px] font-semibold text-navy cursor-pointer">
                    Assign department / semester / section
                  </summary>
                  <form action={updateStudentAssignmentAction} className="mt-2 grid grid-cols-3 gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <input name="department" className="input col-span-3" defaultValue={u.department ?? ""} />
                    <input name="semester" type="number" min={1} max={8} className="input" defaultValue={u.semester ?? 1} />
                    <input name="section" className="input" defaultValue={u.section ?? "A"} />
                    <button className="btn btn-primary">Save</button>
                  </form>
                </details>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
