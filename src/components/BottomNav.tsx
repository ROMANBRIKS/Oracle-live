import React from "react";
import { Home as HomeIcon, Video, Users, ShieldAlert, LogOut, Trophy, BarChart3, Wallet as WalletIcon } from "lucide-react";

interface BottomNavProps {
  page: string;
  setPage: (page: string) => void;
  openLeaderboard: () => void;
  user: any;
}

const BottomNav: React.FC<BottomNavProps> = ({ page, setPage, openLeaderboard, user }) => {
  const isAdmin = user?.role === "admin";

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-[580px] crystal-pill flex justify-around items-center py-5 px-4 z-[100] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
      {isAdmin && (
        <button 
          onClick={() => setPage("admin")}
          className={`flex flex-col items-center gap-1 transition-all group ${page === 'admin' ? 'text-cyan-400 scale-110' : 'text-white/30 hover:text-white'}`}
          style={{ background: 'none', padding: 0 }}
        >
          <div className={`p-2.5 rounded-2xl transition-all ${page === 'admin' ? 'bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'group-hover:bg-white/5'}`}>
            <ShieldAlert size={20} strokeWidth={page === 'admin' ? 2.5 : 2} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic">Admin</span>
        </button>
      )}
      <button 
        onClick={() => setPage("home")}
        className={`flex flex-col items-center gap-1 transition-all group ${page === 'home' ? 'text-cyan-400 scale-110' : 'text-white/30 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2.5 rounded-2xl transition-all ${page === 'home' ? 'bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'group-hover:bg-white/5'}`}>
          <HomeIcon size={20} strokeWidth={page === 'home' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic">Feed</span>
      </button>

      <button 
        onClick={() => setPage("leaderboard")}
        className={`flex flex-col items-center gap-1 transition-all group ${page === 'leaderboard' ? 'text-cyan-400 scale-110' : 'text-white/30 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2.5 rounded-2xl transition-all ${page === 'leaderboard' ? 'bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'group-hover:bg-white/5'}`}>
          <Trophy size={20} strokeWidth={page === 'leaderboard' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic">Ranks</span>
      </button>

      <div className="relative group">
        <button 
            onClick={() => setPage("live")}
            className={`
            w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all relative z-10
            ${page === 'live' ? 'crystal-button bg-cyan-400 text-black shadow-[0_0_40px_rgba(34,211,238,0.6)]' : 'crystal-button text-white border-white/20 hover:scale-110'}
            `}
            style={{ padding: 0 }}
        >
            <Video size={26} className="relative z-10" />
            <div className={`absolute inset-0 bg-cyan-400 rounded-[1.8rem] transition-all duration-700 ${page === 'live' ? 'animate-ping opacity-20' : 'opacity-0'}`} />
        </button>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-black z-20 shadow-lg" />
      </div>

      <button 
        onClick={() => setPage("wallet")}
        className={`flex flex-col items-center gap-1 transition-all group ${page === 'wallet' ? 'text-cyan-400 scale-110' : 'text-white/30 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2.5 rounded-2xl transition-all ${page === 'wallet' ? 'bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'group-hover:bg-white/5'}`}>
          <WalletIcon size={20} strokeWidth={page === 'wallet' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic">Coins</span>
      </button>

      <button 
        onClick={() => setPage("dashboard")}
        className={`flex flex-col items-center gap-1 transition-all group ${page === 'dashboard' ? 'text-cyan-400 scale-110' : 'text-white/30 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2.5 rounded-2xl transition-all ${page === 'dashboard' ? 'bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'group-hover:bg-white/5'}`}>
          <BarChart3 size={20} strokeWidth={page === 'dashboard' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic">Studio</span>
      </button>
      
      <button 
        onClick={() => setPage("agency")}
        className={`flex flex-col items-center gap-1 transition-all group ${page === 'agency' ? 'text-cyan-400 scale-110' : 'text-white/30 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2.5 rounded-2xl transition-all ${page === 'agency' ? 'bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'group-hover:bg-white/5'}`}>
          <Users size={20} strokeWidth={page === 'agency' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic">Agency</span>
      </button>

    </nav>
  );
};

export default BottomNav;
