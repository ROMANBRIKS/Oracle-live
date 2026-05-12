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
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[98%] max-w-[620px] liquid-glass flex justify-around items-center py-5 px-3 z-50 rounded-[2.8rem]">
      {isAdmin && (
        <button 
          onClick={() => setPage("admin")}
          className={`flex flex-col items-center gap-1 transition-all ${page === 'admin' ? 'text-emerald-500 scale-110' : 'text-white/40 hover:text-white'}`}
          style={{ background: 'none', padding: 0 }}
        >
          <div className={`p-2 rounded-2xl transition-all ${page === 'admin' ? 'bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}`}>
            <ShieldAlert size={18} strokeWidth={page === 'admin' ? 2.5 : 2} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest mt-1">Admin</span>
        </button>
      )}
      <button 
        onClick={() => setPage("home")}
        className={`flex flex-col items-center gap-1 transition-all ${page === 'home' ? 'text-white scale-110' : 'text-white/40 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2 rounded-2xl transition-all ${page === 'home' ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}`}>
          <HomeIcon size={18} strokeWidth={page === 'home' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest mt-1">Home</span>
      </button>

      <button 
        onClick={() => setPage("leaderboard")}
        className={`flex flex-col items-center gap-1 transition-all ${page === 'leaderboard' ? 'text-white scale-110' : 'text-white/40 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2 rounded-2xl transition-all ${page === 'leaderboard' ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}`}>
          <Trophy size={18} strokeWidth={page === 'leaderboard' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest mt-1">Rank</span>
      </button>

      <button 
        onClick={() => setPage("wallet")}
        className={`flex flex-col items-center gap-1 transition-all ${page === 'wallet' ? 'text-white scale-110' : 'text-white/40 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2 rounded-2xl transition-all ${page === 'wallet' ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}`}>
          <WalletIcon size={18} strokeWidth={page === 'wallet' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest mt-1">Wallet</span>
      </button>

      <button 
        onClick={() => setPage("live")}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center transition-all relative
          ${page === 'live' ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.5)]' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}
        `}
        style={{ padding: 0 }}
      >
        <Video size={22} className="relative z-10" />
        {page === 'live' && (
          <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
        )}
      </button>

      <button 
        onClick={() => setPage("dashboard")}
        className={`flex flex-col items-center gap-1 transition-all ${page === 'dashboard' ? 'text-white scale-110' : 'text-white/40 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2 rounded-2xl transition-all ${page === 'dashboard' ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}`}>
          <BarChart3 size={18} strokeWidth={page === 'dashboard' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest mt-1">Stats</span>
      </button>
      
      <button 
        onClick={() => setPage("agency")}
        className={`flex flex-col items-center gap-1 transition-all ${page === 'agency' ? 'text-white scale-110' : 'text-white/40 hover:text-white'}`}
        style={{ background: 'none', padding: 0 }}
      >
        <div className={`p-2 rounded-2xl transition-all ${page === 'agency' ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}`}>
          <Users size={18} strokeWidth={page === 'agency' ? 2.5 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest mt-1">Agency</span>
      </button>

    </nav>
  );
};

export default BottomNav;
