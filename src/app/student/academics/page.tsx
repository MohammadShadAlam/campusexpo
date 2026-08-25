import { requireUser } from "@/lib/auth";
import { PageHeader, Card, QuickAction, SectionTitle, EmptyState } from "@/components/ui";
import { semesterSubjects } from "@/lib/queries";

export default async function AcademicsPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const subs = await semesterSubjects(st.semester, st.section);
  return (
    <>
      <PageHeader title="Academics" subtitle={`Semester ${st.semester} • Section ${st.section}`} back="/student" />
      <div className="grid grid-cols-4 gap-3">
        <QuickAction href="/student/results" icon="chart" label="Result" />
        <QuickAction href="/student/syllabus" icon="book" label="Syllabus" tone="purple" />
        <QuickAction href="/student/attendance" icon="percent" label="Attendance" tone="green" />
        <QuickAction href="/student/timetable" icon="clock" label="Timetable" tone="gold" />
        <QuickAction href="/student/materials" icon="folder" label="Materials" tone="purple" />
        <QuickAction href="/student/notices" icon="megaphone" label="Notices" tone="rose" />
        <QuickAction href="/student/calendar" icon="calendar" label="Calendar" tone="navy" />
        <QuickAction href="/student/doubts" icon="chat" label="Doubts" tone="gold" />
      </div>

      <SectionTitle title="Registered Subjects" />
      {subs.length === 0 ? (
        <EmptyState icon="book" title="No subjects assigned" message="Your subject registration is not complete yet." />
      ) : (
        <div className="space-y-2">
          {subs.map((s) => (
            <Card key={s.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy text-[14px]">{s.name}</p>
                <p className="text-[12px] text-slate-500">
                  {s.code} · {s.faculty ?? "Faculty TBA"}
                </p>
              </div>
              <span className="text-[12px] font-bold text-gold">{s.credits} cr</span>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
