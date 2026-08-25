import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { leaveRequests, assignments, attendance, subjects, timetable, doubts } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { AppHeader } from "@/components/AppHeader";
import { Card, QuickAction, SectionTitle, StatCard, EmptyState, Badge } from "@/components/ui";
import { greeting, teacherSubjects, unreadCount } from "@/lib/queries";

export default async function TeacherHome() {
  const user = await requireUser("teacher");
  const p = user.permissions;
  const subs = await teacherSubjects(user.id);
  const subIds = subs.map((s) => s.id);
  const day = new Date().getDay() === 0 ? 1 : new Date().getDay();

  const [pendingLeaves, todays, attRows, activeAsg, unread, newDoubts] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(leaveRequests).where(eq(leaveRequests.status, "pending")),
    subIds.length
      ? db
          .select({
            id: timetable.id,
            start: timetable.startTime,
            end: timetable.endTime,
            room: timetable.room,
            semester: timetable.semester,
            section: timetable.section,
            subject: subjects.name,
          })
          .from(timetable)
          .innerJoin(subjects, eq(subjects.id, timetable.subjectId))
          .where(and(eq(timetable.dayOfWeek, day), inArray(timetable.subjectId, subIds)))
          .orderBy(timetable.startTime)
      : [],
    subIds.length
      ? db
          .select({
            total: sql<number>`count(*)::int`,
            present: sql<number>`sum(case when ${attendance.status} <> 'absent' then 1 else 0 end)::int`,
          })
          .from(attendance)
          .where(inArray(attendance.subjectId, subIds))
      : [],
    subIds.length
      ? db.select({ c: sql<number>`count(*)::int` }).from(assignments).where(inArray(assignments.subjectId, subIds))
      : [],
    unreadCount(user.id),
    subIds.length
      ? db.select({ c: sql<number>`count(*)::int` }).from(doubts).where(and(inArray(doubts.subjectId, subIds), eq(doubts.status, "new")))
      : [],
  ]);

  const total = Number(attRows[0]?.total ?? 0);
  const present = Number(attRows[0]?.present ?? 0);
  const avgAtt = total ? Math.round((present / total) * 100) : 0;

  return (
    <>
      <AppHeader
        greeting={greeting()}
        name={user.fullName}
        roleLabel="Faculty"
        meta={`${user.teacher?.designation} · ${user.department}`}
        unread={unread}
      />

      <SectionTitle title="Overview" />
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="clipboard" label="Pending Leaves" value={Number(pendingLeaves[0]?.c ?? 0)} sub="Require action" tone="gold" />
        <StatCard icon="users" label="Today's Classes" value={todays.length} sub="Scheduled" tone="navy" />
        <StatCard icon="percent" label="Avg Attendance" value={`${avgAtt}%`} sub="All sections" tone="green" />
        <StatCard icon="pulse" label="Active Tasks" value={Number(activeAsg[0]?.c ?? 0)} sub="Assignments" tone="purple" />
      </div>

      <SectionTitle title="Quick Actions" />
      <div className="grid grid-cols-4 gap-3">
        <QuickAction href="/teacher/attendance" icon="clipboard" label="Take Attendance" disabled={!p.attendance} />
        <QuickAction href="/teacher/leaves" icon="check" label="Approve Leave" tone="gold" disabled={!p.approve_leave} />
        <QuickAction href="/teacher/communication" icon="megaphone" label="Announcement" tone="rose" disabled={!p.announcement} />
        <QuickAction href="/teacher/assignments" icon="doc" label="Assignments" tone="purple" />
        <QuickAction href="/teacher/materials" icon="folder" label="Study Material" disabled={!p.study_material} />
        <QuickAction href="/teacher/communication#broadcast" icon="send" label="Broadcast" tone="gold" disabled={!p.broadcast} />
        <QuickAction href="/teacher/timetable" icon="calendar" label="Timetable" tone="green" />
        <QuickAction href="/teacher/doubts" icon="chat" label="Doubts" tone="rose" disabled={!p.doubts} />
      </div>

      <SectionTitle title="More Tools" />
      <div className="grid grid-cols-4 gap-3">
        <QuickAction href="/teacher/marks" icon="chart" label="Enter Marks" disabled={!p.marks} />
        <QuickAction href="/teacher/assignments" icon="doc" label="Submissions" tone="purple" />
        <QuickAction href="/teacher/performance" icon="pulse" label="Performance" tone="green" disabled={!p.performance} />
        <QuickAction href="/teacher/classes" icon="users" label="Student List" tone="navy" disabled={!p.student_data} />
      </div>

      <SectionTitle
        title="Today's Schedule"
        action={
          <Link href="/teacher/timetable" className="text-[12px] font-semibold text-navy">
            View all
          </Link>
        }
      />
      {todays.length === 0 ? (
        <EmptyState icon="clock" title="No classes today" message="You have no lectures scheduled for today." />
      ) : (
        <div className="space-y-2">
          {todays.map((c) => (
            <Card key={c.id} className="flex items-center gap-3">
              <div className="w-16 text-center shrink-0">
                <p className="text-[13px] font-bold text-navy">{c.start}</p>
                <p className="text-[10px] text-slate-400">{c.end}</p>
              </div>
              <div className="w-px self-stretch bg-slate-100" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-[14px] truncate">{c.subject}</p>
                <p className="text-[12px] text-slate-500">
                  Sem {c.semester} · Sec {c.section} · Room {c.room}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {Number(newDoubts[0]?.c ?? 0) > 0 && (
        <div className="mt-4">
          <Link href="/teacher/doubts">
            <Card className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-navy">
                {newDoubts[0].c} new student doubt(s) awaiting your response
              </p>
              <Badge text="Open" tone="gold" />
            </Card>
          </Link>
        </div>
      )}
    </>
  );
}
