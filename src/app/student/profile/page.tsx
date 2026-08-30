import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { semesterSubjects } from "@/lib/queries";
import { logoutAction } from "@/lib/actions";
import { 
  ArrowLeft, Edit3, Award, Star, ShieldCheck, 
  BookOpen, Mail, Phone, MapPin, CheckCircle2, 
  LogOut, IdCard, Calendar 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentProfile() {
  const user = await requireUser("student");
  const st = user.student!;
  const subs = await semesterSubjects(st.semester, st.section);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans flex flex-col -mx-3 sm:-mx-6 -mt-4">
      
      {/* 1. Header Section */}
      <header className="pt-4 pb-3 px-3 bg-white border-b border-slate-100 sticky top-0 z-20 w-full shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Link href="/student" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
          </div>
          
          {/* Edit Profile Button */}
          <Link href="/student/profile/edit" className="flex items-center gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3.5 py-2 rounded-full border border-purple-200 text-xs font-bold shadow-xs active:scale-95 transition-all">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </Link>
        </div>
      </header>

      {/* Main Content Container - Added mt-5 so the card moves down from the header */}
      <div className="flex-1 px-3 py-4 w-full flex flex-col gap-6 mt-3">

        {/* 2. Top Identity Card */}
        <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-sm relative overflow-hidden w-full">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div>
              <p className="font-extrabold text-slate-900 text-base">CampusExpo</p>
              <p className="text-[10px] text-slate-400 font-medium">Institute of Engineering & Technology</p>
            </div>
            <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
              Identity Card
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-purple-600 text-white grid place-items-center text-3xl font-extrabold shadow-md shadow-purple-500/20">
                {user.fullName.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-slate-200 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-slate-900 truncate">{user.fullName}</h2>
              </div>
              <p className="text-[12px] text-slate-500 font-medium truncate mt-0.5">{user.department}</p>
              
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">ROLL NO</span>
                  <span className="font-bold text-slate-800">{st.rollNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SEMESTER</span>
                  <span className="font-bold text-slate-800">Sem {st.semester}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SECTION</span>
                  <span className="font-bold text-slate-800">Sec {st.section}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BATCH</span>
                  <span className="font-bold text-slate-800">{st.batch}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Achievements Section */}
        <div className="w-full flex flex-col gap-2.5">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Achievements</p>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-[12px] font-bold text-slate-900">Consistent</p>
              <p className="text-[10px] text-slate-400 mt-0.5">90%+ attendance</p>
            </div>

            <div className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Star className="w-5 h-5" />
              </div>
              <p className="text-[12px] font-bold text-slate-900">Active Learner</p>
              <p className="text-[10px] text-slate-400 mt-0.5">All assignments</p>
            </div>

            <div className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-[12px] font-bold text-slate-900">Topper</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Top in section</p>
            </div>
          </div>
        </div>

        {/* 4. Academic Profile Details */}
        <div className="w-full flex flex-col gap-2.5">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Academic Profile</p>
          <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-sm flex flex-col divide-y divide-slate-100">
            <div className="flex justify-between py-2.5"><span className="text-[12px] text-slate-500">Roll Number</span><span className="text-[13px] font-bold text-slate-900">{st.rollNumber}</span></div>
            <div className="flex justify-between py-2.5"><span className="text-[12px] text-slate-500">Enrollment</span><span className="text-[13px] font-bold text-slate-900">{st.enrollmentNumber}</span></div>
            
            <div className="flex items-center justify-between py-2.5 gap-4">
              <span className="text-[12px] text-slate-500 shrink-0">Department</span>
              <span className="text-[12px] font-bold text-slate-900 text-right">{user.department}</span>
            </div>

            <div className="flex justify-between py-2.5"><span className="text-[12px] text-slate-500">Year / Semester</span><span className="text-[13px] font-bold text-slate-900">{st.year} • Sem {st.semester}</span></div>
            <div className="flex justify-between py-2.5"><span className="text-[12px] text-slate-500">Section</span><span className="text-[13px] font-bold text-slate-900">{st.section}</span></div>
            <div className="flex justify-between py-2.5"><span className="text-[12px] text-slate-500">Batch Group</span><span className="text-[13px] font-bold text-slate-900">{st.batch}</span></div>
            <div className="flex justify-between py-2.5"><span className="text-[12px] text-slate-500">Current CGPA</span><span className="text-[13px] font-bold text-purple-700">{st.cgpa ?? "8.4"}</span></div>
          </div>
        </div>

        {/* 5. Contact Details */}
        <div className="w-full flex flex-col gap-2.5">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Contact Details</p>
          <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                <p className="text-[13px] font-bold text-slate-800 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Contact</p>
                <p className="text-[13px] font-bold text-slate-800 truncate">{user.phone || "+91 98765 43210"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Hostel Info</p>
                <p className="text-[13px] font-bold text-slate-800 truncate">Hostel Block A, Room 101</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Connected Accounts */}
        <div className="w-full flex flex-col gap-2.5">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Connected Accounts</p>
          <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Primary SSO Account</p>
                <p className="text-[13px] font-bold text-slate-800">Google Workspace OAuth</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              Verified
            </span>
          </div>
        </div>

        {/* 7. Enrolled Curriculum */}
        <div className="w-full flex flex-col gap-2.5">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Enrolled Curriculum</p>
          <div className="flex flex-col gap-2.5 w-full">
            {subs.slice(0, 3).map((s) => (
              <div key={s.id} className="bg-white rounded-[18px] p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{s.code} • {s.credits} Credits</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg shrink-0">
                  Theory
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Quick Links & Sign Out */}
        <div className="w-full flex flex-col gap-3 mt-2">
          <div className="grid grid-cols-2 gap-2.5">
            <Link href="/student/id-card" className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center text-xs font-bold text-slate-700 shadow-xs transition-all flex items-center justify-center gap-2">
              <IdCard className="w-4 h-4 text-purple-600" /> Digital ID
            </Link>
            <Link href="/student/calendar" className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center text-xs font-bold text-slate-700 shadow-xs transition-all flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Calendar
            </Link>
          </div>

          <form action={logoutAction} className="w-full pt-2">
            <button className="w-full bg-rose-50 hover:bg-rose-100 active:scale-[0.98] text-rose-600 font-bold text-xs py-3.5 rounded-xl border border-rose-200 transition-all flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}