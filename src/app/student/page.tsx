import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Card, QuickAction, SectionTitle, StatCard, EmptyState, Badge } from "@/components/ui";
import {
  greeting,
  studentAttendanceStats,
  todayClasses,
  studentAssignments,
  studentNotices,
  unreadCount,
} from "@/lib/queries";

export default async function StudentHome() {
  const user = await requireUser("student");
  const st = user.student!;
  const [att, classes, asg, notices, unread] = await Promise.all([
    studentAttendanceStats(user.id),
    todayClasses(st.semester, st.section),
    studentAssignments(user.id, st.semester, st.section),
    studentNotices(st.semester),
    unreadCount(user.id),
  ]);
  const pending = asg.filter((a) => !a.submissionId).length;
  const progress = Math.round((st.semester / 8) * 100);

  return (
    <>
      <AppHeader
        greeting={greeting()}
        name={user.fullName}
        roleLabel="Student"
        meta={`${st.course} • Sem ${st.semester} • Sec ${st.section}`}
        unread={unread}
      />

      <SectionTitle title="Academic Overview" />
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="percent" label="Attendance" value={`${att.overall}%`} sub={att.overall < 75 ? "Low" : "Good"} tone={att.overall < 75 ? "gold" : "green"} />
        <StatCard icon="chart" label="CGPA" value={st.cgpa ?? "0.0"} sub="/ 10" tone="navy" />
        <StatCard icon="doc" label="Pending Assignments" value={pending} sub="To submit" tone="purple" />
        <StatCard icon="pulse" label="Semester Progress" value={`${progress}%`} sub={`Sem ${st.semester}`} tone="gold" />
      </div>

      <SectionTitle title="Quick Access" />
      <div className="grid grid-cols-4 gap-3">
        <QuickAction href="/student/results" icon="chart" label="Result" tone="navy" />
        <QuickAction href="/student/syllabus" icon="book" label="Syllabus" tone="purple" />
        <QuickAction href="/student/assignments" icon="doc" label="Assignments" tone="gold" />
        <QuickAction href="/student/attendance" icon="percent" label="Attendance" tone="green" />
        <QuickAction href="/student/timetable" icon="clock" label="Timetable" tone="navy" />
        <QuickAction href="/student/materials" icon="folder" label="Study Material" tone="purple" />
        <QuickAction href="/student/doubts" icon="chat" label="Doubts" tone="rose" />
        <QuickAction href="/student/leave" icon="calendar" label="Leave" tone="gold" />
      </div>

      <SectionTitle
        title="Today's Classes"
        action={
          <Link href="/student/timetable" className="text-[12px] font-semibold text-navy">
            View all
          </Link>
        }
      />
      {classes.length === 0 ? (
        <EmptyState icon="clock" title="No classes today" message="Enjoy your day — no lectures are scheduled on the timetable." />
      ) : (
        <div className="space-y-2">
          {classes.map((c) => (
            <Card key={c.id} className="flex items-center gap-3">
              <div className="w-16 shrink-0 text-center">
                <p className="text-[13px] font-bold text-navy">{c.start}</p>
                <p className="text-[10px] text-slate-400">{c.end}</p>
              </div>
              <div className="w-px self-stretch bg-slate-100" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy text-[14px] truncate">{c.subject}</p>
                <p className="text-[12px] text-slate-500 truncate">
                  {c.faculty ?? "Faculty TBA"} · Room {c.room}
                </p>
              </div>
              <Badge text={c.type ?? "Lecture"} tone="grey" />
            </Card>
          ))}
        </div>
      )}

      <SectionTitle
        title="Recent Notices"
        action={
          <Link href="/student/notices" className="text-[12px] font-semibold text-navy">
            View all
          </Link>
        }
      />
      {notices.length === 0 ? (
        <EmptyState icon="megaphone" title="No notices yet" message="College announcements will appear here." />
      ) : (
        <div className="space-y-2">
          {notices.slice(0, 4).map((n) => (
            <Card key={n.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-navy text-[14px]">{n.title}</p>
                <Badge text={n.category} tone={n.priority === "Urgent" ? "red" : "gold"} />
              </div>
              <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
