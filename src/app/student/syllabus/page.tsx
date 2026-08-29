import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { syllabusFor } from "@/lib/queries";
import { ArrowLeft, BookOpen, Layers, Hash } from "lucide-react";

export default async function SyllabusPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const rows = await syllabusFor(st.semester, st.section);
  const subjectNames = [...new Set(rows.map((r) => r.subject))];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      
      {/* 1. Header Section */}
      <header className="pt-10 pb-4 px-2.5">
        <div className="flex items-center gap-3.5">
          <Link href="/student" className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Syllabus</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">
              Semester {st.semester} course curriculum
            </p>
          </div>
        </div>
      </header>

      {/* 2. Content Section */}
      <div className="px-2.5 mt-2">
        {rows.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-800">No syllabus uploaded</h2>
            <p className="text-xs text-slate-500 mt-1">The syllabus for your semester has not been published yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {subjectNames.map((name) => {
              const units = rows.filter((r) => r.subject === name);
              // Extracting code if available in the data, or showing a clean layout
              const sampleUnit = units[0];
              const subjectCode = (sampleUnit as any)?.code || (sampleUnit as any)?.subjectCode || "";

              return (
                <div key={name}>
                  {/* Subject Title & Code Header */}
                  <div className="mb-3 px-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-600" />
                        {name}
                      </h2>
                      {subjectCode && (
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {subjectCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Units List (Only content & topics, no percentages) */}
                  <div className="flex flex-col gap-2.5">
                    {units.map((u) => (
                      <div key={u.id} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-900 text-[14px]">
                            Unit {u.unitNumber}
                          </p>
                        </div>

                        <p className="font-semibold text-slate-800 text-[13px]">
                          {u.title}
                        </p>

                        {u.topics && (
                          <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">
                            {u.topics}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}