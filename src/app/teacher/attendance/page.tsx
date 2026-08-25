import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";
import { classStudents, teacherSubjects } from "@/lib/queries";
import { submitAttendanceAction } from "@/lib/actions";

export default async function TakeAttendance({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string; date?: string; period?: string; done?: string }>;
}) {
  const user = await requireUser("teacher");
  if (!user.permissions.attendance) redirect("/teacher?denied=attendance");
  const sp = await searchParams;
  const subs = await teacherSubjects(user.id);
  const subject = subs.find((s) => String(s.id) === sp.subjectId) ?? subs[0];
  const date = sp.date ?? new Date().toISOString().slice(0, 10);
  const period = sp.period ?? "1";
  const list = subject ? await classStudents(subject.semester, subject.section) : [];

  return (
    <>
      <PageHeader title="Take Attendance" subtitle="Mark and submit class attendance" back="/teacher" />
      {sp.done && (
        <div className="card p-3 mb-3 border-l-4 border-l-emerald-500 text-[13px] font-semibold text-emerald-700">
          Attendance submitted successfully. Student records updated.
        </div>
      )}
      {subs.length === 0 ? (
        <EmptyState icon="users" title="No classes assigned" message="The administrator has not assigned any subjects to you yet." />
      ) : (
        <>
          <Card>
            <form className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Subject / Class</label>
                <select name="subjectId" defaultValue={subject?.id} className="input">
                  {subs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Sem {s.semester} Sec {s.section}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" name="date" defaultValue={date} className="input" />
              </div>
              <div>
                <label className="label">Period</label>
                <select name="period" defaultValue={period} className="input">
                  {["1", "2", "3", "4", "5", "6"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-ghost col-span-2">Load Class</button>
            </form>
          </Card>

          {list.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon="users" title="No students found" message="No approved students are enrolled in this class yet." />
            </div>
          ) : (
            <form action={submitAttendanceAction} className="mt-4">
              <input type="hidden" name="subjectId" value={subject!.id} />
              <input type="hidden" name="onDate" value={date} />
              <input type="hidden" name="period" value={period} />
              <input type="hidden" name="studentIds" value={list.map((s) => s.userId).join(",")} />
              <div className="flex items-center justify-between mb-2">
                <Badge text={`${list.length} students`} tone="grey" />
                <p className="text-[11px] text-slate-500">Default: all present</p>
              </div>
              <div className="space-y-2">
                {list.map((s) => (
                  <Card key={s.userId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-[14px] truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.roll}</p>
                    </div>
                    <div className="flex gap-1">
                      {[
                        { v: "present", l: "P" },
                        { v: "absent", l: "A" },
                        { v: "late", l: "L" },
                      ].map((o) => (
                        <label key={o.v} className="cursor-pointer">
                          <input
                            type="radio"
                            name={`status_${s.userId}`}
                            value={o.v}
                            defaultChecked={o.v === "present"}
                            className="peer sr-only"
                          />
                          <span className="w-9 h-9 grid place-items-center rounded-xl border border-slate-200 text-[12px] font-bold text-slate-500 peer-checked:bg-navy peer-checked:text-white peer-checked:border-navy">
                            {o.l}
                          </span>
                        </label>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
              <button className="btn btn-primary w-full mt-4">Submit Attendance</button>
            </form>
          )}
        </>
      )}
    </>
  );
}
