import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { semesterSubjects, studentDoubts } from "@/lib/queries";
import { askDoubtAction, resolveDoubtAction } from "@/lib/actions";
import { ArrowLeft, MessageSquare, HelpCircle, CheckCircle2, Send } from "lucide-react";

export default async function DoubtsPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const [subs, rows] = await Promise.all([
    semesterSubjects(st.semester, st.section),
    studentDoubts(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      
      {/* 1. Header Section (Top spacing fixed: pt-4 instead of pt-10) */}
      <header className="pt-4 pb-3 px-2.5">
        <div className="flex items-center gap-3.5">
          <Link href="/student" className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Doubts</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">
              Ask your faculty directly
            </p>
          </div>
        </div>
      </header>

      {/* 2. Ask Doubt Form Card */}
      <div className="px-2.5 mt-2">
        <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
          <h2 className="text-[15px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            Have a question?
          </h2>

          <form action={askDoubtAction} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Select Subject</label>
              <select 
                name="subjectId" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
                required
              >
                <option value="">Choose a subject...</option>
                {subs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Your Question</label>
              <textarea 
                name="question" 
                rows={3} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none" 
                required 
                placeholder="Describe your doubt clearly…" 
              />
            </div>

            <button 
              disabled={subs.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-[13px] py-3 rounded-xl shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Submit Doubt
            </button>
          </form>
        </div>
      </div>

      {/* 3. My Doubts Section */}
      <div className="px-2.5 mt-8">
        <h2 className="text-[16px] font-extrabold text-slate-900 mb-3 px-1">My Doubts</h2>

        {rows.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No doubts yet</h3>
            <p className="text-xs text-slate-500 mt-1">Ask your first question and your faculty will respond here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((d) => {
              let badgeBg = "bg-amber-50 text-amber-700 border-amber-100";
              if (d.status === "resolved") badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-100";
              if (d.status === "answered") badgeBg = "bg-indigo-50 text-indigo-700 border-indigo-100";

              return (
                <div key={d.id} className="bg-white rounded-[20px] p-4.5 border border-slate-100 shadow-sm flex flex-col gap-3">
                  
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-extrabold text-slate-900 text-[14px]">
                      {d.subject}
                    </p>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${badgeBg}`}>
                      {d.status}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                    {d.question}
                  </p>

                  {d.answer && (
                    <div className="rounded-2xl bg-purple-50/60 border border-purple-100/60 p-3.5 flex flex-col gap-1">
                      <p className="text-[11px] font-extrabold text-purple-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        Faculty Response
                      </p>
                      <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
                        {d.answer}
                      </p>
                    </div>
                  )}

                  {d.status === "answered" && (
                    <form action={resolveDoubtAction} className="pt-1">
                      <input type="hidden" name="id" value={d.id} />
                      <button className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-[12px] py-2 rounded-xl transition-all">
                        Mark as resolved
                      </button>
                    </form>
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