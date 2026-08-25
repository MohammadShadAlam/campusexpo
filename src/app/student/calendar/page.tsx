import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { academicCalendar } from "@/db/schema";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";

export default async function CalendarPage() {
  await requireUser("student");
  const rows = await db.select().from(academicCalendar).orderBy(academicCalendar.onDate);
  return (
    <>
      <PageHeader title="Academic Calendar" subtitle="Exams, holidays & events" back="/student" />
      {rows.length === 0 ? (
        <EmptyState icon="calendar" title="No calendar published" message="The academic calendar will appear here once published." />
      ) : (
        <div className="space-y-2">
          {rows.map((e) => (
            <Card key={e.id} className="flex items-center gap-3">
              <div className="w-14 text-center shrink-0">
                <p className="text-[11px] text-slate-400 uppercase">
                  {new Date(e.onDate).toLocaleString("en", { month: "short" })}
                </p>
                <p className="text-xl font-extrabold text-navy">{new Date(e.onDate).getDate()}</p>
              </div>
              <div className="w-px self-stretch bg-slate-100" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-[14px]">{e.title}</p>
                {e.endDate && <p className="text-[11px] text-slate-500">Until {e.endDate}</p>}
              </div>
              <Badge text={e.kind ?? "Event"} tone={e.kind === "Holiday" ? "green" : "gold"} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
