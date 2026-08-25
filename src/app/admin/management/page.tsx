import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { notices, results, users, students, academicCalendar, studyMaterials, assignments } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { PageHeader, Card, EmptyState, SectionTitle, Badge } from "@/components/ui";
import { createNoticeAction, publishResultAction } from "@/lib/actions";

export default async function AdminManagement() {
  await requireUser("admin");
  const [noticeRows, studentRows, resultRows, calRows, matCount, asgCount] = await Promise.all([
    db.select().from(notices).orderBy(desc(notices.createdAt)).limit(20),
    db
      .select({ id: users.id, name: users.fullName, roll: students.rollNumber })
      .from(users)
      .innerJoin(students, eq(students.userId, users.id))
      .where(eq(users.status, "approved")),
    db
      .select({
        id: results.id,
        subjectName: results.subjectName,
        grade: results.grade,
        semester: results.semester,
        student: users.fullName,
      })
      .from(results)
      .innerJoin(users, eq(users.id, results.studentUserId))
      .orderBy(desc(results.id))
      .limit(15),
    db.select().from(academicCalendar).orderBy(academicCalendar.onDate),
    db.select({ c: sql<number>`count(*)::int` }).from(studyMaterials),
    db.select({ c: sql<number>`count(*)::int` }).from(assignments),
  ]);

  return (
    <div className="py-6">
      <PageHeader title="Content Management" subtitle="Notices, results, calendar & materials" back="/admin" />

      <div className="grid grid-cols-3 gap-3 mb-2">
        <Card className="text-center">
          <p className="text-[11px] text-slate-500">Notices</p>
          <p className="text-2xl font-extrabold text-navy">{noticeRows.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[11px] text-slate-500">Study Materials</p>
          <p className="text-2xl font-extrabold text-navy">{Number(matCount[0]?.c ?? 0)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[11px] text-slate-500">Assignments</p>
          <p className="text-2xl font-extrabold text-navy">{Number(asgCount[0]?.c ?? 0)}</p>
        </Card>
      </div>

      <div id="notice" />
      <SectionTitle title="Create Notice" />
      <Card>
        <form action={createNoticeAction} className="grid md:grid-cols-2 gap-3">
          <input name="title" className="input md:col-span-2" placeholder="Notice title" required />
          <textarea name="message" rows={3} className="input md:col-span-2" placeholder="Message" required />
          <select name="category" className="input">
            {["Academic", "Examination", "Assignment", "Events", "General", "Urgent"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select name="priority" className="input">
            <option>Normal</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
          <input name="semester" type="number" className="input" placeholder="Semester (blank = all)" />
          <input name="section" className="input" placeholder="Section (blank = all)" />
          <button className="btn btn-primary md:col-span-2">Publish Notice</button>
        </form>
      </Card>

      <SectionTitle title="Published Notices" />
      {noticeRows.length === 0 ? (
        <EmptyState icon="megaphone" title="No notices" message="Published notices will be listed here." />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {noticeRows.map((n) => (
            <Card key={n.id}>
              <div className="flex justify-between gap-2">
                <p className="font-semibold text-navy text-[14px]">{n.title}</p>
                <Badge text={n.category} tone={n.priority === "Urgent" ? "red" : "gold"} />
              </div>
              <p className="text-[12px] text-slate-600 mt-1">{n.message}</p>
            </Card>
          ))}
        </div>
      )}

      <div id="results" />
      <SectionTitle title="Publish Result" />
      <Card>
        <form action={publishResultAction} className="grid md:grid-cols-3 gap-3">
          <select name="studentUserId" className="input md:col-span-3" required>
            {studentRows.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.roll})
              </option>
            ))}
          </select>
          <input name="subjectCode" className="input" placeholder="Subject code" required />
          <input name="subjectName" className="input md:col-span-2" placeholder="Subject name" required />
          <input name="semester" type="number" className="input" placeholder="Semester" defaultValue={4} />
          <input name="internal" type="number" className="input" placeholder="Internal" defaultValue={25} />
          <input name="external" type="number" className="input" placeholder="External" defaultValue={55} />
          <input name="grade" className="input" placeholder="Grade" defaultValue="A" />
          <input name="gradePoint" className="input" placeholder="Grade point" defaultValue="9" />
          <button className="btn btn-primary">Publish Result</button>
        </form>
      </Card>

      {resultRows.length > 0 && (
        <>
          <SectionTitle title="Recent Results" />
          <div className="grid md:grid-cols-2 gap-3">
            {resultRows.map((r) => (
              <Card key={r.id} className="flex justify-between">
                <div>
                  <p className="font-semibold text-navy text-[14px]">{r.student}</p>
                  <p className="text-[11px] text-slate-500">
                    {r.subjectName} · Sem {r.semester}
                  </p>
                </div>
                <p className="font-extrabold text-navy">{r.grade}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      <div id="calendar" />
      <SectionTitle title="Academic Calendar" />
      {calRows.length === 0 ? (
        <EmptyState icon="calendar" title="No calendar entries" message="Add semester dates, exams and holidays." />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {calRows.map((c) => (
            <Card key={c.id} className="flex justify-between">
              <p className="font-semibold text-navy text-[14px]">{c.title}</p>
              <span className="text-[12px] text-slate-500">{c.onDate}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
