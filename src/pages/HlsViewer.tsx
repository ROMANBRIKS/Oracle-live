import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Loader2, Settings, Users, 
  ShieldCheck, Share2, Heart, MessageCircle,
  TrendingDown, Maximize2
} from "lucide-react";

const HlsViewer: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qualities, setQualities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<any>(null);

  const loadStream = async () => {
    if (!roomId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`/api/hls/${roomId}`);
      const data = res.data;
      setStreamInfo(data);
      setQualities(data.quality_levels || []);

      if (Hls.isSupported() && videoRef.current) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });
        
        hls.loadSource(data.hls_url);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
           setLoading(false);
           videoRef.current?.play().catch(e => console.error("Autoplay blocked", e));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error("Fatal network error encountered, try to recover");
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error("Fatal media error encountered, try to recover");
                        hls.recoverMediaError();
                        break;
                    default:
                        console.error("Fatal error, cannot recover");
                        hls.destroy();
                        setError("CDN stream unavailable. Stream might be offline.");
                        break;
                }
            }
        });

      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari)
        videoRef.current.src = data.hls_url;
        videoRef.current.addEventListener('loadedmetadata', () => {
          setLoading(false);
          videoRef.current?.play();
        });
      } else {
        setError("Your browser does not support HLS playback.");
      }
    } catch (err: any) {
      console.error("HLS Load Error:", err);
      setError("Stream connection failed. Server might be under maintenance.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStream();
  }, [roomId]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
       <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <button onClick={() => navigate("/")} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                   <ArrowLeft size={24} />
                </button>
                <div>
                   <h1 className="text-3xl font-black italic uppercase tracking-tighter">HLS Scalable Broadcast</h1>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                      <ShieldCheck size={12} /> Secure CDN Edge Node • 1080p
                   </p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="bg-red-600 px-3 py-1.5 rounded-full flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Live HLS</span>
                </div>
             </div>
          </div>

          {/* Player Container */}
          <div className="relative group">
             <div className="liquid-glass rounded-[3rem] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,1)] aspect-video overflow-hidden bg-zinc-950 relative">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                />
                
                {loading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 space-y-4">
                      <Loader2 className="animate-spin text-cyan-500" size={60} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Buffering CDN Segments...</p>
                   </div>
                )}

                {error && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-12 text-center">
                      <TrendingDown size={64} className="text-white/10 mb-6" />
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Stream Error</h2>
                      <p className="text-white/40 text-sm font-bold max-w-sm mb-8 italic">{error}</p>
                      <button onClick={() => window.location.reload()} className="liquid-glass border-white/20 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                         Reconnect Payload
                      </button>
                   </div>
                )}

                {/* Player Overlays */}
                <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                   <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-3 rounded-2.5xl border border-white/10">
                      <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20">
                         <Maximize2 size={18} />
                      </button>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="flex gap-2">
                         {qualities.map(q => (
                            <button key={q} className="px-3 py-1.5 rounded-lg bg-white/5 text-[8px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all border border-white/5">
                               {q}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* Background Glow */}
             <div className="absolute -inset-10 bg-cyan-500/5 blur-[120px] -z-10" />
          </div>

          {/* Interaction Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-3xl">
                   <Users className="text-white/30" size={20} />
                   <span className="text-xl font-black italic tracking-tighter">{streamInfo?.viewers || 0} <span className="text-[9px] font-black uppercase tracking-widest opacity-30 not-italic ml-1">Live Viewers</span></span>
                </div>
                <div className="hidden md:flex items-center gap-4">
                   <button className="w-14 h-14 rounded-2.5xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-500/20 hover:text-pink-500 transition-all">
                      <Heart size={24} />
                   </button>
                   <button className="w-14 h-14 rounded-2.5xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-500/20 hover:text-cyan-500 transition-all">
                      <MessageCircle size={24} />
                   </button>
                </div>
             </div>
             <button className="bg-emerald-500 text-black px-10 py-5 rounded-3xl text-sm font-black italic uppercase tracking-tighter flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
                <Share2 size={20} /> Share Broadcast
             </button>
          </div>
       </div>
    </div>
  );
};

export default HlsViewer;
