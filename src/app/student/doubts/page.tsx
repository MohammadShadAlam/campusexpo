import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { semesterSubjects, studentDoubts } from "@/lib/queries";
import { askDoubtAction, resolveDoubtAction } from "@/lib/actions";
import { ArrowLeft, MessageSquare, HelpCircle, CheckCircle2, Send } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DoubtsPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const [subs, rows] = await Promise.all([
    semesterSubjects(st.semester, st.section),
    studentDoubts(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans flex flex-col -mx-3 sm:-mx-6 -mt-4">
      
      {/* 1. Header Section - Clean & Sticky */}
      <header className="pt-4 pb-3 px-3 bg-white border-b border-slate-100 sticky top-0 z-20 w-full shadow-sm">
        <div className="flex items-center gap-3 w-full">
          <Link href="/student" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" /> Doubts
            </h1>
            <p className="text-[12px] text-slate-500 font-medium truncate">
              Ask your faculty directly
            </p>
          </div>
        </div>
      </header>

      {/* Main Container - Added proper top margin (mt-4) like other pages */}
      <div className="flex-1 px-3 py-4 w-full flex flex-col gap-6 mt-2">
        
        {/* 2. Ask Doubt Form Card */}
        <div className="bg-white rounded-[22px] p-4.5 border border-slate-100 shadow-sm w-full">
          <h2 className="text-[15px] font-extrabold text-slate-900 mb-3.5 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            Have a question?
          </h2>

          <form action={askDoubtAction} className="space-y-3.5 w-full">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Subject</label>
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
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Question</label>
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

        {/* 3. My Doubts Section */}
        <div className="w-full flex flex-col gap-3">
          <h2 className="text-[15px] font-extrabold text-slate-900 px-0.5">My Doubts</h2>

          {rows.length === 0 ? (
            <div className="bg-white rounded-[20px] p-8 border border-slate-100 shadow-sm text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No doubts yet</h3>
              <p className="text-xs text-slate-500 mt-1">Ask your first question and your faculty will respond here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 w-full">
              {rows.map((d) => {
                let badgeBg = "bg-amber-50 text-amber-700 border-amber-100";
                if (d.status === "resolved") badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-100";
                if (d.status === "answered") badgeBg = "bg-indigo-50 text-indigo-700 border-indigo-100";

                return (
                  <div key={d.id} className="bg-white rounded-[18px] p-4 border border-slate-100 shadow-sm flex flex-col gap-2.5 w-full">
                    
                    <div className="flex items-start justify-between gap-2 w-full">
                      <p className="font-extrabold text-slate-900 text-[14px] truncate">
                        {d.subject}
                      </p>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${badgeBg}`}>
                        {d.status}
                      </span>
                    </div>

                    <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                      {d.question}
                    </p>

                    {d.answer && (
                      <div className="rounded-xl bg-purple-50/60 border border-purple-100/60 p-3 flex flex-col gap-1 w-full">
                        <p className="text-[11px] font-extrabold text-purple-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                          Faculty Response
                        </p>
                        <p className="text-[12px] text-slate-700 font-medium leading-relaxed">
                          {d.answer}
                        </p>
                      </div>
                    )}

                    {d.status === "answered" && (
                      <form action={resolveDoubtAction} className="pt-1 w-full">
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
    </div>
  );
}