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
      
      {/* 1. Header Section - Padding kam ki hai (px-4) aur name space fix kiya hai */}
      <header className="pt-10 pb-4 px-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-1">
              {currentDate}
            </p>
            <p className="text-slate-600 text-[15px] font-medium">{greeting()},</p>
            <h1 className="text-[28px] font-extrabold text-slate-900 mt-0.5 tracking-tight truncate">
              {user.fullName}
            </h1>
          </div>
          
          <div className="flex gap-2.5 mt-1 shrink-0">
            <Link href="/student/notifications" className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
              <Bell className="w-[18px] h-[18px] text-slate-600" />
              {unread > 0 && (
                 <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>
            <Link href="/student/profile" className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200 shadow-sm">
              <span className="text-purple-700 font-bold text-base">{user.fullName.charAt(0)}</span>
            </Link>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-5 overflow-x-auto no-scrollbar pb-1">
          <div className="bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 whitespace-nowrap">
            <span className="text-purple-600 text-xs font-semibold tracking-wide">🎓 {st.course} • Sem {st.semester}</span>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 whitespace-nowrap">
            <span className="text-slate-700 text-xs font-semibold tracking-wide">🏆 Sec {st.section}</span>
          </div>
        </div>
      </header>

      {/* 2. Academic Overview */}
      <section className="px-4 mt-4">
        <h2 className="text-[17px] font-bold text-slate-900 mb-3.5">Academic Overview</h2>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-[20px] p-4 flex flex-col justify-between aspect-square border border-slate-200 shadow-sm">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${att.overall < 75 ? 'bg-red-100' : 'bg-emerald-100'}`}>
              <TrendingUp className={`w-[18px] h-[18px] ${att.overall < 75 ? 'text-red-600' : 'text-emerald-600'}`} />
            </div>
            <div className="mt-3">
              <h3 className={`text-2xl font-bold tracking-tight ${att.overall < 75 ? 'text-red-600' : 'text-emerald-600'}`}>{att.overall}%</h3>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-0.5 uppercase">Attendance</p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-4 flex flex-col justify-between aspect-square border border-slate-200 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <Star className="text-blue-600 w-[18px] h-[18px]" />
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-blue-600 tracking-tight">{st.cgpa ?? "N/A"}</h3>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-0.5 uppercase">Cur. CGPA</p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-4 flex flex-col justify-between aspect-square border border-slate-200 shadow-sm">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${pending > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}>
              <Zap className={`w-[18px] h-[18px] ${pending > 0 ? 'text-amber-600' : 'text-slate-500'}`} />
            </div>
            <div className="mt-3">
              <h3 className={`text-2xl font-bold tracking-tight ${pending > 0 ? 'text-amber-600' : 'text-slate-600'}`}>{pending}</h3>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-0.5 uppercase">Due Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[18px] p-4 mt-3 border border-slate-200 shadow-sm flex items-center justify-between">
            <span className="text-sm text-slate-600 font-semibold">Semester Progress</span>
            <span className="text-sm text-purple-600 font-bold">{progress}%</span>
        </div>
      </section>

      {/* 3. Quick Access - Font size aur gap fix kiya */}
      <section className="px-4 mt-8">
        <h2 className="text-[17px] font-bold text-slate-900 mb-3.5">Quick Access</h2>
        <div className="grid grid-cols-4 gap-2.5">
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
            <Link key={index} href={item.href} className="bg-white rounded-[18px] p-2.5 flex flex-col items-center justify-center gap-2 border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
              <div className={`w-11 h-11 rounded-full ${item.bg} flex items-center justify-center`}>
                 <item.icon className={`w-[20px] h-[20px] ${item.color}`} />
              </div>
              <span className="text-[11px] text-slate-700 font-semibold w-full text-center tracking-tight leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Today's Classes */}
      <section className="px-4 mt-8">
        <div className="flex justify-between items-center mb-3.5">
          <h2 className="text-[17px] font-bold text-slate-900">Today's Classes</h2>
          <Link href="/student/timetable" className="text-sm text-purple-600 font-semibold">View all &gt;</Link>
        </div>

        <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm flex flex-col gap-6">
          {classes.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No classes today</p>
              <p className="text-xs text-slate-400 mt-1">Enjoy your day!</p>
            </div>
          ) : (
            classes.map((c, i) => (
              <div key={c.id} className="flex gap-3.5 items-start">
                <div className="w-12 text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">{c.start}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{c.end}</p>
                </div>
                <div className={`w-1 rounded-full h-11 shrink-0 ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-800 truncate">{c.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-medium truncate">
                     <MapPin className="w-3 h-3 shrink-0" /> {c.room} • {c.faculty ?? "TBA"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Recent Notices */}
      <section className="px-4 mt-8 mb-4">
        <div className="flex justify-between items-center mb-3.5">
          <h2 className="text-[17px] font-bold text-slate-900">Recent Notices</h2>
          <Link href="/student/notices" className="text-sm text-purple-600 font-semibold">View all &gt;</Link>
        </div>

        <div className="flex flex-col gap-3">
          {notices.length === 0 ? (
            <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm text-center">
              <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No notices yet</p>
            </div>
          ) : (
            notices.slice(0, 3).map((n) => (
              <Link href={`/student/notices/${n.id}`} key={n.id} className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-sm block hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-800 text-[15px] truncate">{n.title}</h3>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${n.priority === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {n.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}