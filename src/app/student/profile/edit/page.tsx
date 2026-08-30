import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { updateStudentProfile } from "@/lib/actions";
import { ArrowLeft, Save, UserPen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const user = await requireUser("student");
  const st = user.student!;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans flex flex-col w-full">
      
      {/* Header */}
      <header className="pt-4 pb-3 px-3 bg-white border-b border-slate-100 sticky top-0 z-20 w-full shadow-sm">
        <div className="flex items-center gap-3 w-full">
          <Link href="/student/profile" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <UserPen className="w-5 h-5 text-purple-600" /> Edit Profile
            </h1>
            <p className="text-[12px] text-slate-500 font-medium truncate">
              Update your personal details
            </p>
          </div>
        </div>
      </header>

      {/* Edit Form */}
      <div className="flex-1 px-3 py-4 w-full flex flex-col gap-6 mt-2">
        <div className="bg-white rounded-[22px] p-5 border border-slate-200/80 shadow-sm w-full">
          
          <form action={updateStudentProfile} className="space-y-4 w-full">
            
            {/* Full Name (Read-only) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input 
                type="text" 
                value={user.fullName} 
                disabled 
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Name cannot be changed directly. Contact admin for corrections.</span>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" 
                value={user.email} 
                disabled 
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Editable Phone Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                defaultValue={user.phone || ""} 
                placeholder="Enter your phone number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                required
              />
            </div>

            {/* Roll Number (Read-only) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Roll Number</label>
              <input 
                type="text" 
                value={st.rollNumber} 
                disabled 
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Save Button */}
            <button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-[13px] py-3 rounded-xl shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}