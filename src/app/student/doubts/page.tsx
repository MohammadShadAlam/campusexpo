import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, Badge, SectionTitle } from "@/components/ui";
import { semesterSubjects, studentDoubts } from "@/lib/queries";
import { askDoubtAction, resolveDoubtAction } from "@/lib/actions";

export default async function DoubtsPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const [subs, rows] = await Promise.all([
    semesterSubjects(st.semester, st.section),
    studentDoubts(user.id),
  ]);

  return (
    <>
      <PageHeader title="Doubts" subtitle="Ask your faculty directly" back="/student" />
      <Card>
        <form action={askDoubtAction} className="space-y-3">
          <div>
            <label className="label">Subject</label>
            <select name="subjectId" className="input" required>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Your Question</label>
            <textarea name="question" rows={3} className="input" required placeholder="Describe your doubt…" />
          </div>
          <button className="btn btn-primary w-full" disabled={subs.length === 0}>
            Submit Doubt
          </button>
        </form>
      </Card>

      <SectionTitle title="My Doubts" />
      {rows.length === 0 ? (
        <EmptyState icon="chat" title="No doubts yet" message="Ask your first question and your faculty will respond here." />
      ) : (
        <div className="space-y-2">
          {rows.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-navy text-[14px]">{d.subject}</p>
                <Badge
                  text={d.status}
                  tone={d.status === "resolved" ? "green" : d.status === "answered" ? "navy" : "gold"}
                />
              </div>
              <p className="text-[13px] text-slate-600 mt-1">{d.question}</p>
              {d.answer && (
                <div className="mt-2 rounded-xl bg-[#eef2fb] p-3">
                  <p className="text-[11px] font-bold text-navy">Faculty response</p>
                  <p className="text-[13px] text-slate-700 mt-1">{d.answer}</p>
                </div>
              )}
              {d.status === "answered" && (
                <form action={resolveDoubtAction} className="mt-2">
                  <input type="hidden" name="id" value={d.id} />
                  <button className="btn btn-ghost text-[12px] py-1.5">Mark as resolved</button>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
