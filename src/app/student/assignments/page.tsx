import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { studentAssignments } from "@/lib/queries";
import { submitAssignmentAction } from "@/lib/actions";
import { ArrowLeft, FileText, CheckCircle2, Upload, Send } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentAssignments() {
  const user = await requireUser("student");
  const st = user.student!;
  const rows = await studentAssignments(user.id, st.semester, st.section);
  const now = new Date();

  const state = (r: (typeof rows)[number]) => {
    if (r.submissionStatus === "graded") return { label: "Completed", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    if (r.submissionId) return { label: r.submissionStatus === "late" ? "Late" : "Submitted", tone: "bg-indigo-50 text-indigo-700 border-indigo-100" };
    if (new Date(r.dueDate) < now) return { label: "Overdue", tone: "bg-rose-50 text-rose-700 border-rose-100" };
    return { label: "Pending", tone: "bg-amber-50 text-amber-700 border-amber-100" };
  };

  const counts = {
    pending: rows.filter((r) => state(r).label === "Pending").length,
    submitted: rows.filter((r) => state(r).label === "Submitted" || state(r).label === "Late").length,
    completed: rows.filter((r) => state(r).label === "Completed").length,
    overdue: rows.filter((r) => state(r).label === "Overdue").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      
      {/* 1. Header Section */}
      <header className="pt-4 pb-3 px-2.5">
        <div className="flex items-center gap-3.5">
          <Link href="/student" className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assignments</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">
              Semester {st.semester} • Section {st.section}
            </p>
          </div>
        </div>
      </header>

      {/* 2. Overview Count Cards (Changed to 2x2 grid for perfect mobile view) */}
      <div className="px-2.5 mt-2 mb-6">
        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} className="bg-white rounded-[20px] p-3.5 text-center border border-slate-100 shadow-sm flex items-center justify-between px-5">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">{k}</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{v}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold text-xs">
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Assignments List */}
      <div className="px-2.5">
        {rows.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-800">No assignments yet</h2>
            <p className="text-xs text-slate-500 mt-1">Your teacher hasn't uploaded any assignments for this subject.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((r) => {
              const st2 = state(r);
              return (
                <div key={r.id} className="bg-white rounded-[20px] p-4.5 border border-slate-100 shadow-sm flex flex-col gap-3">
                  
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 text-[15px] leading-snug">{r.title}</p>
                      <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                        {r.subject} • Due {r.dueDate} • <span className="text-purple-600 font-bold">Max {r.maxMarks} marks</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border shrink-0 ${st2.tone}`}>
                      {st2.label}
                    </span>
                  </div>

                  {r.description && (
                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                      {r.description}
                    </p>
                  )}

                  {r.instructions && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[12px] text-slate-600">
                        <strong className="text-slate-800 font-bold">Instructions:</strong> {r.instructions}
                      </p>
                    </div>
                  )}

                  {r.submissionStatus === "graded" && (
                    <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3.5 flex flex-col gap-1">
                      <p className="text-[13px] font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Marks Obtained: {r.marks} / {r.maxMarks}
                      </p>
                      {r.feedback && <p className="text-[12px] text-emerald-800 font-medium mt-0.5">{r.feedback}</p>}
                    </div>
                  )}

                  {r.submissionStatus !== "graded" && (
                    <div className="mt-1 pt-2 border-t border-slate-100">
                      <details className="group">
                        <summary className="text-[12px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1.5 select-none py-1">
                          <Upload className="w-3.5 h-3.5" />
                          {r.submissionId ? "Update submission" : "Submit assignment"}
                        </summary>

                        <form action={submitAssignmentAction} className="mt-3 space-y-3">
                          <input type="hidden" name="assignmentId" value={r.id} />
                          <textarea
                            name="content"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                            rows={3}
                            placeholder="Write your answer or submission notes…"
                            required
                          />
                          <input 
                            name="fileName" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
                            placeholder="Attachment file name (optional)" 
                          />
                          <button className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-[13px] py-2.5 rounded-xl shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2">
                            <Send className="w-3.5 h-3.5" />
                            Upload Submission
                          </button>
                        </form>
                      </details>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}