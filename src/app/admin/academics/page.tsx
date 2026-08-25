import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { subjects, users, timetable, syllabusUnits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, SectionTitle, Badge, ProgressBar } from "@/components/ui";
import { createSubjectAction } from "@/lib/actions";

export default async function AdminAcademics() {
  await requireUser("admin");
  const [subs, faculty, tt, syl] = await Promise.all([
    db
      .select({
        id: subjects.id,
        code: subjects.code,
        name: subjects.name,
        semester: subjects.semester,
        section: subjects.section,
        department: subjects.department,
        faculty: users.fullName,
      })
      .from(subjects)
      .leftJoin(users, eq(users.id, subjects.teacherUserId))
      .orderBy(subjects.semester, subjects.code),
    db.select({ id: users.id, name: users.fullName }).from(users).where(eq(users.role, "teacher")),
    db
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
      .orderBy(timetable.dayOfWeek, timetable.startTime),
    db
      .select({
        id: syllabusUnits.id,
        unit: syllabusUnits.unitNumber,
        title: syllabusUnits.title,
        completion: syllabusUnits.completion,
        subject: subjects.name,
      })
      .from(syllabusUnits)
      .innerJoin(subjects, eq(subjects.id, syllabusUnits.subjectId))
      .orderBy(subjects.name, syllabusUnits.unitNumber),
  ]);

  const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="py-6">
      <PageHeader title="Academics" subtitle="Subjects, timetable & syllabus" back="/admin" />

      <Card>
        <p className="font-bold text-navy text-[15px] mb-3">Create Subject</p>
        <form action={createSubjectAction} className="grid md:grid-cols-3 gap-3">
          <input name="code" className="input" placeholder="Code e.g. CS401" required />
          <input name="name" className="input md:col-span-2" placeholder="Subject name" required />
          <input name="department" className="input md:col-span-2" placeholder="Department" defaultValue="Computer Science & Engineering" />
          <select name="teacherUserId" className="input">
            <option value="">Assign faculty…</option>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <input name="semester" type="number" min={1} max={8} className="input" defaultValue={4} />
          <input name="section" className="input" defaultValue="C" />
          <button className="btn btn-primary">Add Subject</button>
        </form>
      </Card>

      <SectionTitle title="Subjects" />
      {subs.length === 0 ? (
        <EmptyState icon="book" title="No subjects" message="Create the first subject to begin." />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {subs.map((s) => (
            <Card key={s.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-navy text-[14px]">{s.name}</p>
                <p className="text-[11px] text-slate-500">
                  {s.code} · Sem {s.semester} Sec {s.section} · {s.faculty ?? "Unassigned"}
                </p>
              </div>
              <Badge text={`Sem ${s.semester}`} tone="grey" />
            </Card>
          ))}
        </div>
      )}

      <div id="timetable" />
      <SectionTitle title="Official Timetable" />
      {tt.length === 0 ? (
        <EmptyState icon="clock" title="No timetable" message="No classes scheduled yet." />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {tt.map((t) => (
            <Card key={t.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-navy text-[14px]">{t.subject}</p>
                <p className="text-[11px] text-slate-500">
                  {DAYS[t.day]} {t.start}–{t.end} · Room {t.room} · Sem {t.semester} Sec {t.section}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div id="syllabus" />
      <SectionTitle title="Syllabus Coverage" />
      {syl.length === 0 ? (
        <EmptyState icon="layers" title="No syllabus" message="Syllabus units have not been added." />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {syl.map((u) => (
            <Card key={u.id}>
              <div className="flex justify-between">
                <p className="font-semibold text-navy text-[14px]">
                  {u.subject} · Unit {u.unit}
                </p>
                <span className="text-[12px] font-bold text-gold">{u.completion}%</span>
              </div>
              <p className="text-[12px] text-slate-500 mb-2">{u.title}</p>
              <ProgressBar value={u.completion ?? 0} tone="gold" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
