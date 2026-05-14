import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Sparkles, 
  Flame, 
  Eye, 
  Gift, 
  TrendingUp, 
  Play, 
  Heart, 
  MessageSquare, 
  ChevronRight,
  TrendingDown,
  Activity,
  Zap,
  Star,
  Users,
  Swords
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

interface StreamRecommendation {
  room_id: string;
  streamer_id: string;
  streamer_name: string;
  streamer_avatar: string;
  live_viewers: number;
  gift_score: number;
  final_score: number;
  trending_score: number;
  engagement_rate: number;
}

const ForYouPage: React.FC = () => {
  const [streams, setStreams] = useState<StreamRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadRecommendations = async () => {
    try {
      const res = await axios.get("/api/recommendations/for-you");
      setStreams(res.data);
    } catch (err) {
      console.error("Failed to load recommendations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crystal-void text-white p-6 pb-32 font-sans relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-16 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-6xl font-black italic tracking-tighter uppercase flex items-center gap-3">
             For <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">You</span>
          </h1>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mt-3 ml-1 flex items-center gap-2">
            <Zap size={10} className="text-cyan-400" /> Neural Discovery Engine
          </p>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/5 py-2 px-5 rounded-full"
        >
           <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden shadow-lg">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 20}`} alt="user" />
                </div>
              ))}
           </div>
           <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 animate-pulse">
              3.8K Live Now
           </div>
        </motion.div>
      </div>

      {/* Experience Portals Area */}
      <div className="max-w-7xl mx-auto mb-16 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TikTok Live Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate("/tiktok-live")}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-fuchsia-600/10 to-[#ff0050]/15 border border-white/5 p-8 flex flex-col justify-between aspect-[16/10] cursor-pointer group hover:border-[#ff0050]/40 transition-all shadow-xl"
        >
          <div className="absolute inset-0 bg-radial-gradient from-fuchsia-500/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#ff0050]/20 flex items-center justify-center border border-[#ff0050]/30 shadow-[0_0_15px_rgba(255,0,80,0.2)]">
              <Zap size={20} className="text-[#ff0050] animate-pulse" />
            </div>
            <span className="text-[9px] font-mono font-black uppercase text-[#ff0050] tracking-[0.2em] bg-[#ff0050]/10 px-2.5 py-1 rounded-full border border-[#ff0050]/20 animate-pulse">Vertical Swipe</span>
          </div>

          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-1.5 group-hover:text-[#ff0050] transition-colors">TikTok Live Room</h2>
            <p className="text-xs text-white/50 font-medium">Virtual Gifts combo animations, active vertical chat feeds & double-tap love responses</p>
          </div>
        </motion.div>

        {/* Tango Profile Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate("/tango-profile")}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-600/10 to-[#00f2ea]/15 border border-white/5 p-8 flex flex-col justify-between aspect-[16/10] cursor-pointer group hover:border-[#00f2ea]/40 transition-all shadow-xl"
        >
          <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#00f2ea]/20 flex items-center justify-center border border-[#00f2ea]/30 shadow-[0_0_15px_rgba(0,242,234,0.2)]">
              <Users size={20} className="text-[#00f2ea]" />
            </div>
            <span className="text-[9px] font-mono font-black uppercase text-[#00f2ea] tracking-[0.2em] bg-[#00f2ea]/10 px-2.5 py-1 rounded-full border border-[#00f2ea]/20">Level 55 VIP</span>
          </div>

          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-1.5 group-hover:text-[#00f2ea] transition-colors">Tango Profiler</h2>
            <p className="text-xs text-white/50 font-medium">Dynamic ranking leaderboards, high tier custom milestones & moment clips center</p>
          </div>
        </motion.div>

        {/* Cloud Replays Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate("/cloud-replays")}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600/10 to-violet-600/15 border border-white/5 p-8 flex flex-col justify-between aspect-[16/10] cursor-pointer group hover:border-indigo-500/40 transition-all shadow-xl"
        >
          <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Activity size={20} className="text-indigo-400" />
            </div>
            <span className="text-[9px] font-mono font-black uppercase text-indigo-400 tracking-[0.2em] bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">AWS Storage S3</span>
          </div>

          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-1.5 group-hover:text-indigo-400 transition-colors">Cloud Recordings</h2>
            <p className="text-xs text-white/50 font-medium">Replay storage distribution engines & responsive player quality viewings</p>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {streams.length === 0 ? (
          <div className="text-center py-40 crystal-glass rounded-[4rem]">
             <Sparkles className="mx-auto text-cyan-400/20 mb-6" size={64} />
             <p className="text-white/30 font-black uppercase tracking-[0.4em] text-[10px] italic">The algorithm is priming. Recalibrating feed...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {streams.map((stream, idx) => (
              <motion.div 
                key={stream.room_id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/room/${stream.room_id}`)}
                className="group relative cursor-pointer"
              >
                {/* Crystal Card Body */}
                <div className="rounded-[3.5rem] crystal-glass overflow-hidden aspect-[4/5] relative hover:scale-[1.02] transition-all duration-500">
                  {/* Background Mock */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black group-hover:scale-110 transition-transform duration-1000 opacity-60" />
                  
                  {/* Stats Overlay Top */}
                  <div className="absolute top-8 left-8 right-8 flex items-start justify-between z-20">
                     <div className="px-4 py-2 rounded-2xl liquid-glass flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Live</span>
                        <div className="w-px h-3 bg-white/20" />
                        <span className="text-[10px] font-black tracking-tighter italic flex items-center gap-1.5">
                           <Eye size={12} className="text-cyan-400" /> {stream.live_viewers.toLocaleString()}
                        </span>
                     </div>

                     {stream.trending_score > 0 && (
                        <div className="w-12 h-12 rounded-[1.2rem] crystal-button shadow-cyan-400/20">
                           <Flame size={24} className="text-cyan-400 animate-pulse" />
                        </div>
                     )}
                  </div>

                  {/* Play Button Center */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                      <div className="w-24 h-24 rounded-full crystal-button shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                         <Play size={32} fill="white" className="ml-1 text-white" />
                      </div>
                  </div>

                  {/* Info Overlay Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 pt-24 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
                     <div className="flex items-center gap-4 mb-5">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl border-2 border-cyan-400 p-0.5 bg-black shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                            <img 
                                src={stream.streamer_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.room_id}`} 
                                alt="avatar" 
                                className="w-full h-full rounded-[1rem] object-cover"
                            />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-black flex items-center justify-center">
                                <Zap size={8} className="text-black" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                           <h3 className="text-xl font-black italic tracking-tighter uppercase truncate w-40 text-white drop-shadow-lg">@{stream.streamer_name || 'Streamer'}</h3>
                           <div className="flex items-center gap-2">
                               <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/80 italic">Verified Oracle</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 flex-shrink-0">
                           <Gift size={12} className="text-yellow-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Elite Drops</span>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center gap-2 flex-shrink-0">
                           <TrendingUp size={12} className="text-cyan-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Viral Rank #{idx + 1}</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Score Tag (Floating Crystal Pill) */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-8 py-3 crystal-pill shadow-2xl flex items-center gap-4 z-30">
                   <div className="flex items-center gap-2 text-sm font-black italic tracking-tighter">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-white text-base leading-none">{stream.final_score.toFixed(0)}</span>
                   </div>
                   <div className="w-px h-4 bg-white/20" />
                   <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                      <Activity size={12} />
                      {((stream.engagement_rate || 0) * 0.1).toFixed(1)}%
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Categories Section */}
        <div className="mt-32">
           <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                  <h3 className="text-sm font-black uppercase tracking-[0.5em] text-white/20">Semantic discovery</h3>
                  <div className="h-0.5 w-12 bg-cyan-400/30 mt-2" />
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-3 hover:gap-5 transition-all">
                 Global Marketplaces <ChevronRight size={14} />
              </button>
           </div>
           
           <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar pt-2">
              {[
                { name: 'Social Hub', icon: <Users size={16} /> },
                { name: 'PK Battles', icon: <Swords size={16} /> },
                { name: 'Talent Show', icon: <Star size={16} /> },
                { name: 'Gaming Pro', icon: <Play size={16} /> },
                { name: 'Global Chat', icon: <MessageSquare size={16} /> },
                { name: 'ASMR Focus', icon: <Activity size={16} /> }
              ].map((cat) => (
                <motion.div 
                  key={cat.name} 
                  whileHover={{ y: -5 }}
                  className="px-10 py-6 crystal-glass rounded-[2.5rem] cursor-pointer flex-shrink-0 flex items-center gap-4 group"
                >
                   <div className="text-cyan-400 group-hover:text-white transition-colors">{cat.icon}</div>
                   <span className="text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">{cat.name}</span>
                </motion.div>
              ))}
           </div>
        </div>
      </div>

      {/* Background Decorative Blur Rings */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-20 blur-[150px] bg-cyan-500 rounded-full -mr-80 -mt-80 z-0" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-10 blur-[120px] bg-blue-600 rounded-full -ml-40 -mb-40 z-0" />
      
      {/* Floating System UI Status Pill */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-32 left-1/2 -translate-x-1/2 px-10 py-4 liquid-pill border border-cyan-400/10 flex items-center gap-8 z-50 shadow-2xl"
      >
         <div className="flex items-center gap-4">
            <div className="relative">
                <Activity size={18} className="text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
              Oracle Engine <span className="text-cyan-400">Syncing</span>
            </span>
         </div>
         <div className="w-px h-5 bg-white/20" />
         <div className="flex items-center gap-5">
            <Heart size={18} className="text-white/30 hover:text-rose-500 cursor-pointer transition-all hover:scale-110" />
            <MessageSquare size={18} className="text-white/30 hover:text-cyan-400 cursor-pointer transition-all hover:scale-110" />
            <button className="bg-cyan-400 text-black px-4 py-1 rounded-full text-[8px] font-black italic uppercase tracking-widest hover:bg-white transition-colors">Boost</button>
         </div>
      </motion.div>
    </div>
  );
};

export default ForYouPage;
