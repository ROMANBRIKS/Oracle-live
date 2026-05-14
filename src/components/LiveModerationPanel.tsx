import React from "react";
import { Shield, VolumeX, LogOut, Ban, AlertTriangle, UserX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface LiveModerationPanelProps {
  users: User[];
  onMute: (user: User) => void;
  onKick: (user: User) => void;
  onBan: (user: User) => void;
  onShadowBan: (user: User) => void;
}

const LiveModerationPanel: React.FC<LiveModerationPanelProps> = ({
  users,
  onMute,
  onKick,
  onBan,
  onShadowBan,
}) => {
  return (
    <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
          <Shield size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase italic tracking-tight text-white leading-none">MODERATION</h3>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Live Sentinel Hub</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {users.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/20 text-xs font-bold uppercase tracking-widest italic">No active viewers to moderate</p>
          </div>
        ) : (
          users.map((user) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={user.id}
              className="group bg-white/5 border border-white/5 hover:border-white/10 p-4 rounded-2xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                      alt={user.username}
                      className="w-10 h-10 rounded-xl border border-white/10"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight italic leading-none mb-1">{user.username}</h4>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Active Viewer</span>
                  </div>
                </div>
                <button className="text-white/20 hover:text-white transition-colors">
                  <AlertTriangle size={14} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => onMute(user)}
                  title="Mute"
                  className="flex flex-col items-center justify-center gap-1 p-2 bg-zinc-800/50 hover:bg-amber-500/10 rounded-xl hover:text-amber-500 transition-all group/btn"
                >
                  <VolumeX size={16} />
                </button>
                <button
                  onClick={() => onKick(user)}
                  title="Kick"
                  className="flex flex-col items-center justify-center gap-1 p-2 bg-zinc-800/50 hover:bg-orange-500/10 rounded-xl hover:text-orange-500 transition-all group/btn"
                >
                  <LogOut size={16} />
                </button>
                <button
                  onClick={() => onBan(user)}
                  title="Ban"
                  className="flex flex-col items-center justify-center gap-1 p-2 bg-zinc-800/50 hover:bg-red-500/10 rounded-xl hover:text-red-500 transition-all group/btn"
                >
                  <Ban size={16} />
                </button>
                <button
                  onClick={() => onShadowBan(user)}
                  title="Shadow Ban"
                  className="flex flex-col items-center justify-center gap-1 p-2 bg-zinc-800/50 hover:bg-indigo-500/10 rounded-xl hover:text-indigo-500 transition-all group/btn"
                >
                  <UserX size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic tracking-widest">AI Protection</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/40" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ENABLED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveModerationPanel;
