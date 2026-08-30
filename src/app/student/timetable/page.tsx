import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { weeklyTimetable } from "@/lib/queries";
import { ArrowLeft, Clock, MapPin, User, CalendarX, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function StudentTimetable({
  searchParams,
}: {
  searchParams?: any;
}) {
  const user = await requireUser("student");
  const st = user.student!;
  const rows = await weeklyTimetable(st.semester, st.section);
  
  const resolvedParams = await searchParams;
  const dayParam = resolvedParams?.day;
  
  const today = new Date().getDay() === 0 ? 1 : new Date().getDay();
  const activeDay = dayParam ? parseInt(dayParam) : today;
  const items = rows.filter((r) => r.day === activeDay);

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
              <Calendar className="w-5 h-5 text-purple-600" /> Timetable
            </h1>
            <p className="text-[12px] text-slate-500 font-medium truncate">
              Semester {st.semester} • Section {st.section}
            </p>
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="px-3 mt-10 w-full">
          <div className="bg-white rounded-[22px] p-8 border border-slate-100 shadow-sm text-center">
            <CalendarX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-800">No timetable published</h2>
            <p className="text-xs text-slate-500 mt-1">The administrator has not published the timetable for your class yet.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full flex flex-col mt-4">
          
          {/* 2. Days Selector Capsule Container (Shifted down properly with mt-2) */}
          <div className="px-3 mb-3 w-full mt-2">
            <div className="bg-slate-200/70 p-1.5 rounded-[22px] flex items-center justify-between gap-1 w-full shadow-inner">
              {[1, 2, 3, 4, 5, 6].map((d) => {
                const hasClasses = rows.some((r) => r.day === d);
                if (!hasClasses) return null;

                const isActive = d === activeDay;

                return (
                  <Link 
                    key={d} 
                    href={`?day=${d}`}
                    scroll={false}
                    className={`flex-1 py-2 rounded-2xl text-[12px] font-extrabold text-center transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
                    }`}
                  >
                    {SHORT_DAYS[d]}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 3. Timetable List */}
          <div className="px-3 py-2 w-full flex flex-col gap-3">
            <div className="flex justify-between items-center px-0.5">
              <h2 className="text-[15px] font-extrabold text-slate-900">{DAYS[activeDay]}'s Classes</h2>
              {activeDay === today && (
                <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-amber-100">
                  Today
                </span>
              )}
            </div>
            
            {items.length === 0 ? (
               <div className="text-center py-10 bg-white rounded-[20px] border border-slate-100 shadow-sm w-full">
                 <p className="text-xs font-medium text-slate-500">No classes scheduled for {DAYS[activeDay]}</p>
               </div>
            ) : (
              <div className="flex flex-col gap-2.5 w-full">
                {items.map((c, index) => {
                  const colors = ["bg-indigo-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500", "bg-blue-500"];
                  const barColor = colors[index % colors.length];
                  
                  const isSpecial = c.type?.toLowerCase() === "lab" || c.type?.toLowerCase() === "special";
                  const badgeBg = isSpecial ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-purple-50 text-purple-700 border border-purple-100";

                  return (
                    <div key={c.id} className="bg-white rounded-[18px] p-4 border border-slate-100 shadow-sm flex gap-3 relative overflow-hidden w-full">
                      <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${barColor}`} />

                      <div className="flex-1 ml-1.5 w-full min-w-0">
                        <div className="flex justify-between items-center mb-1.5 w-full">
                          <p className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
                            {c.start} - {c.end}
                          </p>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${badgeBg}`}>
                            {c.type ?? "Theory"}
                          </span>
                        </div>

                        <p className="text-[14px] font-extrabold text-slate-900 mb-2 leading-tight truncate">
                          {c.subject}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 w-full min-w-0">
                          <span className="flex items-center gap-1.5 shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-slate-400"/> 
                            {c.room}
                          </span>
                          <span className="flex items-center gap-1.5 truncate min-w-0">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0"/> 
                            <span className="truncate">{c.faculty ?? "Faculty TBA"}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}