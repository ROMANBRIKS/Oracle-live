import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Hls from "hls.js";
import { 
  ChevronLeft, 
  MessageSquare, 
  Gift, 
  Heart, 
  Users, 
  Flame, 
  Share2, 
  Flag,
  MoreVertical,
  Activity,
  Zap,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ViewerPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [likes, setLikes] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real implementation, the streamUrl would be generated via the HLS transcoding service
    // We'll use a test HLS stream or a fallback for demo
    const streamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(e => console.log("Auto-play blocked"));
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = streamUrl;
      videoRef.current.play().catch(e => console.log("Auto-play blocked"));
    }
  }, [roomId]);

  const handleLike = () => {
    setLikes(prev => prev + 1);
    // Trigger animation effectively
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Video Content */}
      <video 
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        autoPlay
        muted={false}
      />

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

      {/* Interactive Layer */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-start justify-between">
           <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl rounded-[2rem] p-2 pr-6 border border-white/10 pointer-events-auto">
              <div className="w-12 h-12 rounded-[1.5rem] overflow-hidden border-2 border-indigo-500">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${roomId}`} alt="streamer" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                 <h3 className="text-sm font-black italic tracking-tighter uppercase truncate w-24">@{roomId || 'Streamer'}</h3>
                 <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Verified</span>
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Rank #12</span>
                 </div>
              </div>
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`ml-4 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isFollowing ? 'bg-white/10 text-white/40' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'}`}
              >
                 {isFollowing ? 'Following' : 'Follow'}
              </button>
           </div>

           <div className="flex items-center gap-3 pointer-events-auto">
              <div className="flex items-center gap-4 px-6 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem]">
                 <div className="flex items-center gap-2">
                    <Users size={14} className="text-white/40" />
                    <span className="text-xs font-black italic">2.8K</span>
                 </div>
                 <div className="w-px h-3 bg-white/10" />
                 <div className="flex items-center gap-2">
                    <Flame size={14} className="text-orange-500" />
                    <span className="text-xs font-black italic text-orange-500">12.5K</span>
                 </div>
              </div>
              <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-black/60 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                 <X size={24} />
              </button>
           </div>
        </div>

        {/* Floating Icons / Reactions Area (Empty for future animations) */}
        <div className="flex-1 flex flex-col items-center justify-center">
           <AnimatePresence>
              {likes > 0 && Array.from({ length: Math.min(likes, 5) }).map((_, i) => (
                <motion.div
                  key={`${likes}-${i}`}
                  initial={{ opacity: 1, y: 0, scale: 0.5, rotate: Math.random() * 40 - 20 }}
                  animate={{ opacity: 0, y: -200, scale: 1.5 }}
                  transition={{ duration: 1.5 }}
                  className="absolute text-red-500 pointer-events-none"
                >
                  <Heart size={48} fill="currentColor" />
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* Bottom Interaction Bar */}
        <div className="flex items-center gap-4">
           <div className="flex-1 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-2 flex items-center gap-4 pointer-events-auto">
              <input 
                type="text" 
                placeholder="Type something..." 
                className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-medium placeholder:text-white/20"
              />
              <button className="w-12 h-12 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <MessageSquare size={20} />
              </button>
           </div>

           <div className="flex items-center gap-3 pointer-events-auto">
              <button 
                onClick={handleLike}
                className="w-14 h-14 rounded-[1.8rem] bg-red-500 border border-red-400/20 flex items-center justify-center shadow-lg shadow-red-500/40 transform active:scale-90 transition-transform"
              >
                 <Heart size={28} fill="currentColor" />
              </button>
              <button className="w-14 h-14 rounded-[1.8rem] bg-indigo-600 border border-indigo-400/20 flex items-center justify-center shadow-lg shadow-indigo-500/40 relative">
                 <Gift size={28} />
                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black">9</div>
              </button>
              <button className="w-14 h-14 rounded-[1.8rem] bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center">
                 <Share2 size={24} />
              </button>
              <button className="w-14 h-14 rounded-[1.8rem] bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center">
                 <MoreVertical size={24} />
              </button>
           </div>
        </div>
      </div>

      {/* Side HUD Stats */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 space-y-4 pointer-events-none opacity-40">
         <div className="flex flex-col items-center gap-1">
            <Zap size={14} className="text-amber-500" />
            <span className="text-[8px] font-black tracking-widest text-amber-500 uppercase">HLS</span>
         </div>
         <div className="flex flex-col items-center gap-1">
            <Activity size={14} className="text-emerald-500" />
            <span className="text-[8px] font-black tracking-widest text-emerald-500 uppercase">CDN</span>
         </div>
         <div className="flex flex-col items-center gap-1">
            <TrendingUp size={14} className="text-indigo-400" />
            <span className="text-[8px] font-black tracking-widest text-indigo-400 uppercase">4K</span>
         </div>
      </div>
    </div>
  );
};

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

export default ViewerPage;
