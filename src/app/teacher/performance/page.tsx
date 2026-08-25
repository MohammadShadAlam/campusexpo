import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { marks, attendance, submissions, assignments, subjects } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { PageHeader, Card, EmptyState, SectionTitle, ProgressBar } from "@/components/ui";
import { teacherSubjects } from "@/lib/queries";

export default async function ClassPerformance() {
  const user = await requireUser("teacher");
  if (!user.permissions.performance) redirect("/teacher");
  const subs = await teacherSubjects(user.id);
  const ids = subs.map((s) => s.id);

  const perSubject = ids.length
    ? await db
        .select({
          subjectId: marks.subjectId,
          name: subjects.name,
          avg: sql<number>`round(avg(${marks.score}::numeric / nullif(${marks.maxScore},0) * 100))::int`,
          high: sql<number>`max(${marks.score})::int`,
          low: sql<number>`min(${marks.score})::int`,
          count: sql<number>`count(*)::int`,
        })
        .from(marks)
        .innerJoin(subjects, eq(subjects.id, marks.subjectId))
        .where(inArray(marks.subjectId, ids))
        .groupBy(marks.subjectId, subjects.name)
    : [];

  const attAgg = ids.length
    ? await db
        .select({
          total: sql<number>`count(*)::int`,
          present: sql<number>`sum(case when ${attendance.status} <> 'absent' then 1 else 0 end)::int`,
        })
        .from(attendance)
        .where(inArray(attendance.subjectId, ids))
    : [];

  const asgIds = ids.length
    ? (await db.select({ id: assignments.id }).from(assignments).where(inArray(assignments.subjectId, ids))).map((a) => a.id)
    : [];
  const subCount = asgIds.length
    ? Number(
        (await db.select({ c: sql<number>`count(*)::int` }).from(submissions).where(inArray(submissions.assignmentId, asgIds)))[0].c,
      )
    : 0;

  const total = Number(attAgg[0]?.total ?? 0);
  const present = Number(attAgg[0]?.present ?? 0);
  const attPct = total ? Math.round((present / total) * 100) : 0;

  return (
    <>
      <PageHeader title="Class Performance" subtitle="Analytics for your subjects" back="/teacher" />
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-[11px] text-slate-500">Attendance Avg</p>
          <p className="text-2xl font-extrabold text-navy">{attPct}%</p>
        </Card>
        <Card className="text-center">
          <p className="text-[11px] text-slate-500">Assignments</p>
          <p className="text-2xl font-extrabold text-navy">{asgIds.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[11px] text-slate-500">Submissions</p>
          <p className="text-2xl font-extrabold text-navy">{subCount}</p>
        </Card>
      </div>

      <SectionTitle title="Subject Performance" />
      {perSubject.length === 0 ? (
        <EmptyState icon="chart" title="No performance data" message="Enter marks to generate class performance analytics." />
      ) : (
        <div className="space-y-2">
          {perSubject.map((r) => (
            <Card key={r.subjectId}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-navy text-[14px]">{r.name}</p>
                <span className="text-[13px] font-bold text-gold">{r.avg}% avg</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-2">
                Highest {r.high} · Lowest {r.low} · {r.count} entries
              </p>
              <ProgressBar value={Number(r.avg)} tone="navy" />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
