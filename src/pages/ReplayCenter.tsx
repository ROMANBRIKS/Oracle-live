import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { 
  Play, Calendar, 
  Trash2, Share2, MoreVertical, Search,
  ArrowLeft, Film, Loader2, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Clip {
  id: number;
  streamer_id: string;
  room_id: string;
  title: string;
  thumbnail: string;
  clip_url: string;
  duration: number;
  views: number;
  likes: number;
  created_at: string;
}

const ClipCenter: React.FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadClips = async () => {
    if (!user.id) return;
    try {
      const res = await axios.get(`/api/clips/creator/${user.id}`);
      setClips(res.data);
    } catch (err) {
      console.error("Failed to fetch clips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClips();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-black text-white pb-32">
       {/* Top Nav */}
       <header className="p-6 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-50 border-b border-white/5">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate("/dashboard")} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                <ArrowLeft size={24} />
             </button>
             <div>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">Moments Archive</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">15s Spotlight Clips</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Search size={16} className="text-white/20" />
                <input 
                   type="text" 
                   placeholder="SEARCH CLIPS..." 
                   className="bg-transparent border-none outline-none text-[10px] font-black tracking-widest w-40"
                />
             </div>
          </div>
       </header>

       <div className="max-w-7xl mx-auto px-6 pt-12">
          {loading ? (
             <div className="py-40 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Loading your moments...</p>
             </div>
          ) : clips.length === 0 ? (
             <div className="py-32 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10 max-w-2xl mx-auto">
                <Zap size={80} className="mx-auto text-indigo-500/20 mb-6" />
                <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">No Captured Clips</h2>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                   Use the "Zap" button during your live stream to capture <br />
                   unforgettable 15-second highlights for your fans.
                </p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clips.map((clip, i) => (
                   <motion.div
                      key={clip.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative"
                   >
                      <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-900 group-hover:border-indigo-500/30 transition-all shadow-2xl">
                         <img 
                            src={clip.thumbnail || `https://picsum.photos/seed/${clip.id}/800/600`} 
                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                            alt={clip.title}
                         />
                         
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                         
                         <button onClick={() => navigate("/clips")} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                               <Play fill="black" size={24} />
                            </div>
                         </button>

                         <div className="absolute top-4 right-4 flex gap-2">
                            <div className="bg-indigo-600 px-3 py-1 rounded-full text-[9px] font-black tracking-widest text-white">
                               15S CLIP
                            </div>
                         </div>

                         <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter truncate mb-2">{clip.title || `Moment from ${clip.room_id}`}</h3>
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <span className="text-[8px] font-black uppercase text-white/40 flex items-center gap-1">
                                     <Calendar size={10} /> {new Date(clip.created_at).toLocaleDateString()}
                                  </span>
                                  <span className="text-[8px] font-black uppercase text-white/40 flex items-center gap-1 font-mono">
                                     {clip.views.toLocaleString()} VIEWS
                                  </span>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between px-2">
                         <div className="flex gap-4">
                            <button className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-indigo-500 transition-colors flex items-center gap-1.5">
                               <Share2 size={12} /> Share
                            </button>
                            <button className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-red-500 transition-colors flex items-center gap-1.5">
                               <Trash2 size={12} /> Delete
                            </button>
                         </div>
                         <button className="text-white/20 hover:text-white transition-colors">
                            <MoreVertical size={16} />
                         </button>
                      </div>
                   </motion.div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};

export default ClipCenter;
