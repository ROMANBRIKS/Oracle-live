import { motion } from "motion/react";
import { UserCheck, UserX, Clock } from "lucide-react";

interface GuestRequest {
  userId: string;
  username: string;
  avatar?: string;
}

interface GuestRequestPanelProps {
  requests: GuestRequest[];
  onAccept: (request: GuestRequest) => void;
  onReject: (request: GuestRequest) => void;
}

export default function GuestRequestPanel({ requests, onAccept, onReject }: GuestRequestPanelProps) {
  return (
    <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">
          Guest Requests
        </h3>
        <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50">
          {requests.length} QUEUED
        </span>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-20">
            <Clock size={40} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No pending requests</p>
          </div>
        ) : (
          requests.map((request) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={request.userId}
              className="bg-white/5 border border-white/5 rounded-3xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={request.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userId}`} 
                  className="w-12 h-12 rounded-2xl bg-zinc-800"
                  alt="User" 
                />
                <div>
                  <p className="text-sm font-black uppercase tracking-widest italic leading-none mb-1">
                    @{request.username || request.userId.substring(0, 8)}
                  </p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                    Requesting Seat
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReject(request)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 flex items-center justify-center transition-all"
                >
                  <UserX size={18} />
                </button>
                <button
                  onClick={() => onAccept(request)}
                  className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                >
                  <UserCheck size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
