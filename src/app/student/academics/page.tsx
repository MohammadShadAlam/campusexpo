import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { semesterSubjects } from "@/lib/queries";
import { 
  BarChart, BookOpen, Percent, Clock, 
  Folder, Megaphone, Calendar, MessageSquare,
  ArrowLeft 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AcademicsPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const subs = await semesterSubjects(st.semester, st.section);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans flex flex-col w-full">
      
      {/* 1. Header Section - Clean & Sticky */}
      <header className="pt-4 pb-3 px-3 bg-white border-b border-slate-100 sticky top-0 z-20 w-full shadow-sm">
        <div className="flex items-center gap-3 w-full">
          <Link href="/student" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" /> Academics
            </h1>
            <p className="text-[12px] text-slate-500 font-medium truncate">
              Semester {st.semester} • Section {st.section}
            </p>
          </div>
        </div>
      </header>

      {/* 2. Quick Access Grid */}
      <section className="px-3 mt-4 w-full">
        <div className="grid grid-cols-4 gap-2.5 w-full">
          {[
            { href: "/student/results", icon: BarChart, label: "Result", color: "text-blue-600", bg: "bg-blue-50" },
            { href: "/student/syllabus", icon: BookOpen, label: "Syllabus", color: "text-purple-600", bg: "bg-purple-50" },
            { href: "/student/attendance", icon: Percent, label: "Attendance", color: "text-emerald-600", bg: "bg-emerald-50" },
            { href: "/student/timetable", icon: Clock, label: "Timetable", color: "text-amber-600", bg: "bg-amber-50" },
            { href: "/student/materials", icon: Folder, label: "Materials", color: "text-indigo-600", bg: "bg-indigo-50" },
            { href: "/student/notices", icon: Megaphone, label: "Notices", color: "text-rose-600", bg: "bg-rose-50" },
            { href: "/student/calendar", icon: Calendar, label: "Calendar", color: "text-blue-600", bg: "bg-blue-50" },
            { href: "/student/doubts", icon: MessageSquare, label: "Doubts", color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item, index) => (
            <Link key={index} href={item.href} className="bg-white rounded-[18px] p-2.5 flex flex-col items-center justify-center gap-2 border border-slate-100 shadow-sm active:scale-95 transition-all">
              <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                 <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-[10px] text-slate-600 font-medium w-full text-center truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Registered Subjects Section */}
      <section className="px-3 mt-6 mb-4 w-full">
        <h2 className="text-[15px] font-bold text-slate-900 mb-3 px-0.5">Registered Subjects</h2>

        {subs.length === 0 ? (
          <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-[15px] font-semibold text-slate-600">No subjects assigned</p>
            <p className="text-[12px] text-slate-500 mt-1">Your subject registration is not complete yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 w-full">
            {subs.map((s) => (
              <div key={s.id} className="bg-white rounded-[18px] p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-[14px] truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {s.code} • {s.faculty ?? "Faculty TBA"}
                  </p>
                </div>
                <span className="text-[11px] font-extrabold text-amber-600 shrink-0 bg-amber-50 px-2.5 py-1 rounded-full">
                  {s.credits} cr
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}