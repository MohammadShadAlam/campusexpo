import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { studentResults } from "@/lib/queries";
import { ArrowLeft, BarChart2, Award, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const results = await studentResults(user.id);

  // Semesters ki unique list nikalne ke liye taaki unke tabs/sections ban sakein
  const semesters = [...new Set(results.map((r: any) => r.semester || st.semester))].sort((a: any, b: any) => b - a);

  // Overall SGPA / CGPA calculate karne ke liye
  const totalCredits = results.reduce((acc: number, r: any) => acc + (r.credits || 0), 0);
  const totalPoints = results.reduce((acc: number, r: any) => acc + ((r.gradePoint || 0) * (r.credits || 0)), 0);
  const overallCgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

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
              <BarChart2 className="w-5 h-5 text-purple-600" /> Results
            </h1>
            <p className="text-[12px] text-slate-500 font-medium truncate">
              Semester {st.semester} • Section {st.section}
            </p>
          </div>
        </div>
      </header>

      {/* 2. Overall Performance Card */}
      <div className="px-3 mt-4 w-full">
        <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-[22px] p-5 text-white shadow-lg shadow-purple-900/10 flex items-center justify-between w-full">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200">Overall Academic Performance</p>
            <p className="text-3xl font-extrabold mt-1">CGPA: {overallCgpa}</p>
            <p className="text-[12px] text-purple-200 mt-1 font-medium">Total Credits Earned: {totalCredits}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Award className="w-6 h-6 text-amber-300" />
          </div>
        </div>
      </div>

      {/* 3. Semester-wise Results Section */}
      <div className="px-3 mt-6 w-full flex flex-col gap-6">
        <h2 className="text-[15px] font-extrabold text-slate-900 px-0.5">Semester-wise Results</h2>

        {results.length === 0 ? (
          <div className="bg-white rounded-[20px] p-8 border border-slate-100 shadow-sm text-center my-auto">
            <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No results published</h3>
            <p className="text-xs text-slate-500 mt-1">Your examination results will appear here once published.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {semesters.map((sem: any) => {
              const semResults = results.filter((r: any) => (r.semester || st.semester) === sem);
              
              // Is specific semester ka SGPA calculate karne ke liye
              const semCredits = semResults.reduce((acc: number, r: any) => acc + (r.credits || 0), 0);
              const semPoints = semResults.reduce((acc: number, r: any) => acc + ((r.gradePoint || 0) * (r.credits || 0)), 0);
              const semSgpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : "0.00";

              return (
                <div key={sem} className="flex flex-col gap-3 w-full">
                  {/* Semester Header Badge */}
                  <div className="flex items-center justify-between px-1 w-full">
                    <span className="text-[12px] font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Semester {sem}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                      SGPA: <strong className="text-slate-900">{semSgpa}</strong>
                    </span>
                  </div>

                  {/* Subjects List for this Semester */}
                  <div className="flex flex-col gap-2.5 w-full">
                    {semResults.map((r: any) => (
                      <div key={r.id || r.subject} className="bg-white rounded-[18px] p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3 w-full">
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-slate-900 text-[14px] truncate">{r.subjectName || r.subject}</p>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                            {r.subjectCode || "Code N/A"} • <strong className="text-slate-600">{r.credits} Credits</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[14px] font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-100 block">
                              {r.grade || "A"}
                            </span>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">
                              {r.marks ? `${r.marks} Marks` : `${r.gradePoint || 0} Points`}
                            </p>
                          </div>
                        </div>
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