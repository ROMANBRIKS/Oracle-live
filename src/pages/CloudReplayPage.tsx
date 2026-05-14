import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { Play, Eye, Calendar, User, Cloud, RefreshCw, AlertCircle } from "lucide-react";

interface Replay {
  id: string;
  title: string;
  recording_url: string;
  thumbnail: string;
  viewers: number;
  duration: number;
  created_at: string;
  streamer_name: string;
  streamer_avatar: string;
}

export default function CloudReplayPage() {
  const [replays, setReplays] = useState<Replay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReplays();
  }, []);

  const loadReplays = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/cloud-replays/all");
      setReplays(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load replays", err);
      setError("Failed to sync with cloud storage. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-500 rounded-lg">
              <Cloud size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Cloud Replays</h1>
          </div>
          <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Global CDN distribution & Archive</p>
        </div>

        <button 
          onClick={loadReplays}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all font-mono text-[10px] uppercase tracking-widest disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Sync Storage
        </button>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-sm font-medium text-red-500/80">{error}</p>
        </div>
      )}

      {loading && replays.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-video bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : replays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-20">
          <Cloud size={48} className="mb-4" />
          <p className="text-sm font-mono uppercase tracking-widest">No cloud replays found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {replays.map((replay) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={replay.id}
              className="group bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 transition-all flex flex-col"
            >
              {/* Thumbnail Area */}
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <img 
                  src={replay.thumbnail} 
                  alt={replay.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                    <Play size={20} className="text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg font-mono text-[9px] font-bold text-white/80">
                  {Math.floor(replay.duration / 60)}:{(replay.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-black italic tracking-tighter uppercase mb-3 line-clamp-1">
                  {replay.title}
                </h3>

                <video 
                  className="hidden w-full h-full"
                  controls
                  src={replay.recording_url}
                />

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                      <img src={replay.streamer_avatar} alt={replay.streamer_name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black italic text-indigo-400 uppercase">@{replay.streamer_name}</span>
                  </div>

                  <div className="flex items-center gap-3 text-white/30 font-mono text-[9px] uppercase tracking-tighter">
                    <div className="flex items-center gap-1">
                      <Eye size={10} />
                      {replay.viewers.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(replay.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
