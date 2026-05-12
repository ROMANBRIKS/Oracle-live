import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Play, 
  History, 
  Eye, 
  Heart, 
  ChevronLeft, 
  Search, 
  Film, 
  Share2,
  Activity,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import Hls from "hls.js";

interface Clip {
  id: number;
  streamer_id: string;
  streamer_name: string;
  streamer_avatar: string;
  room_id: string;
  title: string;
  thumbnail: string;
  clip_url: string;
  duration: number;
  views: number;
  likes: number;
  created_at: string;
}

const ClipsPage: React.FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const navigate = useNavigate();
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const loadClips = async () => {
    try {
      const res = await axios.get("/api/clips/all");
      setClips(res.data);
    } catch (err) {
      console.error("Failed to load clips archive", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClips();
  }, []);

  useEffect(() => {
    if (activeClip && videoRef.current) {
        const streamUrl = `/${activeClip.clip_url}`;
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoRef.current?.play();
            });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = streamUrl;
            videoRef.current.play();
        }
    }
  }, [activeClip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                 Highlights <span className="text-white/20">& Clips</span>
              </h1>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mt-1 ml-1 flex items-center gap-2">
                <Zap size={10} className="text-indigo-500" /> 15s Captured Moments Registry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-6 py-3 bg-zinc-900 rounded-[1.5rem] border border-white/5">
             <Search size={18} className="text-white/20" />
             <input 
                type="text" 
                placeholder="SEARCH CLIPS..." 
                className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest placeholder:text-white/10 w-48"
             />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {activeClip ? (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-20 grid grid-cols-1 lg:grid-cols-3 gap-10"
           >
              <div className="lg:col-span-2 space-y-6">
                 <div className="aspect-video bg-zinc-900 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
                    <video ref={videoRef} controls className="w-full h-full object-cover" />
                 </div>
                 <div className="flex items-center justify-between p-8 bg-zinc-900/50 rounded-[2.5rem] border border-white/5">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-0.5">
                          <img src={activeClip.streamer_avatar} className="w-full h-full rounded-[0.9rem] object-cover" alt="avatar" />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black italic tracking-tighter uppercase">{activeClip.title}</h2>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-xs font-bold text-indigo-400">@{activeClip.streamer_name}</span>
                             <div className="w-1 h-1 bg-white/10 rounded-full" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                                Captured {new Date(activeClip.created_at).toLocaleDateString()}
                             </span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                           <Share2 size={12} /> Share Clip
                        </button>
                        <button 
                            onClick={() => setActiveClip(null)}
                            className="px-8 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
                        >
                            Close
                        </button>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/10 h-full flex flex-col justify-center">
                    <Zap className="text-indigo-500 mb-4" size={48} />
                    <h4 className="text-xl font-black uppercase tracking-widest mb-2 italic">Short Highlight</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase leading-relaxed tracking-wider">
                       This is a 15-second capture of a live stream. No full recordings are stored to preserve space and focus on quality moments.
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-4">
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <Eye size={16} className="text-indigo-400 mb-2" />
                          <span className="block text-lg font-black">{activeClip.views.toLocaleString()}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Views</span>
                       </div>
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <Heart size={16} className="text-red-400 mb-2" />
                          <span className="block text-lg font-black">{activeClip.likes.toLocaleString()}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Likes</span>
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>
        ) : null}

        {/* Clip Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {clips.map((clip, idx) => (
             <motion.div 
               key={clip.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.05 }}
               onClick={() => setActiveClip(clip)}
               className="group cursor-pointer"
             >
                <div className="aspect-[4/3] rounded-[2.5rem] bg-zinc-900 relative overflow-hidden border border-white/5 group-hover:border-indigo-500/30 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all">
                   <img 
                    src={clip.thumbnail || `https://picsum.photos/seed/${clip.id}/800/600`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" 
                    alt="thumb" 
                   />
                   
                   {/* Duration Pill */}
                   <div className="absolute top-4 left-4">
                      <div className="px-3 py-1 bg-indigo-600 rounded-full border border-indigo-400/20 flex items-center gap-1.5 font-mono text-[9px] font-black">
                         15s CLIP
                      </div>
                   </div>

                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 text-white">
                      <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl">
                         <Play size={24} fill="currentColor" className="ml-1" />
                      </div>
                   </div>

                   <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <Eye size={12} className="text-white/20" />
                             <span className="text-[10px] font-black italic text-white/40">{clip.views.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <Heart size={12} className="text-white/20" />
                             <span className="text-[10px] font-black italic text-white/40">{clip.likes.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-4 px-2">
                   <h4 className="text-sm font-black italic tracking-tighter uppercase truncate">{clip.title}</h4>
                   <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">@{clip.streamer_name}</span>
                      <span className="text-[9px] font-mono text-white/10 uppercase">{new Date(clip.created_at).toLocaleDateString()}</span>
                   </div>
                </div>
             </motion.div>
           ))}

           {/* Empty State */}
           {clips.length === 0 && (
             <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
                <Film className="mx-auto text-white/5 mb-6" size={64} />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/10">No captured moments found</p>
             </div>
           )}
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
    </div>
  );
};

export default ClipsPage;
