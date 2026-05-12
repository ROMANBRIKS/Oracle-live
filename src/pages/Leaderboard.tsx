import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Medal, Star, Flame, 
  ArrowUp, User, Coins, Crown,
  Timer, Globe, Calendar, CalendarDays,
  ArrowLeft, ChevronRight, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type LeaderboardType = 'streamer' | 'gifter';
type Timeframe = 'daily' | 'weekly' | 'monthly' | 'global';

interface Leader {
  user_id: string;
  username: string;
  avatar: string;
  level: number;
  daily_points: number;
  weekly_points: number;
  monthly_points: number;
  global_points: number;
}

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [type, setType] = useState<LeaderboardType>("streamer");
  const [timeframe, setTimeframe] = useState<Timeframe>("global");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadRankings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/leaderboard/${timeframe}/${type}`);
      setLeaders(res.data);
    } catch (err) {
      console.error("Failed to load rankings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, [type, timeframe]);

  const getPointValue = (leader: Leader) => {
    switch(timeframe) {
        case 'daily': return leader.daily_points;
        case 'weekly': return leader.weekly_points;
        case 'monthly': return leader.monthly_points;
        default: return leader.global_points;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
       {/* High-End Header */}
       <div className="relative overflow-hidden pt-12 pb-24 px-6 md:px-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
          <div className="z-10">
             <button onClick={() => navigate("/")} className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to Hall</span>
             </button>
             <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-4">
                Grand <br /> <span className="text-cyan-500">Rankings</span>
             </h1>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Real-Time Hall of Fame Logic</p>
          </div>
          
          <div className="flex flex-col md:items-end gap-6 z-10 w-full md:w-auto">
             {/* Type Switcher */}
             <div className="liquid-glass p-1.5 rounded-full flex gap-2 w-full md:w-auto bg-white/5 border border-white/10">
                {['streamer', 'gifter'].map((t) => (
                   <button
                     key={t}
                     onClick={() => setType(t as any)}
                     className={`flex-1 md:px-10 py-3 rounded-full text-[10px] font-black uppercase italic tracking-widest transition-all ${
                       type === t ? 'bg-cyan-500 text-black shadow-xl shadow-cyan-500/20' : 'text-white/40 hover:bg-white/5'
                     }`}
                   >
                     {t === 'streamer' ? 'Legends' : 'Patrons'}
                   </button>
                ))}
             </div>

             {/* Timeframe Switcher */}
             <div className="flex flex-wrap md:justify-end gap-3 w-full md:w-auto">
                {[
                  { id: 'daily', label: 'TODAY', icon: <Timer size={14} /> },
                  { id: 'weekly', label: 'WEEK', icon: <CalendarDays size={14} /> },
                  { id: 'monthly', label: 'MONTH', icon: <Calendar size={14} /> },
                  { id: 'global', label: 'GLOBAL', icon: <Globe size={14} /> }
                ].map((tf) => (
                   <button
                     key={tf.id}
                     onClick={() => setTimeframe(tf.id as any)}
                     className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                       timeframe === tf.id 
                       ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/20' 
                       : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                     }`}
                   >
                     {tf.icon} {tf.label}
                   </button>
                ))}
             </div>
          </div>

          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 blur-[200px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[150px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
       </div>

       <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Top 3 Podium */}
          <div className="lg:col-span-5 space-y-12">
             <div className="relative">
                <div className="text-center mb-12">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-2">The Vanguard</p>
                   <h2 className="text-4xl font-black italic uppercase tracking-tighter">Podium Mastery</h2>
                </div>

                <div className="flex justify-center items-end gap-4 md:gap-8 pb-12">
                   {/* #2 */}
                   {leaders[1] && <TopLeader leader={leaders[1]} rank={2} color="silver" />}
                   {/* #1 */}
                   {leaders[0] && <TopLeader leader={leaders[0]} rank={1} color="gold" />}
                   {/* #3 */}
                   {leaders[2] && <TopLeader leader={leaders[2]} rank={3} color="bronze" />}
                </div>
             </div>

             <div className="liquid-glass border-white/10 p-10 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4">Daily Challenge</h3>
                   <p className="text-sm font-bold text-white/40 mb-8 italic leading-relaxed">Top 10 streamers of the week receive <span className="text-amber-400">Limited Edition Crown Badges</span> and a share of the Oracle Bonus Pool.</p>
                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        className="h-full bg-cyan-500" 
                      />
                   </div>
                   <div className="flex justify-between mt-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Pool Progress</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">653,400 COINS</span>
                   </div>
                </div>
                <div className="absolute top-0 right-0 p-8">
                   <Crown className="text-white/5" size={120} />
                </div>
             </div>
          </div>

          {/* List View */}
          <div className="lg:col-span-7">
             <div className="liquid-glass border-white/5 rounded-[4rem] bg-zinc-950 overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter">The Hall of Fame</h3>
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-cyan-500">Live Updating</span>
                   </div>
                </div>

                <div className="divide-y divide-white/5">
                   <AnimatePresence mode="popLayout">
                      {leaders.slice(3).map((leader, i) => (
                         <motion.div
                            layout
                            key={leader.user_id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                         >
                            <div className="flex items-center gap-8">
                               <span className="text-xl font-black italic text-white/10 w-8">#{i + 4}</span>
                               <div className="relative">
                                  <img 
                                    src={leader.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} 
                                    className="w-16 h-16 rounded-2.5xl object-cover ring-2 ring-white/5 group-hover:ring-cyan-500/30 transition-all"
                                    alt={leader.username}
                                  />
                                  <div className="absolute -bottom-2 -right-2 bg-zinc-900 border border-white/10 px-2 py-0.5 rounded-lg text-[8px] font-black tracking-tighter">
                                     LVL {leader.level}
                                  </div>
                               </div>
                               <div>
                                  <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 group-hover:text-cyan-500 transition-colors">{leader.username}</h4>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Oracle Elite Member</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="flex items-center justify-end gap-2 text-amber-400 mb-1">
                                  <Coins size={14} />
                                  <span className="text-xl font-black italic tracking-tighter">{getPointValue(leader).toLocaleString()}</span>
                               </div>
                               <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Contribution Points</p>
                            </div>
                         </motion.div>
                      ))}
                   </AnimatePresence>
                </div>

                {leaders.length === 0 && !loading && (
                   <div className="py-24 text-center">
                      <Sparkles className="mx-auto text-white/5 mb-4" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No rankings available for this cycle</p>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

const TopLeader = ({ leader, rank, color }: { leader: Leader, rank: number, color: 'gold' | 'silver' | 'bronze' }) => {
  const colorMap = {
    gold: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    silver: 'text-slate-300 border-slate-300/30 bg-slate-300/10',
    bronze: 'text-orange-400 border-orange-400/30 bg-orange-400/10'
  };

  const ringMap = {
    gold: 'ring-amber-400/50 scale-125 mb-12',
    silver: 'ring-slate-300/30 scale-100 mb-6',
    bronze: 'ring-orange-400/30 scale-90 mb-2'
  };

  return (
    <div className={`flex flex-col items-center ${rank === 1 ? 'z-20' : 'z-10'}`}>
       <div className={`relative ${ringMap[color]}`}>
          <div className="relative p-2 rounded-[2.5rem] bg-zinc-950 border border-white/10 shadow-2xl">
             <img 
               src={leader.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} 
               className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] object-cover"
               alt={leader.username}
             />
             <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl flex items-center justify-center border font-black italic text-xl shadow-xl ${colorMap[color]}`}>
                {rank}
             </div>
          </div>
          {rank === 1 && (
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
               className="absolute -inset-4 border-2 border-dashed border-cyan-500/20 rounded-[3rem] -z-10" 
             />
          )}
       </div>
       <div className="text-center">
          <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter truncate w-32 md:w-40">{leader.username}</h3>
          <div className="flex items-center justify-center gap-1.5 mt-1 border border-white/5 bg-white/5 rounded-full px-3 py-1">
             <Coins size={12} className="text-amber-400" />
             <span className="text-sm font-black italic tracking-tighter text-amber-400">
                {(leader.global_points > 1000000 ? (leader.global_points / 1000000).toFixed(1) + 'M' : leader.global_points.toLocaleString())}
             </span>
          </div>
       </div>
    </div>
  );
};

export default Leaderboard;
