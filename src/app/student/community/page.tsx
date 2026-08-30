import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCommunityMessages } from "@/lib/queries";
import { sendCommunityMessageAction } from "@/lib/actions";
import { ArrowLeft, MessageSquare, Send, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const messages = await getCommunityMessages(st.semester, st.section);

  return (
    /* -mx-3 aur -mt-4 parent layout ke padding ko cross karke screen ke corners tak le jayega */
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans flex flex-col -mx-3 sm:-mx-6 -mt-4">
      
      {/* Header */}
      <header className="pt-4 pb-3 px-4 bg-white border-b border-slate-100 sticky top-0 z-20 w-full shadow-sm">
        <div className="flex items-center gap-3 w-full">
          <Link href="/student" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" /> Batch Community
            </h1>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Semester {st.semester} • Section {st.section} Group Chat
            </p>
          </div>
        </div>
      </header>

      {/* Messages List */}
      <div className="flex-1 px-3 py-4 w-full flex flex-col gap-2.5">
        {messages.length === 0 ? (
          <div className="bg-white rounded-[20px] p-8 border border-slate-100 shadow-sm text-center my-auto mx-3">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No messages yet</h3>
            <p className="text-xs text-slate-500 mt-1">Start the conversation with your batchmates!</p>
          </div>
        ) : (
          messages.map((m: any) => {
            const isMe = m.userId === user.id;
            const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={m.id} className={`flex flex-col w-full px-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] font-bold text-slate-400 px-1 mb-0.5">
                  {isMe ? 'You' : m.userName}
                </span>
                <div className={`max-w-[85%] rounded-[16px] px-3 py-2 shadow-sm ${
                  isMe 
                    ? 'bg-purple-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                }`}>
                  <p className="text-[12px] font-medium leading-relaxed break-words">{m.message}</p>
                  <span className={`text-[8px] block text-right mt-0.5 ${isMe ? 'text-purple-200' : 'text-slate-400'}`}>
                    {time}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input Bar - Fixed across bottom edges */}
      <div className="fixed bottom-16 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 z-30 w-full shadow-lg">
        <form action={sendCommunityMessageAction} className="flex gap-2 items-center w-full max-w-4xl mx-auto">
          <input 
            type="text" 
            name="message" 
            placeholder="Type a message to your batch..." 
            className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2.5 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            required
            autoComplete="off"
          />
          <button type="submit" className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-purple-500/25 transition-all shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}