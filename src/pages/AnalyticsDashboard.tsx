import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, TrendingUp, Users, Gift, MessageSquare, Clock, Shield, ChevronLeft, ArrowUpRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

interface StreamAnalytics {
  id: string;
  streamer_id: string;
  room_id: string;
  total_viewers: number;
  peak_viewers: number;
  total_gifts: number;
  total_coins: number;
  watch_time: number;
  new_followers: number;
  likes: number;
  shares: number;
  stream_duration: number;
  created_at: string;
  updated_at: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<StreamAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadAnalytics = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    try {
      const res = await axios.get(`/api/analytics/stream/${user.id}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalEarnings = analytics.reduce((acc, curr) => acc + curr.total_coins, 0);
  const totalViews = analytics.reduce((acc, curr) => acc + curr.total_viewers, 0);
  const totalGifts = analytics.reduce((acc, curr) => acc + curr.total_gifts, 0);

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <Zap className="text-indigo-500 fill-indigo-500" /> Creator Hub
            </h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1 ml-1">Advanced Stream Performance Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Live Sync Active</span>
          </div>
        </div>
      </div>

      {/* Global Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-[2.5rem] bg-indigo-600 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingUp size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200/60 mb-2">Total Earnings</p>
          <h3 className="text-5xl font-black italic tracking-tighter mb-4">{totalEarnings.toLocaleString()} <span className="text-xl opacity-60 not-italic uppercase tracking-normal">Coins</span></h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-100/40 uppercase">
             <ArrowUpRight size={12} /> Real-time conversion tracking
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-2">Lifetime Views</p>
          <h3 className="text-5xl font-black italic tracking-tighter mb-4">{totalViews.toLocaleString()}</h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/10 uppercase tracking-widest">
             <Users size={12} /> Distributed across {analytics.length} sessions
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-2">Total Gifts</p>
          <h3 className="text-5xl font-black italic tracking-tighter mb-4">{totalGifts.toLocaleString()}</h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/10 uppercase tracking-widest">
             <Gift size={12} /> 94% Retention Rate
          </div>
        </motion.div>
      </div>

      {/* Session History */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 px-4">
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/20">Session Archives</h3>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sort: Latest</span>
           </div>
        </div>

        {analytics.length === 0 ? (
          <div className="text-center py-32 bg-zinc-900/50 border border-dashed border-white/10 rounded-[3rem]">
            <BarChart3 className="mx-auto text-white/5 mb-6" size={64} />
            <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-xs">No session data synchronized yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analytics.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 md:p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 hover:border-indigo-500/30 transition-all group flex flex-col md:flex-row md:items-center gap-8"
              >
                <div className="flex-shrink-0">
                   <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Session Date</div>
                   <div className="text-lg font-black italic tracking-tighter text-indigo-400">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                   </div>
                   <div className="flex items-center gap-1 text-[9px] font-mono text-white/30 mt-1 uppercase tracking-widest">
                      <Clock size={10} /> {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>

                <div className="hidden md:block w-px h-12 bg-white/5" />

                <div className="grid grid-cols-2 md:grid-cols-4 flex-1 gap-8">
                   <div>
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
                         <Users size={10} /> Viewers
                      </div>
                      <div className="text-xl font-black italic tracking-tighter">{item.total_viewers}</div>
                      <div className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Peak: {item.peak_viewers}</div>
                   </div>

                   <div>
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
                         <Gift size={10} /> Gift Influx
                      </div>
                      <div className="text-xl font-black italic tracking-tighter">{item.total_gifts}</div>
                      <div className="text-[9px] font-bold text-indigo-400 uppercase mt-1">+{item.total_coins} Coins</div>
                   </div>

                   <div>
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
                         <MessageSquare size={10} /> Engagement
                      </div>
                      <div className="text-xl font-black italic tracking-tighter">{item.new_followers} <span className="text-xs opacity-40">Subs</span></div>
                      <div className="text-[9px] font-bold text-white/20 uppercase mt-1">Real-time stats</div>
                   </div>

                   <div>
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
                         <Clock size={10} /> Air Time
                      </div>
                      <div className="text-xl font-black italic tracking-tighter">{item.stream_duration} <span className="text-xs opacity-40">Min</span></div>
                      <div className="text-[9px] font-bold text-white/20 uppercase mt-1">Room: {item.room_id.substring(0, 8)}</div>
                   </div>
                </div>

                <div className="flex-shrink-0 self-start md:self-center">
                   <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <ArrowUpRight size={20} className="text-white/40 group-hover:text-indigo-400 transition-colors" />
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Insight */}
      <div className="mt-16 text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
         Oracle Phase 6.3 Sync Engine &copy; 2026 Analytics Center
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
