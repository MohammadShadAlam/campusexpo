import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, SectionTitle, ProgressBar } from "@/components/ui";
import { studentResults } from "@/lib/queries";

export default async function ResultsPage() {
  const user = await requireUser("student");
  const rows = await studentResults(user.id);
  const semesters = [...new Set(rows.map((r) => r.semester))].sort();

  const sgpa = (sem: number) => {
    const list = rows.filter((r) => r.semester === sem);
    if (!list.length) return "0.00";
    const avg = list.reduce((a, r) => a + Number(r.gradePoint ?? 0), 0) / list.length;
    return avg.toFixed(2);
  };
  const cgpa = rows.length
    ? (rows.reduce((a, r) => a + Number(r.gradePoint ?? 0), 0) / rows.length).toFixed(2)
    : "0.00";
  const backlogs = rows.filter((r) => (r.internal ?? 0) + (r.external ?? 0) < 40).length;

  return (
    <>
      <PageHeader title="Results" subtitle="Semester-wise academic performance" back="/student" />
      {rows.length === 0 ? (
        <EmptyState icon="chart" title="No results published" message="Your semester results have not been published yet." />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <p className="text-[11px] text-slate-500">CGPA</p>
              <p className="text-2xl font-extrabold text-navy">{cgpa}</p>
            </Card>
            <Card className="text-center">
              <p className="text-[11px] text-slate-500">Subjects</p>
              <p className="text-2xl font-extrabold text-navy">{rows.length}</p>
            </Card>
            <Card className="text-center">
              <p className="text-[11px] text-slate-500">Backlogs</p>
              <p className={`text-2xl font-extrabold ${backlogs ? "text-rose-600" : "text-emerald-600"}`}>
                {backlogs}
              </p>
            </Card>
          </div>

          {semesters.map((sem) => (
            <div key={sem}>
              <SectionTitle title={`Semester ${sem}`} action={<span className="text-[12px] font-bold text-gold">SGPA {sgpa(sem)}</span>} />
              <div className="space-y-2">
                {rows
                  .filter((r) => r.semester === sem)
                  .map((r) => {
                    const total = (r.internal ?? 0) + (r.external ?? 0);
                    return (
                      <Card key={r.id}>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-navy text-[14px] truncate">{r.subjectName}</p>
                            <p className="text-[11px] text-slate-500">
                              {r.subjectCode} · Internal {r.internal} · External {r.external}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-lg font-extrabold text-navy">{r.grade}</p>
                            <p className="text-[11px] text-slate-500">{total}/100</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={total} tone={total < 40 ? "red" : "navy"} />
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
