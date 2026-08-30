import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { syllabusFor } from "@/lib/queries";
import { ArrowLeft, BookOpen, CheckCircle2, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SyllabusPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const units = await syllabusFor(st.semester, st.section);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans flex flex-col -mx-3 sm:-mx-6 -mt-4 w-full">
      
      {/* Header */}
      <header className="pt-4 pb-3 px-4 bg-white border-b border-slate-100 sticky top-0 z-20 w-full shadow-sm">
        <div className="flex items-center gap-3 w-full">
          <Link href="/student" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" /> Course Syllabus
            </h1>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Semester {st.semester} • Section {st.section} Subjects & Units
            </p>
          </div>
        </div>
      </header>

      {/* Syllabus Content List */}
      <div className="flex-1 px-3 py-4 w-full flex flex-col gap-3">
        {units.length === 0 ? (
          <div className="bg-white rounded-[20px] p-8 border border-slate-100 shadow-sm text-center my-auto mx-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No syllabus found</h3>
            <p className="text-xs text-slate-500 mt-1">Syllabus units have not been uploaded for your section yet.</p>
          </div>
        ) : (
          units.map((unit: any) => (
            <div key={unit.id} className="bg-white rounded-[18px] p-4 border border-slate-100 shadow-sm flex flex-col gap-2 w-full">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    {unit.subject}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 mt-1">
                    Unit {unit.unitNumber}: {unit.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{unit.completion ?? 0}%</span>
                </div>
              </div>

              {unit.topics && (
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                  <strong className="text-slate-700 block mb-0.5 text-[11px]">Topics Covered:</strong>
                  {unit.topics}
                </p>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}