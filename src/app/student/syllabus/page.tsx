import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, SectionTitle, ProgressBar } from "@/components/ui";
import { syllabusFor } from "@/lib/queries";

export default async function SyllabusPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const rows = await syllabusFor(st.semester, st.section);
  const subjectNames = [...new Set(rows.map((r) => r.subject))];

  return (
    <>
      <PageHeader title="Syllabus" subtitle={`Semester ${st.semester} coverage`} back="/student" />
      {rows.length === 0 ? (
        <EmptyState icon="book" title="No syllabus uploaded" message="The syllabus for your semester has not been published yet." />
      ) : (
        subjectNames.map((name) => {
          const units = rows.filter((r) => r.subject === name);
          const avg = Math.round(units.reduce((a, u) => a + (u.completion ?? 0), 0) / units.length);
          return (
            <div key={name}>
              <SectionTitle title={name} action={<span className="text-[12px] font-bold text-gold">{avg}% complete</span>} />
              <div className="space-y-2">
                {units.map((u) => (
                  <Card key={u.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-navy text-[14px]">
                        Unit {u.unitNumber} · {u.title}
                      </p>
                      <span className="text-[12px] font-bold text-slate-500">{u.completion}%</span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-1 mb-2">{u.topics}</p>
                    <ProgressBar value={u.completion ?? 0} tone="gold" />
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
