import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, ProgressBar, SectionTitle } from "@/components/ui";
import { studentAttendanceStats } from "@/lib/queries";

export default async function StudentAttendancePage() {
  const user = await requireUser("student");
  const att = await studentAttendanceStats(user.id);
  return (
    <>
      <PageHeader title="Attendance" subtitle="Subject-wise attendance record" back="/student" />
      <Card>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] text-slate-500 font-medium">Overall Attendance</p>
            <p className="text-4xl font-extrabold text-navy">{att.overall}%</p>
          </div>
          <p className="text-[12px] text-slate-500">
            {att.present} present / {att.total} classes
          </p>
        </div>
        <div className="mt-3">
          <ProgressBar value={att.overall} tone={att.overall < 75 ? "red" : "green"} />
        </div>
        {att.overall < 75 && att.total > 0 && (
          <p className="mt-3 text-[12px] font-semibold text-rose-600">
            ⚠ Your attendance is below the mandatory 75% requirement.
          </p>
        )}
      </Card>

      <SectionTitle title="Subject-wise" />
      {att.rows.length === 0 ? (
        <EmptyState icon="percent" title="No attendance records" message="Attendance will appear once your faculty starts marking classes." />
      ) : (
        <div className="space-y-2">
          {att.rows.map((r) => (
            <Card key={r.subjectId}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-navy text-[14px]">{r.name ?? "Subject"}</p>
                <span
                  className={`text-[13px] font-bold ${r.percent < 75 ? "text-rose-600" : "text-emerald-600"}`}
                >
                  {r.percent}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-2">
                Present {r.present} · Absent {r.total - r.present} · Total {r.total}
              </p>
              <ProgressBar value={r.percent} tone={r.percent < 75 ? "red" : "green"} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
