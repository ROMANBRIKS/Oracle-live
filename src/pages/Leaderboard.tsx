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
  _id: string;
  userId: string;
  username: string;
  avatar: string;
  region: string;
  level: number;
  points: number;
  badges: string[];
  dailyPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  seasonPoints: number;
}

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [category, setCategory] = useState<LeaderboardType>("streamer");
  const [timeframe, setTimeframe] = useState<Timeframe>("global");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadRankings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/leaderboards/${timeframe}/${category}`);
      setLeaders(res.data);
    } catch (err) {
      console.error("Failed to load rankings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, [category, timeframe]);

  const getPointValue = (leader: Leader) => {
    return leader.points;
  };

  return (
    <div className="min-h-screen bg-crystal-void text-white pb-32 relative overflow-x-hidden">
       {/* Background Decorative Blur */}
       <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 blur-[200px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
       <div className="fixed top-1/2 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[150px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

       {/* High-End Header */}
       <div className="relative pt-12 pb-24 px-6 md:px-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl mx-auto z-10">
          <div>
             <button onClick={() => navigate("/")} className="mb-10 flex items-center gap-3 text-white/30 hover:text-white transition-all group">
                <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Back to Feed</span>
             </button>
             <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mb-6">
                Oracle <br /> <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">Hierarchy</span>
             </h1>
             <div className="flex items-center gap-3">
                 <div className="w-8 h-0.5 bg-cyan-400/50" />
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Validated Excellence Engine</p>
             </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-10 w-full md:w-auto">
             {/* Type Switcher */}
             <div className="liquid-pill p-1.5 flex gap-2 w-full md:w-auto border border-white/10">
                {['streamer', 'gifter'].map((t) => (
                   <button
                     key={t}
                     onClick={() => setCategory(t as any)}
                     className={`flex-1 md:px-12 py-4 rounded-[2rem] text-[10px] font-black uppercase italic tracking-[0.2em] transition-all ${
                       category === t ? 'bg-cyan-400 text-black shadow-2xl shadow-cyan-400/30' : 'text-white/30 hover:text-white'
                     }`}
                   >
                     {t === 'streamer' ? 'Legends' : 'Patrons'}
                   </button>
                ))}
             </div>

             {/* Timeframe Switcher */}
             <div className="flex flex-wrap md:justify-end gap-4 w-full md:w-auto">
                {[
                  { id: 'daily', label: '24H', icon: <Timer size={14} /> },
                  { id: 'weekly', label: 'WEEK', icon: <CalendarDays size={14} /> },
                  { id: 'monthly', label: 'MONTH', icon: <Calendar size={14} /> },
                  { id: 'global', label: 'EPOCH', icon: <Globe size={14} /> }
                ].map((tf) => (
                   <button
                     key={tf.id}
                     onClick={() => setTimeframe(tf.id as any)}
                     className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                       timeframe === tf.id 
                       ? 'bg-white/15 border-white/30 text-white shadow-xl' 
                       : 'bg-white/5 border-white/5 text-white/20 hover:text-white hover:border-white/20'
                     }`}
                   >
                     {tf.icon} {tf.label}
                   </button>
                ))}
             </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
          {/* Top 3 Podium */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-16">
             <div className="relative">
                <div className="text-center mb-16">
                   <div className="flex items-center justify-center gap-3 mb-4">
                       <div className="h-px w-8 bg-cyan-400/30" />
                       <p className="text-[10px] font-black uppercase tracking-[0.6em] text-cyan-400 italic">The Sovereign Trio</p>
                       <div className="h-px w-8 bg-cyan-400/30" />
                   </div>
                   <h2 className="text-5xl font-black italic uppercase tracking-tighter">Ascension Podium</h2>
                </div>

                <div className="flex justify-center items-end gap-4 md:gap-12 pb-16">
                   {/* #2 */}
                   {leaders[1] && <TopLeader leader={leaders[1]} rank={2} color="silver" />}
                   {/* #1 */}
                   {leaders[0] && <TopLeader leader={leaders[0]} rank={1} color="gold" />}
                   {/* #3 */}
                   {leaders[2] && <TopLeader leader={leaders[2]} rank={3} color="bronze" />}
                </div>
             </div>

             <div className="crystal-glass p-10 rounded-[3.5rem] relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-6">
                       <div className="w-10 h-10 crystal-button bg-cyan-400/10 shadow-none border-white/10">
                           <Crown size={20} className="text-cyan-400" />
                       </div>
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter">Dominion rewards</h3>
                   </div>
                   <p className="text-sm font-bold text-white/40 mb-10 italic leading-relaxed">Top 10 streamers this Epoch unlock <span className="text-cyan-400">Exclusive Oracle Badges</span> and a proportional distribution from the Divine Pool.</p>
                   
                   <div className="space-y-4">
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "78%" }}
                                className="h-full bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
                            />
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 italic">Pool Saturation</span>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400">782,400 <span className="text-[8px] opacity-60">COINS</span></span>
                        </div>
                   </div>
                </div>
                {/* Decorative Crown */}
                <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                   <Crown size={240} className="text-white" />
                </div>
             </div>
          </div>

          {/* List View */}
          <div className="lg:col-span-12 xl:col-span-7">
             <div className="crystal-glass rounded-[4rem] overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                   <div className="flex flex-col">
                       <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Hall of <span className="text-cyan-400">Excellence</span></h3>
                       <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-1 italic">Secondary Stratum discovery</p>
                   </div>
                   <div className="flex items-center gap-3 px-5 py-2 liquid-glass rounded-full border border-white/10">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 italic">Live Sync</span>
                   </div>
                </div>

                <div className="divide-y divide-white/5">
                   <AnimatePresence mode="popLayout">
                      {leaders.slice(3).map((leader, i) => (
                         <motion.div
                            layout
                            key={leader.userId || leader._id}
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="p-10 flex items-center justify-between group hover:bg-white/[0.03] transition-all"
                         >
                            <div className="flex items-center gap-10">
                               <span className="text-2xl font-black italic text-white/10 w-12 group-hover:text-cyan-400/20 transition-colors">#{i + 4}</span>
                               <div className="relative">
                                  <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-br from-white/10 to-transparent group-hover:from-cyan-400/40 transition-all duration-500">
                                    <img 
                                        src={leader.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} 
                                        className="w-full h-full rounded-[0.9rem] object-cover bg-black"
                                        alt={leader.username}
                                    />
                                  </div>
                                  <div className="absolute -bottom-2 -right-2 bg-cyan-400 text-black px-2 py-0.5 rounded-lg text-[9px] font-black tracking-tighter italic shadow-xl">
                                     L{leader.level}
                                  </div>
                               </div>
                               <div>
                                  <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-white group-hover:translate-x-2 transition-transform duration-300">@{leader.username}</h4>
                                  <div className="flex items-center gap-3">
                                     {leader.badges && leader.badges.map(badge => (
                                        <span key={badge} className="text-[8px] font-black uppercase px-2.5 py-1 bg-cyan-400/10 text-cyan-400 border border-cyan-400/10 rounded-lg italic">
                                           {badge}
                                        </span>
                                     ))}
                                     {(!leader.badges || leader.badges.length === 0) && (
                                        <div className="flex items-center gap-2">
                                            <Globe size={10} className="text-white/20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">{leader.region || 'Global Hub'}</p>
                                        </div>
                                     )}
                                  </div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="flex items-center justify-end gap-3 text-cyan-400 mb-2">
                                  <Coins size={18} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                  <span className="text-3xl font-black italic tracking-tighter">{getPointValue(leader).toLocaleString()}</span>
                               </div>
                               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">Influence Quotient</p>
                            </div>
                         </motion.div>
                      ))}
                   </AnimatePresence>
                </div>

                {leaders.length === 0 && !loading && (
                   <div className="py-32 text-center opacity-40">
                      <Sparkles className="mx-auto text-cyan-400/20 mb-6" size={64} />
                      <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30 italic">Calculating Hierarchy Status...</p>
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
    gold: 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_25px_rgba(34,211,238,0.3)]',
    silver: 'text-white border-white/20 bg-white/5',
    bronze: 'text-white/60 border-white/10 bg-black/40'
  };

  const scaleMap = {
    gold: 'scale-125 mb-16 relative',
    silver: 'scale-100 mb-8 grayscale-[0.3]',
    bronze: 'scale-90 mb-4 grayscale-[0.6]'
  };

  const crownMap = {
    gold: <Crown size={32} className="text-cyan-400 absolute -top-12 left-1/2 -translate-x-1/2 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />,
    silver: null,
    bronze: null
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank === 1 ? 0.2 : rank === 2 ? 0.4 : 0.6 }}
        className={`flex flex-col items-center ${rank === 1 ? 'z-50' : 'z-10'}`}
    >
       <div className={`${scaleMap[color]}`}>
          {crownMap[color]}
          <div className="relative p-2.5 rounded-[3rem] crystal-glass border-white/20">
             <img 
               src={leader.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} 
               className="w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] object-cover ring-2 ring-white/10"
               alt={leader.username}
             />
             <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-[1.2rem] flex items-center justify-center border font-black italic text-2xl shadow-2xl ${colorMap[color]}`}>
                {rank}
             </div>
          </div>
          {rank === 1 && (
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
               className="absolute -inset-8 border border-dashed border-cyan-400/30 rounded-[4rem] -z-10" 
             />
          )}
       </div>
       <div className="text-center mt-6">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter truncate w-32 md:w-48 text-white">@{leader.username}</h3>
          <div className="flex items-center justify-center gap-2 mt-2 crystal-pill px-5 py-2 border-white/5">
             <Coins size={14} className="text-cyan-400" />
             <span className="text-base font-black italic tracking-tighter text-cyan-400">
                {(leader.points > 1000000 ? (leader.points / 1000000).toFixed(1) + 'M' : leader.points.toLocaleString())}
             </span>
          </div>
       </div>
    </motion.div>
  );
};

export default Leaderboard;
