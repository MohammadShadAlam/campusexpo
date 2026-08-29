import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { studentAttendanceStats } from "@/lib/queries";
import { ArrowLeft, Percent, AlertTriangle, CheckCircle2 } from "lucide-react";

export default async function StudentAttendancePage() {
  const user = await requireUser("student");
  const att = await studentAttendanceStats(user.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      
      {/* 1. Header Section */}
      <header className="pt-4 pb-3 px-2.5">
        <div className="flex items-center gap-3.5">
          <Link href="/student" className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">
              Subject-wise attendance record
            </p>
          </div>
        </div>
      </header>

      {/* 2. Overall Attendance Card */}
      <div className="px-2.5 mt-2">
        <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Overall Attendance</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{att.overall}%</p>
            </div>
            <p className="text-[12px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {att.present} present / {att.total} classes
            </p>
          </div>

          {/* Custom Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${att.overall < 75 ? "bg-rose-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(att.overall, 100)}%` }}
            />
          </div>

          {att.overall < 75 && att.total > 0 && (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 p-3 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="text-[12px] font-bold text-rose-700">
                Your attendance is below the mandatory 75% requirement.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Subject-wise Attendance Section */}
      <div className="px-2.5 mt-8">
        <h2 className="text-[16px] font-extrabold text-slate-900 mb-3 px-1">Subject-wise</h2>

        {att.rows.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm text-center">
            <Percent className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No attendance records</h3>
            <p className="text-xs text-slate-500 mt-1">Attendance will appear once your faculty starts marking classes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {att.rows.map((r) => {
              const isLow = r.percent < 75;
              return (
                <div key={r.subjectId} className="bg-white rounded-[20px] p-4.5 border border-slate-100 shadow-sm flex flex-col gap-2.5">
                  
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-extrabold text-slate-900 text-[15px] truncate">
                      {r.name ?? "Subject"}
                    </p>
                    <span className={`text-[13px] font-extrabold px-2.5 py-0.5 rounded-full ${isLow ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                      {r.percent}%
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-slate-400">
                    Present <strong className="text-slate-700">{r.present}</strong> · Absent <strong className="text-slate-700">{r.total - r.present}</strong> · Total <strong className="text-slate-700">{r.total}</strong>
                  </p>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isLow ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(r.percent, 100)}%` }}
                    />
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