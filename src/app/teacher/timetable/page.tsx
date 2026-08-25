import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { timetable, subjects } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { PageHeader, Card, EmptyState, SectionTitle, Badge } from "@/components/ui";
import { teacherSubjects } from "@/lib/queries";

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function TeacherTimetable() {
  const user = await requireUser("teacher");
  const subs = await teacherSubjects(user.id);
  const ids = subs.map((s) => s.id);
  const rows = ids.length
    ? await db
        .select({
          id: timetable.id,
          day: timetable.dayOfWeek,
          start: timetable.startTime,
          end: timetable.endTime,
          room: timetable.room,
          semester: timetable.semester,
          section: timetable.section,
          subject: subjects.name,
        })
        .from(timetable)
        .innerJoin(subjects, eq(subjects.id, timetable.subjectId))
        .where(inArray(timetable.subjectId, ids))
        .orderBy(timetable.dayOfWeek, timetable.startTime)
    : [];
  const today = new Date().getDay() === 0 ? 1 : new Date().getDay();

  return (
    <>
      <PageHeader title="Timetable" subtitle="Your weekly teaching schedule" back="/teacher" />
      <p className="text-[12px] text-slate-500 mb-3">
        The official timetable is maintained by the administration.
      </p>
      {rows.length === 0 ? (
        <EmptyState icon="clock" title="No timetable" message="No classes have been scheduled for your subjects." />
      ) : (
        [1, 2, 3, 4, 5, 6].map((d) => {
          const items = rows.filter((r) => r.day === d);
          if (!items.length) return null;
          return (
            <div key={d}>
              <SectionTitle title={DAYS[d]} action={d === today ? <Badge text="Today" tone="gold" /> : undefined} />
              <div className="space-y-2">
                {items.map((c) => (
                  <Card key={c.id} className="flex items-center gap-3">
                    <div className="w-16 text-center shrink-0">
                      <p className="text-[13px] font-bold text-navy">{c.start}</p>
                      <p className="text-[10px] text-slate-400">{c.end}</p>
                    </div>
                    <div className="w-px self-stretch bg-slate-100" />
                    <div className="min-w-0">
                      <p className="font-semibold text-navy text-[14px] truncate">{c.subject}</p>
                      <p className="text-[12px] text-slate-500">
                        Sem {c.semester} · Sec {c.section} · Room {c.room}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
