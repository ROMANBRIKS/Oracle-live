import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { 
  BarChart3, Users, Gift, Coins, 
  Clock, UserPlus, Heart, Share2,
  TrendingUp, Calendar, ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StreamAnalytics {
  id: string;
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
}

const CreatorAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<StreamAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadAnalytics = async () => {
    try {
      const res = await axios.get(`/api/analytics/streamer/${user.id}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalEarnings = analytics.reduce((sum, s) => sum + s.total_coins, 0);
  const totalViewers = analytics.reduce((sum, s) => sum + s.total_viewers, 0);

  return (
    <div className="min-h-screen bg-black text-white pb-32">
       {/* Hero Section */}
       <div className="relative h-[40vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-black z-0" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          
          <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12">
            <button onClick={() => navigate("/dashboard")} className="mb-8 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
                    <TrendingUp size={14} /> Performance Center
                  </div>
                  <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Stream Insights</h1>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest max-w-xs leading-relaxed">
                    Analyzing your growth, engagement, and revenue across all broadcast sessions.
                  </p>
               </div>
               
               <div className="flex gap-4">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Total Impact</p>
                     <p className="text-3xl font-black italic tracking-tighter">{totalEarnings.toLocaleString()} <span className="text-xs opacity-40">COINS</span></p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Total Reach</p>
                     <p className="text-3xl font-black italic tracking-tighter">{totalViewers.toLocaleString()} <span className="text-xs opacity-40">VIEWS</span></p>
                  </div>
               </div>
            </div>
          </div>
       </div>

       <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-white/5 rounded-[3rem] animate-pulse border border-white/5" />
              ))
            ) : analytics.length === 0 ? (
              <div className="py-32 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10">
                 <BarChart3 className="mx-auto text-white/10 mb-6" size={80} />
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">No Data Found</h2>
                 <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Start broadcasting to see your performance metrics here.</p>
              </div>
            ) : (
              analytics.map((stream, i) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] hover:bg-white/[0.08] transition-all group"
                >
                   <div className="flex flex-wrap items-start justify-between gap-8 mb-10">
                      <div className="space-y-3">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">Session Completed</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1">
                               <Calendar size={12} />
                               {new Date(stream.created_at).toLocaleDateString()}
                            </span>
                         </div>
                         <h3 className="text-4xl font-black italic uppercase tracking-tighter">
                           Stream: {stream.room_id}
                         </h3>
                      </div>
                      
                      <div className="flex items-center gap-6">
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Earnings</p>
                            <p className="text-3xl font-black italic text-emerald-400 tracking-tighter">+{stream.total_coins} <span className="text-xs opacity-40">ORACLE</span></p>
                         </div>
                         <div className="w-16 h-16 bg-white/5 rounded-2.5xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                            <ChevronRight size={24} className="text-white/20 group-hover:text-white transition-colors" />
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                      <MetricCard icon={<Users size={16} />} label="Total Viewers" value={stream.total_viewers} />
                      <MetricCard icon={<TrendingUp size={16} />} label="Peak View" value={stream.peak_viewers} />
                      <MetricCard icon={<Gift size={16} />} label="Gifts Received" value={stream.total_gifts} />
                      <MetricCard icon={<Clock size={16} />} label="Watch Time" value={`${Math.floor(stream.watch_time / 60)}m`} />
                      <MetricCard icon={<UserPlus size={16} />} label="New Fans" value={stream.new_followers} />
                      <MetricCard icon={<Heart size={16} />} label="Likes" value={stream.likes} />
                      <MetricCard icon={<Share2 size={16} />} label="Shares" value={stream.shares} />
                      <MetricCard icon={<Clock size={16} />} label="Duration" value={`${stream.stream_duration}m`} />
                   </div>
                </motion.div>
              ))
            )}
          </div>
       </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-black/40 border border-white/5 p-5 rounded-[2rem] space-y-3">
    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/30">
      {icon}
    </div>
    <div>
       <p className="text-xl font-black italic tracking-tighter">{value}</p>
       <p className="text-[8px] font-black uppercase tracking-widest text-white/20 truncate">{label}</p>
    </div>
  </div>
);

export default CreatorAnalytics;
