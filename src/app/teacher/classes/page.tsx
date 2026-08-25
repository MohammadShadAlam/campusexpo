import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, SectionTitle, Badge } from "@/components/ui";
import { classStudents, teacherSubjects } from "@/lib/queries";

export default async function TeacherClasses() {
  const user = await requireUser("teacher");
  const subs = await teacherSubjects(user.id);
  const data = await Promise.all(
    subs.map(async (s) => ({ subject: s, list: await classStudents(s.semester, s.section) })),
  );

  return (
    <>
      <PageHeader title="My Classes" subtitle="Assigned subjects & student lists" back="/teacher" />
      {subs.length === 0 ? (
        <EmptyState icon="users" title="No classes assigned" message="The administrator has not assigned any subjects to you yet." />
      ) : (
        data.map(({ subject, list }) => (
          <div key={subject.id}>
            <SectionTitle
              title={`${subject.name}`}
              action={<Badge text={`Sem ${subject.semester} · Sec ${subject.section}`} tone="grey" />}
            />
            {list.length === 0 ? (
              <EmptyState icon="users" title="No students" message="No approved students in this class." />
            ) : (
              <div className="space-y-2">
                {list.map((s) => (
                  <Card key={s.userId} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#eef2fb] text-navy grid place-items-center font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy text-[14px] truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {s.roll} · {s.email}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
}
