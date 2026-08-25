import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { users, subjects, assignments, notices, activityLogs, attendance } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { AppHeader } from "@/components/AppHeader";
import { Card, QuickAction, SectionTitle, StatCard, EmptyState } from "@/components/ui";
import { greeting, unreadCount } from "@/lib/queries";

async function count(where: ReturnType<typeof eq> | undefined, table: "users" | "subjects" | "assignments" | "notices") {
  const t = { users, subjects, assignments, notices }[table];
  const q = db.select({ c: sql<number>`count(*)::int` }).from(t);
  const r = where ? await q.where(where) : await q;
  return Number(r[0]?.c ?? 0);
}

export default async function AdminDashboard() {
  const user = await requireUser("admin");
  const [studentsCount, teachersCount, pending, courses, asg, notice, unread, logs, attAlerts] =
    await Promise.all([
      count(and(eq(users.role, "student"), eq(users.status, "approved")), "users"),
      count(and(eq(users.role, "teacher"), eq(users.status, "approved")), "users"),
      count(eq(users.status, "pending"), "users"),
      count(undefined, "subjects"),
      count(undefined, "assignments"),
      count(undefined, "notices"),
      unreadCount(user.id),
      db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(8),
      db
        .select({
          studentUserId: attendance.studentUserId,
          total: sql<number>`count(*)::int`,
          present: sql<number>`sum(case when ${attendance.status} <> 'absent' then 1 else 0 end)::int`,
        })
        .from(attendance)
        .groupBy(attendance.studentUserId),
    ]);

  const alerts = attAlerts.filter(
    (a) => Number(a.total) > 0 && Number(a.present) / Number(a.total) < 0.75,
  ).length;

  return (
    <>
      <AppHeader
        greeting={greeting()}
        name={user.fullName}
        roleLabel="Administrator"
        meta="Full system control"
        unread={unread}
      />

      <SectionTitle title="System Overview" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="users" label="Total Students" value={studentsCount} tone="navy" />
        <StatCard icon="shield" label="Total Teachers" value={teachersCount} tone="purple" />
        <StatCard icon="clipboard" label="Pending Approvals" value={pending} sub="Action" tone="gold" />
        <StatCard icon="book" label="Active Courses" value={courses} tone="green" />
        <StatCard icon="doc" label="Assignments" value={asg} tone="purple" />
        <StatCard icon="megaphone" label="Notices" value={notice} tone="navy" />
        <StatCard icon="percent" label="Attendance Alerts" value={alerts} sub="< 75%" tone="gold" />
        <StatCard icon="pulse" label="Activity Events" value={logs.length} tone="green" />
      </div>

      <SectionTitle title="Quick Actions" />
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        <QuickAction href="/admin/users?tab=pending" icon="check" label="Approve Users" tone="gold" />
        <QuickAction href="/admin/users?tab=students" icon="users" label="Students" />
        <QuickAction href="/admin/users?tab=teachers" icon="shield" label="Teachers" tone="purple" />
        <QuickAction href="/admin/permissions" icon="gear" label="Permissions" tone="rose" />
        <QuickAction href="/admin/academics" icon="book" label="Subjects" tone="green" />
        <QuickAction href="/admin/management#results" icon="chart" label="Results" />
        <QuickAction href="/admin/management#notice" icon="megaphone" label="Create Notice" tone="rose" />
        <QuickAction href="/admin/academics#timetable" icon="clock" label="Timetable" tone="gold" />
        <QuickAction href="/admin/academics#syllabus" icon="layers" label="Syllabus" tone="purple" />
        <QuickAction href="/admin/management#calendar" icon="calendar" label="Calendar" tone="green" />
        <QuickAction href="/admin/settings" icon="pulse" label="Activity Log" />
        <QuickAction href="/search" icon="search" label="Search" tone="navy" />
      </div>

      <SectionTitle
        title="Recent Activity"
        action={
          <Link href="/admin/settings" className="text-[12px] font-semibold text-navy">
            View log
          </Link>
        }
      />
      {logs.length === 0 ? (
        <EmptyState icon="pulse" title="No activity yet" message="System activity will be recorded here." />
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <Card key={l.id} className="flex items-center justify-between gap-3">
              <p className="text-[13px] text-slate-700">
                <b className="text-navy">{l.actorName || "System"}</b> {l.action}{" "}
                {l.target && <span className="text-slate-400">· {l.target}</span>}
              </p>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(l.createdAt).toLocaleString()}
              </span>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
