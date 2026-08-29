import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  greeting,
  studentAttendanceStats,
  todayClasses,
  studentAssignments,
  studentNotices,
  unreadCount,
} from "@/lib/queries";
import { 
  Bell, TrendingUp, Star, Zap, 
  Calendar, Clock, Award, 
  BookOpen, BarChart, Users, MapPin,
  Megaphone
} from "lucide-react";

export default async function StudentHome() {
  const user = await requireUser("student");
  const st = user.student!;
  const [att, classes, asg, notices, unread] = await Promise.all([
    studentAttendanceStats(user.id),
    todayClasses(st.semester, st.section),
    studentAssignments(user.id, st.semester, st.section),
    studentNotices(st.semester),
    unreadCount(user.id),
  ]);
  const pending = asg.filter((a) => !a.submissionId).length;
  const progress = Math.round((st.semester / 8) * 100);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', day: 'numeric', month: 'long' 
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      
      {/* 1. Header Section - Bade Fonts aur Icons */}
      <header className="pt-10 pb-4 px-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-slate-500 font-bold tracking-widest uppercase mb-1">
              {currentDate}
            </p>
            <p className="text-base text-slate-600 font-medium">{greeting()},</p>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight truncate">
              {user.fullName}
            </h1>
          </div>
          
          <div className="flex gap-3 mt-1 shrink-0">
            <Link href="/student/notifications" className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
              <Bell className="w-5 h-5 text-slate-600" />
              {unread > 0 && (
                 <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>
            <Link href="/student/profile" className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200 shadow-sm">
              <span className="text-purple-700 font-bold text-lg">{user.fullName.charAt(0)}</span>
            </Link>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2.5 mt-6 overflow-x-auto no-scrollbar pb-1">
          <div className="bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap">
            <span className="text-purple-600 text-[13px] font-semibold tracking-wide">🎓 {st.course} • Sem {st.semester}</span>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap">
            <span className="text-slate-700 text-[13px] font-semibold tracking-wide">🏆 Sec {st.section}</span>
          </div>
        </div>
      </header>

      {/* 2. Academic Overview - Bade Numbers */}
      <section className="px-4 mt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Academic Overview</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-[22px] p-5 flex flex-col justify-between aspect-square border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${att.overall < 75 ? 'bg-red-100' : 'bg-emerald-100'}`}>
              <TrendingUp className={`w-5 h-5 ${att.overall < 75 ? 'text-red-600' : 'text-emerald-600'}`} />
            </div>
            <div className="mt-3">
              <h3 className={`text-[28px] leading-none font-bold tracking-tight ${att.overall < 75 ? 'text-red-600' : 'text-emerald-600'}`}>{att.overall}%</h3>
              <p className="text-[11px] text-slate-500 font-bold tracking-wider mt-1.5 uppercase">Attendance</p>
            </div>
          </div>

          <div className="bg-white rounded-[22px] p-5 flex flex-col justify-between aspect-square border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Star className="text-blue-600 w-5 h-5" />
            </div>
            <div className="mt-3">
              <h3 className="text-[28px] leading-none font-bold text-blue-600 tracking-tight">{st.cgpa ?? "N/A"}</h3>
              <p className="text-[11px] text-slate-500 font-bold tracking-wider mt-1.5 uppercase">Cur. CGPA</p>
            </div>
          </div>

          <div className="bg-white rounded-[22px] p-5 flex flex-col justify-between aspect-square border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pending > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}>
              <Zap className={`w-5 h-5 ${pending > 0 ? 'text-amber-600' : 'text-slate-500'}`} />
            </div>
            <div className="mt-3">
              <h3 className={`text-[28px] leading-none font-bold tracking-tight ${pending > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{pending}</h3>
              <p className="text-[11px] text-slate-500 font-bold tracking-wider mt-1.5 uppercase">Due Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-4.5 mt-3 border border-slate-200 shadow-sm flex items-center justify-between">
            <span className="text-[15px] text-slate-600 font-semibold px-2 py-1">Semester Progress</span>
            <span className="text-[15px] text-purple-600 font-bold px-2 py-1">{progress}%</span>
        </div>
      </section>

      {/* 3. Quick Access - Bade Icons aur Clear Text */}
      <section className="px-4 mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { href: "/student/results", icon: BarChart, label: "Result", color: "text-blue-600", bg: "bg-blue-50" },
            { href: "/student/syllabus", icon: BookOpen, label: "Syllabus", color: "text-purple-600", bg: "bg-purple-50" },
            { href: "/student/assignments", icon: Zap, label: "Tasks", color: "text-amber-600", bg: "bg-amber-50" },
            { href: "/student/attendance", icon: Calendar, label: "Attend.", color: "text-emerald-600", bg: "bg-emerald-50" },
            { href: "/student/timetable", icon: Clock, label: "Timetable", color: "text-indigo-600", bg: "bg-indigo-50" },
            { href: "/student/materials", icon: Award, label: "Material", color: "text-rose-600", bg: "bg-rose-50" },
            { href: "/student/doubts", icon: Users, label: "Doubts", color: "text-pink-600", bg: "bg-pink-50" },
            { href: "/student/leave", icon: MapPin, label: "Leave", color: "text-orange-600", bg: "bg-orange-50" },
          ].map((item, index) => (
            <Link key={index} href={item.href} className="bg-white rounded-[20px] p-3 flex flex-col items-center justify-center gap-2.5 border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
              <div className={`w-14 h-14 rounded-full ${item.bg} flex items-center justify-center`}>
                 <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="text-xs text-slate-700 font-semibold w-full text-center tracking-tight leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Today's Classes */}
      <section className="px-4 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Today's Classes</h2>
          <Link href="/student/timetable" className="text-[15px] text-purple-600 font-semibold">View all &gt;</Link>
        </div>

        <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm flex flex-col gap-6">
          {classes.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-600">No classes today</p>
              <p className="text-[13px] text-slate-400 mt-1">Enjoy your day!</p>
            </div>
          ) : (
            classes.map((c, i) => (
              <div key={c.id} className="flex gap-4 items-start">
                <div className="w-14 text-right shrink-0">
                  <p className="text-base font-bold text-slate-900">{c.start}</p>
                  <p className="text-xs text-slate-500 font-medium">{c.end}</p>
                </div>
                <div className={`w-1 rounded-full h-12 shrink-0 ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-800 truncate">{c.subject}</p>
                  <p className="text-[13px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium truncate">
                     <MapPin className="w-3.5 h-3.5 shrink-0" /> {c.room} • {c.faculty ?? "TBA"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Recent Notices */}
      <section className="px-4 mt-8 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Recent Notices</h2>
          <Link href="/student/notices" className="text-[15px] text-purple-600 font-semibold">View all &gt;</Link>
        </div>

        <div className="flex flex-col gap-3.5">
          {notices.length === 0 ? (
            <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm text-center">
              <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-600">No notices yet</p>
            </div>
          ) : (
            notices.slice(0, 3).map((n) => (
              <Link href={`/student/notices/${n.id}`} key={n.id} className="bg-white rounded-[22px] p-5 border border-slate-200 shadow-sm block hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <h3 className="font-semibold text-slate-800 text-base truncate">{n.title}</h3>
                  <span className={`text-[11px] px-3 py-1.5 rounded-full font-bold shrink-0 ${n.priority === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {n.category}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}