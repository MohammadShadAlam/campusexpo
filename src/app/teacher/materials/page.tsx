import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { studyMaterials, subjects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, SectionTitle, Badge } from "@/components/ui";
import { uploadMaterialAction } from "@/lib/actions";
import { teacherSubjects } from "@/lib/queries";

export default async function TeacherMaterials() {
  const user = await requireUser("teacher");
  if (!user.permissions.study_material) redirect("/teacher");
  const subs = await teacherSubjects(user.id);
  const rows = await db
    .select({
      id: studyMaterials.id,
      title: studyMaterials.title,
      category: studyMaterials.category,
      fileName: studyMaterials.fileName,
      subject: subjects.name,
      createdAt: studyMaterials.createdAt,
    })
    .from(studyMaterials)
    .leftJoin(subjects, eq(subjects.id, studyMaterials.subjectId))
    .where(eq(studyMaterials.uploadedByUserId, user.id))
    .orderBy(desc(studyMaterials.createdAt));

  return (
    <>
      <PageHeader title="Study Material" subtitle="Share resources with your classes" back="/teacher" />
      <Card>
        <form action={uploadMaterialAction} className="space-y-3">
          <input name="title" className="input" placeholder="Material title" required />
          <select name="subjectId" className="input" required>
            {subs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — Sem {s.semester} Sec {s.section}
              </option>
            ))}
          </select>
          <select name="category" className="input">
            {["Notes", "PDF", "Presentation", "Lab Manual", "Reference Material", "Previous Year Questions", "Important Questions"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input name="semester" type="number" className="input" defaultValue={subs[0]?.semester ?? 4} />
            <input name="section" className="input" defaultValue={subs[0]?.section ?? "C"} />
          </div>
          <input name="fileName" className="input" placeholder="File name e.g. unit1-notes.pdf" />
          <button className="btn btn-primary w-full" disabled={subs.length === 0}>
            Upload Material
          </button>
        </form>
      </Card>

      <SectionTitle title="My Uploads" />
      {rows.length === 0 ? (
        <EmptyState icon="folder" title="No study material" message="Materials you upload will appear here and in your students' accounts." />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-navy text-[14px] truncate">{r.title}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {r.subject} · {r.fileName}
                </p>
              </div>
              <Badge text={r.category} tone="gold" />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
