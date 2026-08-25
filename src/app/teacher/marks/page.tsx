import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { marks, subjects, users } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { PageHeader, Card, EmptyState, SectionTitle } from "@/components/ui";
import { enterMarksAction } from "@/lib/actions";
import { classStudents, teacherSubjects } from "@/lib/queries";

export default async function EnterMarks({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const user = await requireUser("teacher");
  if (!user.permissions.marks) redirect("/teacher");
  const sp = await searchParams;
  const subs = await teacherSubjects(user.id);
  const subject = subs.find((s) => String(s.id) === sp.subjectId) ?? subs[0];
  const list = subject ? await classStudents(subject.semester, subject.section) : [];
  const ids = subs.map((s) => s.id);
  const recent = ids.length
    ? await db
        .select({
          id: marks.id,
          category: marks.category,
          score: marks.score,
          maxScore: marks.maxScore,
          student: users.fullName,
          subject: subjects.name,
        })
        .from(marks)
        .innerJoin(users, eq(users.id, marks.studentUserId))
        .innerJoin(subjects, eq(subjects.id, marks.subjectId))
        .where(inArray(marks.subjectId, ids))
        .orderBy(desc(marks.createdAt))
        .limit(20)
    : [];

  return (
    <>
      <PageHeader title="Enter Marks" subtitle="Internal, quiz, practical & mid-semester" back="/teacher" />
      {subs.length === 0 ? (
        <EmptyState icon="chart" title="No classes assigned" message="You have no assigned subjects." />
      ) : (
        <>
          <Card className="mb-3">
            <form className="grid grid-cols-3 gap-2 items-end">
              <div className="col-span-2">
                <label className="label">Subject</label>
                <select name="subjectId" defaultValue={subject?.id} className="input">
                  {subs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Sem {s.semester} Sec {s.section}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-ghost">Load</button>
            </form>
          </Card>

          {list.length === 0 ? (
            <EmptyState icon="users" title="No students" message="No approved students in this class." />
          ) : (
            <form action={enterMarksAction}>
              <input type="hidden" name="subjectId" value={subject!.id} />
              <input type="hidden" name="studentIds" value={list.map((s) => s.userId).join(",")} />
              <Card className="mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Category</label>
                    <select name="category" className="input">
                      {["Quiz", "Class Test", "Assignment", "Practical", "Mid Semester", "Internal"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Max Score</label>
                    <input name="maxScore" type="number" className="input" defaultValue={20} />
                  </div>
                </div>
              </Card>
              <div className="space-y-2">
                {list.map((s) => (
                  <Card key={s.userId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-[14px] truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.roll}</p>
                    </div>
                    <input
                      name={`score_${s.userId}`}
                      type="number"
                      min={0}
                      defaultValue={0}
                      className="input w-20 text-center"
                    />
                  </Card>
                ))}
              </div>
              <button className="btn btn-primary w-full mt-4">Save Marks</button>
            </form>
          )}

          <SectionTitle title="Recently Entered" />
          {recent.length === 0 ? (
            <EmptyState icon="chart" title="No marks entered" message="Marks you enter will be listed here." />
          ) : (
            <div className="space-y-2">
              {recent.map((m) => (
                <Card key={m.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy text-[14px]">{m.student}</p>
                    <p className="text-[11px] text-slate-500">
                      {m.subject} · {m.category}
                    </p>
                  </div>
                  <p className="font-extrabold text-navy">
                    {m.score}
                    <span className="text-slate-400 text-[12px]">/{m.maxScore}</span>
                  </p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
