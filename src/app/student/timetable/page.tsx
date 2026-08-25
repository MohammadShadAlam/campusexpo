import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, SectionTitle, Badge } from "@/components/ui";
import { weeklyTimetable } from "@/lib/queries";

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function StudentTimetable() {
  const user = await requireUser("student");
  const st = user.student!;
  const rows = await weeklyTimetable(st.semester, st.section);
  const today = new Date().getDay() === 0 ? 1 : new Date().getDay();

  return (
    <>
      <PageHeader title="Timetable" subtitle={`Semester ${st.semester} • Section ${st.section}`} back="/student" />
      {rows.length === 0 ? (
        <EmptyState icon="clock" title="No timetable published" message="The administrator has not published the timetable for your class yet." />
      ) : (
        [1, 2, 3, 4, 5, 6].map((d) => {
          const items = rows.filter((r) => r.day === d);
          if (!items.length) return null;
          return (
            <div key={d}>
              <SectionTitle
                title={DAYS[d]}
                action={d === today ? <Badge text="Today" tone="gold" /> : undefined}
              />
              <div className="space-y-2">
                {items.map((c) => (
                  <Card key={c.id} className="flex items-center gap-3">
                    <div className="w-16 text-center shrink-0">
                      <p className="text-[13px] font-bold text-navy">{c.start}</p>
                      <p className="text-[10px] text-slate-400">{c.end}</p>
                    </div>
                    <div className="w-px self-stretch bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-[14px] truncate">{c.subject}</p>
                      <p className="text-[12px] text-slate-500 truncate">
                        {c.faculty ?? "Faculty TBA"} · Room {c.room}
                      </p>
                    </div>
                    <Badge text={c.type ?? "Lecture"} tone="grey" />
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
