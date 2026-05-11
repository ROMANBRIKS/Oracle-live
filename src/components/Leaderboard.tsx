import React, { useEffect, useState } from "react";
import { Trophy, Medal, Crown, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

function Leaderboard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [data, setData] = useState<any>({ coins: [], gifters: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wealth' | 'gifters'>('wealth');
  const [period, setPeriod] = useState<'weekly' | 'all'>('weekly');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      axios.get(`/api/rec/leaderboard?period=${period}`)
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch((err) => console.error("Leaderboard fetch error:", err));
    }
  }, [isOpen, period]);

  const list = (activeTab === 'wealth' ? data?.coins : data?.gifters) || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-zinc-900 w-full max-w-md rounded-t-[40px] md:rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-xl">
                    <Trophy size={24} className="text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Hall of Fame</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  style={{ background: 'none' }}
                >
                  <X size={24} className="text-zinc-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 mb-4">
                <button 
                  onClick={() => setActiveTab('wealth')}
                  className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'wealth' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  💰 Wealth
                </button>
                <button 
                  onClick={() => setActiveTab('gifters')}
                  className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'gifters' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  ✨ Gifters
                </button>
              </div>

              {/* Period Selector */}
              <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => setPeriod('weekly')}
                    className={`px-4 py-1 text-[8px] font-black uppercase tracking-tighter rounded-full border transition-all ${period === 'weekly' ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-white/10 text-white/40'}`}
                  >
                      Weekly
                  </button>
                  <button 
                    onClick={() => setPeriod('all')}
                    className={`px-4 py-1 text-[8px] font-black uppercase tracking-tighter rounded-full border transition-all ${period === 'all' ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-white/10 text-white/40'}`}
                  >
                      All Time
                  </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                list.map((user: any, index: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={user.username}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      index === 0 ? 'bg-yellow-500/10 border-yellow-500/20' : 
                      index === 1 ? 'bg-slate-300/10 border-slate-300/20' :
                      index === 2 ? 'bg-amber-700/10 border-amber-700/20' :
                      'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 flex justify-center font-black text-lg italic text-zinc-600">
                        {index === 0 ? <Crown size={20} className="text-yellow-500" /> :
                         index === 1 ? <Medal size={20} className="text-slate-300" /> :
                         index === 2 ? <Medal size={20} className="text-amber-700" /> :
                         index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-zinc-400">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-zinc-200 truncate max-w-[120px]">@{user.username}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-white">{(user.coins || user.total_spent).toLocaleString()}</span>
                      <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-tighter">
                        {activeTab === 'wealth' ? 'Coins' : 'Spent'}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/40 border-t border-white/5 text-center">
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em]">Rankings update in real-time</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Leaderboard;
