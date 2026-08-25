import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";
import { studentAssignments } from "@/lib/queries";
import { submitAssignmentAction } from "@/lib/actions";

export default async function StudentAssignments() {
  const user = await requireUser("student");
  const st = user.student!;
  const rows = await studentAssignments(user.id, st.semester, st.section);
  const now = new Date();

  const state = (r: (typeof rows)[number]) => {
    if (r.submissionStatus === "graded") return { label: "Completed", tone: "green" };
    if (r.submissionId) return { label: r.submissionStatus === "late" ? "Late" : "Submitted", tone: "navy" };
    if (new Date(r.dueDate) < now) return { label: "Overdue", tone: "red" };
    return { label: "Pending", tone: "gold" };
  };

  const counts = {
    pending: rows.filter((r) => state(r).label === "Pending").length,
    submitted: rows.filter((r) => state(r).label === "Submitted").length,
    completed: rows.filter((r) => state(r).label === "Completed").length,
    overdue: rows.filter((r) => state(r).label === "Overdue").length,
  };

  return (
    <>
      <PageHeader title="Assignments" subtitle={`Semester ${st.semester} • Section ${st.section}`} back="/student" />
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="card p-2 text-center">
            <p className="text-xl font-extrabold text-navy">{v}</p>
            <p className="text-[10px] text-slate-500 capitalize">{k}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="doc"
          title="No assignments yet"
          message="Your teacher hasn't uploaded any assignments for this subject."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const st2 = state(r);
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy text-[15px]">{r.title}</p>
                    <p className="text-[12px] text-slate-500">
                      {r.subject} · Due {r.dueDate} · Max {r.maxMarks} marks
                    </p>
                  </div>
                  <Badge text={st2.label} tone={st2.tone} />
                </div>
                {r.description && <p className="text-[13px] text-slate-600 mt-2">{r.description}</p>}
                {r.instructions && (
                  <p className="text-[12px] text-slate-500 mt-1">
                    <b className="text-navy">Instructions:</b> {r.instructions}
                  </p>
                )}
                {r.submissionStatus === "graded" && (
                  <div className="mt-2 rounded-xl bg-[#e9f6ef] p-3">
                    <p className="text-[13px] font-bold text-emerald-700">
                      Marks: {r.marks}/{r.maxMarks}
                    </p>
                    {r.feedback && <p className="text-[12px] text-emerald-800 mt-1">{r.feedback}</p>}
                  </div>
                )}
                {r.submissionStatus !== "graded" && (
                  <details className="mt-3">
                    <summary className="text-[12px] font-semibold text-navy cursor-pointer">
                      {r.submissionId ? "Update submission" : "Submit assignment"}
                    </summary>
                    <form action={submitAssignmentAction} className="mt-3 space-y-2">
                      <input type="hidden" name="assignmentId" value={r.id} />
                      <textarea
                        name="content"
                        className="input"
                        rows={3}
                        placeholder="Write your answer or submission notes…"
                        required
                      />
                      <input name="fileName" className="input" placeholder="Attachment file name (optional)" />
                      <button className="btn btn-primary w-full">Upload Submission</button>
                    </form>
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
