import { 
  Bell, TrendingUp, Star, Zap, 
  Calendar, Clock, Award, 
  BookOpen, BarChart, Users, MapPin 
} from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-28 font-sans">
      
      {/* 1. Header Section */}
      <header className="pt-10 pb-4 px-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">
              Monday, 25 May
            </p>
            <p className="text-gray-400 text-sm font-medium">Good evening,</p>
            <h1 className="text-3xl font-extrabold text-white mt-0.5 tracking-tight">
              Guest <span className="text-2xl">👋</span>
            </h1>
          </div>
          
          <div className="flex gap-3 mt-2">
            <button className="w-10 h-10 rounded-full bg-[#1a1a1c] flex items-center justify-center border border-white/5">
              <Bell className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#2a1b4d] flex items-center justify-center border border-[#3b256b]">
              <span className="text-[#a78bfa] font-bold text-sm">G</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-5">
          <div className="bg-[#1a1a1c] border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="text-[#8b5cf6] text-[11px] font-semibold tracking-wide">🎓 Sem 4 • Computer Science & Engineering</span>
          </div>
          <div className="bg-[#1a1a1c] border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="text-gray-400 text-[11px] font-semibold tracking-wide">👨‍🎓 Sec C</span>
          </div>
        </div>
      </header>

      {/* 2. Academic Overview */}
      <section className="px-5 mt-4">
        <h2 className="text-lg font-bold text-white mb-4">Academic Overview</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#151517] rounded-[20px] p-4 flex flex-col justify-between aspect-square border border-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="text-emerald-500 w-4 h-4" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-emerald-500 tracking-tight">87%</h3>
              <p className="text-[9px] text-gray-500 font-bold tracking-wider mt-1 uppercase">Attendance</p>
            </div>
          </div>

          <div className="bg-[#151517] rounded-[20px] p-4 flex flex-col justify-between aspect-square border border-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Star className="text-blue-500 w-4 h-4" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-blue-500 tracking-tight">8.4</h3>
              <p className="text-[9px] text-gray-500 font-bold tracking-wider mt-1 uppercase">Cur. CGPA</p>
            </div>
          </div>

          <div className="bg-[#151517] rounded-[20px] p-4 flex flex-col justify-between aspect-square border border-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Zap className="text-amber-500 w-4 h-4" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-amber-500 tracking-tight">3</h3>
              <p className="text-[9px] text-gray-500 font-bold tracking-wider mt-1 uppercase">Due Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-[#151517] rounded-2xl p-4 mt-3 border border-white/[0.02] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">Semester Progress</span>
            <span className="text-xs text-[#8b5cf6] font-bold">68%</span>
        </div>
      </section>

      {/* 3. Quick Access (Naya Section) */}
      <section className="px-5 mt-8">
        <h2 className="text-lg font-bold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: "Attendance", color: "text-indigo-500" },
            { icon: Clock, label: "Timetable", color: "text-blue-500" },
            { icon: Award, label: "Grades", color: "text-amber-500" },
            { icon: BookOpen, label: "Library", color: "text-emerald-500" },
            { icon: BarChart, label: "Results", color: "text-purple-500" },
            { icon: Users, label: "Community", color: "text-pink-500" },
          ].map((item, index) => (
            <div key={index} className="bg-[#151517] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border border-white/[0.02]">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1c] flex items-center justify-center">
                 <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Today's Classes (Naya Section) */}
      <section className="px-5 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Today's Classes</h2>
          <span className="text-sm text-[#8b5cf6] font-semibold cursor-pointer">Schedule &gt;</span>
        </div>

        <div className="bg-[#151517] rounded-[24px] p-5 border border-white/[0.02] flex flex-col gap-6">
          
          {/* Class 1 */}
          <div className="flex gap-4 items-start">
            <div className="w-12 text-right shrink-0">
              <p className="text-sm font-bold text-white">9:50</p>
              <p className="text-[10px] text-gray-500 font-medium">10:40</p>
            </div>
            <div className="w-1 bg-indigo-500 rounded-full h-10 mt-1 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-200">Computer Architecture</p>
              <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
                 <MapPin className="w-3 h-3" /> AC-421 • Mr. Rajat Subhra Nandi
              </p>
            </div>
          </div>

          {/* Class 2 */}
          <div className="flex gap-4 items-start">
            <div className="w-12 text-right shrink-0">
              <p className="text-sm font-bold text-white">10:40</p>
              <p className="text-[10px] text-gray-500 font-medium">11:30</p>
            </div>
            <div className="w-1 bg-amber-500 rounded-full h-10 mt-1 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-200">Formal Language & Automata...</p>
              <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
                 <MapPin className="w-3 h-3" /> AC-421 • Mr. Rishov Saha
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}