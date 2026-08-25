import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { doubts, subjects, users } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";
import { answerDoubtAction } from "@/lib/actions";
import { teacherSubjects } from "@/lib/queries";

export default async function TeacherDoubts() {
  const user = await requireUser("teacher");
  if (!user.permissions.doubts) redirect("/teacher");
  const subs = await teacherSubjects(user.id);
  const ids = subs.map((s) => s.id);
  const rows = ids.length
    ? await db
        .select({
          id: doubts.id,
          question: doubts.question,
          answer: doubts.answer,
          status: doubts.status,
          subject: subjects.name,
          student: users.fullName,
          createdAt: doubts.createdAt,
        })
        .from(doubts)
        .innerJoin(subjects, eq(subjects.id, doubts.subjectId))
        .innerJoin(users, eq(users.id, doubts.studentUserId))
        .where(inArray(doubts.subjectId, ids))
        .orderBy(desc(doubts.createdAt))
    : [];

  const groups: { key: string; label: string }[] = [
    { key: "new", label: "New" },
    { key: "answered", label: "Answered" },
    { key: "resolved", label: "Resolved" },
  ];

  return (
    <>
      <PageHeader title="Doubts" subtitle="Respond to student questions" back="/teacher" />
      {rows.length === 0 ? (
        <EmptyState icon="chat" title="No doubts" message="Your students haven't asked any questions yet." />
      ) : (
        groups.map((g) => {
          const items = rows.filter((r) => r.status === g.key);
          if (!items.length) return null;
          return (
            <div key={g.key} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-bold text-navy text-[15px]">{g.label}</h2>
                <Badge text={`${items.length}`} tone="grey" />
              </div>
              <div className="space-y-2">
                {items.map((d) => (
                  <Card key={d.id}>
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-navy text-[14px]">{d.student}</p>
                      <Badge text={d.subject} tone="navy" />
                    </div>
                    <p className="text-[13px] text-slate-600 mt-1">{d.question}</p>
                    {d.answer && (
                      <div className="mt-2 rounded-xl bg-[#eef2fb] p-3 text-[13px] text-slate-700">{d.answer}</div>
                    )}
                    {d.status === "new" && (
                      <form action={answerDoubtAction} className="mt-2 flex gap-2">
                        <input type="hidden" name="id" value={d.id} />
                        <input name="answer" className="input flex-1" placeholder="Write your response…" required />
                        <button className="btn btn-primary">Reply</button>
                      </form>
                    )}
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
