import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { assignments, submissions, subjects, users, students } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Badge, SectionTitle } from "@/components/ui";
import { createAssignmentAction, gradeSubmissionAction } from "@/lib/actions";
import { classStudents, teacherSubjects } from "@/lib/queries";

export default async function TeacherAssignments() {
  const user = await requireUser("teacher");
  const canCreate = !!user.permissions.create_assignment;
  const subs = await teacherSubjects(user.id);
  const subIds = subs.map((s) => s.id);

  const rows = subIds.length
    ? await db
        .select({
          id: assignments.id,
          title: assignments.title,
          dueDate: assignments.dueDate,
          maxMarks: assignments.maxMarks,
          semester: assignments.semester,
          section: assignments.section,
          subject: subjects.name,
        })
        .from(assignments)
        .innerJoin(subjects, eq(subjects.id, assignments.subjectId))
        .where(inArray(assignments.subjectId, subIds))
        .orderBy(desc(assignments.createdAt))
    : [];

  const subRows = rows.length
    ? await db
        .select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          status: submissions.status,
          marks: submissions.marks,
          content: submissions.content,
          fileName: submissions.fileName,
          name: users.fullName,
          roll: students.rollNumber,
        })
        .from(submissions)
        .innerJoin(users, eq(users.id, submissions.studentUserId))
        .leftJoin(students, eq(students.userId, submissions.studentUserId))
        .where(inArray(submissions.assignmentId, rows.map((r) => r.id)))
    : [];

  const classSizes: Record<number, number> = {};
  for (const r of rows) {
    if (classSizes[r.id] === undefined)
      classSizes[r.id] = (await classStudents(r.semester, r.section)).length;
  }

  return (
    <>
      <PageHeader title="Assignments" subtitle="Create, track & evaluate" back="/teacher" />
      {canCreate ? (
        <Card>
          <p className="font-bold text-navy text-[15px] mb-3">Create Assignment</p>
          <form action={createAssignmentAction} className="space-y-3">
            <input name="title" className="input" placeholder="Assignment title" required />
            <select name="subjectId" className="input" required>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — Sem {s.semester} Sec {s.section}
                </option>
              ))}
            </select>
            <textarea name="description" className="input" rows={2} placeholder="Description" />
            <textarea name="instructions" className="input" rows={2} placeholder="Instructions" />
            <div className="grid grid-cols-2 gap-3">
              <input name="semester" type="number" min={1} max={8} className="input" placeholder="Semester" defaultValue={subs[0]?.semester ?? 4} />
              <input name="section" className="input" placeholder="Section" defaultValue={subs[0]?.section ?? "C"} />
              <input name="dueDate" type="date" className="input" required />
              <input name="maxMarks" type="number" className="input" defaultValue={20} />
            </div>
            <select name="priority" className="input">
              <option>Normal</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
            <button className="btn btn-primary w-full">Publish Assignment</button>
          </form>
        </Card>
      ) : (
        <div className="card p-4 text-[13px] text-slate-600 border-l-4 border-l-gold">
          <b className="text-navy">View only.</b> Assignment creation is admin-controlled. Request the
          &ldquo;Create Assignment&rdquo; permission from the administrator.
        </div>
      )}

      <SectionTitle title="Assignments & Submissions" />
      {rows.length === 0 ? (
        <EmptyState icon="doc" title="No assignments" message="No assignments exist for your subjects yet." />
      ) : (
        <div className="space-y-3">
          {rows.map((a) => {
            const subm = subRows.filter((s) => s.assignmentId === a.id);
            const totalStudents = classSizes[a.id] ?? 0;
            const late = subm.filter((s) => s.status === "late").length;
            return (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy text-[15px]">{a.title}</p>
                    <p className="text-[12px] text-slate-500">
                      {a.subject} · Sem {a.semester} Sec {a.section} · Due {a.dueDate}
                    </p>
                  </div>
                  <Badge text={`${a.maxMarks} marks`} tone="grey" />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                  {[
                    ["Total", totalStudents],
                    ["Submitted", subm.length],
                    ["Pending", Math.max(0, totalStudents - subm.length)],
                    ["Late", late],
                  ].map(([l, v]) => (
                    <div key={String(l)} className="rounded-xl bg-slate-50 py-2">
                      <p className="text-[15px] font-extrabold text-navy">{v}</p>
                      <p className="text-[10px] text-slate-500">{l}</p>
                    </div>
                  ))}
                </div>
                {subm.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-[12px] font-semibold text-navy cursor-pointer">
                      View submissions ({subm.length})
                    </summary>
                    <div className="mt-2 space-y-2">
                      {subm.map((s) => (
                        <div key={s.id} className="rounded-xl border border-slate-100 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[13px] font-semibold text-navy">
                              {s.name} <span className="text-slate-400 font-normal">{s.roll}</span>
                            </p>
                            <Badge text={s.status} tone={s.status === "graded" ? "green" : s.status === "late" ? "red" : "navy"} />
                          </div>
                          <p className="text-[12px] text-slate-600 mt-1">{s.content}</p>
                          {s.fileName && <p className="text-[11px] text-gold mt-1">📎 {s.fileName}</p>}
                          {canCreate && (
                            <form action={gradeSubmissionAction} className="mt-2 flex gap-2">
                              <input type="hidden" name="id" value={s.id} />
                              <input name="marks" type="number" defaultValue={s.marks ?? ""} className="input w-20" placeholder="Marks" />
                              <input name="feedback" className="input flex-1" placeholder="Feedback" />
                              <button className="btn btn-primary">Save</button>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
