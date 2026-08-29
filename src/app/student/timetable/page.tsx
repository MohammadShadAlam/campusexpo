import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { weeklyTimetable } from "@/lib/queries";
import { ArrowLeft, Clock, MapPin, BookOpen, User, CalendarX } from "lucide-react";

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function StudentTimetable() {
  const user = await requireUser("student");
  const st = user.student!;
  const rows = await weeklyTimetable(st.semester, st.section);
  const today = new Date().getDay() === 0 ? 1 : new Date().getDay(); // Default to Monday if Sunday

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      
      {/* 1. Header Section */}
      <header className="pt-10 pb-4 px-2.5">
        <div className="flex items-center gap-3.5">
          <Link href="/student" className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Timetable</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">
              Semester {st.semester} • Section {st.section}
            </p>
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="px-2.5 mt-10">
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm text-center">
            <CalendarX className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800">No timetable published</h2>
            <p className="text-sm text-slate-500 mt-2">The administrator has not published the timetable for your class yet.</p>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Days Selector (Horizontal Scroll) */}
          <div className="px-2.5 mb-6 sticky top-0 bg-slate-50/95 backdrop-blur-md py-3 z-10 border-b border-slate-200/50">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[1, 2, 3, 4, 5, 6].map((d) => {
                // Check if this day has classes
                const hasClasses = rows.some((r) => r.day === d);
                if (!hasClasses) return null;

                return (
                  <a 
                    key={d} 
                    href={`#day-${d}`} 
                    className={`px-4 py-2 rounded-full text-[13px] font-bold shrink-0 transition-colors ${
                      d === today 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {SHORT_DAYS[d]}
                  </a>
                );
              })}
            </div>
          </div>

          {/* 3. Timetable List */}
          <div className="px-2.5">
            {[1, 2, 3, 4, 5, 6].map((d) => {
              const items = rows.filter((r) => r.day === d);
              if (!items.length) return null;

              return (
                <div key={d} id={`day-${d}`} className="mb-8 scroll-mt-24">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-[17px] font-bold text-slate-900">{DAYS[d]}'s Classes</h2>
                    {d === today && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide">
                        Today
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {items.map((c, index) => {
                      // Dynamically assign left bar colors
                      const colors = ["bg-indigo-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500", "bg-blue-500"];
                      const barColor = colors[index % colors.length];
                      
                      // Badge color based on class type
                      const isSpecial = c.type?.toLowerCase() === "lab" || c.type?.toLowerCase() === "special";
                      const badgeBg = isSpecial ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700";

                      return (
                        <div key={c.id} className="bg-white rounded-[22px] p-4.5 border border-slate-100 shadow-sm flex gap-3 relative overflow-hidden">
                          {/* Left Color Bar */}
                          <div className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full ${barColor}`} />

                          <div className="flex-1 ml-2">
                            {/* Time & Badge */}
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" /> 
                                {c.start} - {c.end}
                              </p>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                                {c.type ?? "Theory"}
                              </span>
                            </div>

                            {/* Subject */}
                            <p className="text-[16px] font-extrabold text-slate-900 mb-2.5 leading-snug">
                              {c.subject}
                            </p>

                            
                           {/* Details (Room, Faculty) */}
<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-slate-500">
  <span className="flex items-center gap-1">
    <MapPin className="w-3.5 h-3.5 text-slate-400"/> 
    {c.room}
  </span>
  <span className="flex items-center gap-1 w-full mt-0.5">
    <User className="w-3.5 h-3.5 text-slate-400"/> 
    {c.faculty ?? "Faculty TBA"}
  </span>
</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}