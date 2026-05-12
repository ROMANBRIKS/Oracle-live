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
  Star
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
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase flex items-center gap-3">
             For <span className="text-indigo-500">You</span>
          </h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
            <Zap size={10} className="text-indigo-500" /> AI-Augmented Discovery Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                </div>
              ))}
           </div>
           <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
              2.4K Viewing Now
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {streams.length === 0 ? (
          <div className="text-center py-40 bg-zinc-900/30 rounded-[4rem] border border-dashed border-white/10">
             <Sparkles className="mx-auto text-white/5 mb-6" size={64} />
             <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">The algorithm is priming. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {streams.map((stream, idx) => (
              <motion.div 
                key={stream.room_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/room/${stream.room_id}`)}
                className="group relative cursor-pointer"
              >
                {/* Preview Card */}
                <div className="rounded-[3rem] bg-zinc-900 overflow-hidden aspect-[4/5] relative border border-white/5 hover:border-indigo-500/40 transition-all shadow-2xl hover:shadow-indigo-500/20">
                  {/* Background Mock / Placeholder for stream view */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Stats Overlay Top */}
                  <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                     <div className="px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                        <div className="w-px h-2.5 bg-white/10" />
                        <span className="text-[10px] font-black tracking-tighter italic flex items-center gap-1">
                           <Eye size={10} /> {stream.live_viewers.toLocaleString()}
                        </span>
                     </div>

                     {stream.trending_score > 0 && (
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                           <Flame size={20} className="text-white animate-bounce" />
                        </div>
                     )}
                  </div>

                  {/* Play Button Center */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl translate-y-4 group-hover:translate-y-0 transition-transform">
                         <Play size={32} fill="currentColor" />
                      </div>
                  </div>

                  {/* Info Overlay Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-[1.5rem] border-2 border-indigo-500 p-0.5 bg-black">
                           <img 
                              src={stream.streamer_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.room_id}`} 
                              alt="avatar" 
                              className="w-full h-full rounded-[1.2rem] object-cover"
                           />
                        </div>
                        <div>
                           <h3 className="text-xl font-black italic tracking-tighter uppercase truncate w-40">@{stream.streamer_name || 'Streamer'}</h3>
                           <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Verified Broadcast</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 flex-shrink-0">
                           <Gift size={12} className="text-emerald-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Top Earnings</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 flex-shrink-0">
                           <TrendingUp size={12} className="text-indigo-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Viral Rank #{idx + 1}</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Score Tag (Floating UI) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-zinc-900 border border-white/10 rounded-full shadow-2xl flex items-center gap-3">
                   <div className="flex items-center gap-1.5 text-xs font-black italic tracking-tighter">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {stream.final_score.toFixed(0)}
                   </div>
                   <div className="w-px h-3 bg-white/10" />
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500">
                      <TrendingUp size={12} />
                      {((stream.engagement_rate || 0) * 0.1).toFixed(1)}%
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Categories Section */}
        <div className="mt-24">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/20">Semantic discovery</h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                 See All Categories <ChevronRight size={14} />
              </button>
           </div>
           
           <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {['Social Hub', 'PK Battles', 'Talent Show', 'Gaming Pro', 'Global Chat', 'ASMR Focus'].map((cat) => (
                <div key={cat} className="px-8 py-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] hover:bg-zinc-900 transition-colors cursor-pointer flex-shrink-0">
                   <span className="text-xs font-black uppercase tracking-widest text-white/60 group-hover:text-white">{cat}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="fixed top-0 right-0 p-40 pointer-events-none opacity-20 blur-[120px] bg-indigo-600/30 rounded-full -mr-40 -mt-40 z-0" />
      
      {/* Floating System UI */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl flex items-center gap-8 z-50">
         <div className="flex items-center gap-3">
            <Activity size={16} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Engine <span className="text-indigo-500">Online</span></span>
         </div>
         <div className="w-px h-4 bg-white/10" />
         <div className="flex items-center gap-4">
            <Heart size={16} className="text-white/20 hover:text-red-500 cursor-pointer transition-colors" />
            <MessageSquare size={16} className="text-white/20 hover:text-indigo-500 cursor-pointer transition-colors" />
         </div>
      </div>
    </div>
  );
};

export default ForYouPage;
