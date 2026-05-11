import React, { useEffect, useState } from "react";
import { Sparkles, Play } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";

function Recommendations() {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = { username: localStorage.getItem("user") };
  }
  const userId = user?.username || "guest";

  useEffect(() => {
    if (userId === "guest") return;
    
    axios.get(`/api/rec/suggest/${userId}`)
      .then((res) => {
        setStreams(res.data);
        setLoading(false);
      })
      .catch((err) => console.error("Recs error:", err));
  }, [userId]);

  if (loading || streams.length === 0) return null;

  return (
    <div className="px-6 py-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-pink-500/20 rounded-lg">
          <Sparkles size={16} className="text-pink-500" />
        </div>
        <h3 className="text-sm font-black italic uppercase tracking-widest text-white/90">For You</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {streams.map((stream, i) => (
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-48 group cursor-pointer"
          >
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 group-hover:border-pink-500/50 transition-all shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Fake thumbnail content */}
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/50">
                 <Play size={24} className="text-white/20 group-hover:text-pink-500 group-hover:scale-125 transition-all" />
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs font-bold text-white truncate drop-shadow-md">{stream.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-[9px] font-medium text-white/60 uppercase tracking-tighter">@{stream.user}</p>
                </div>
              </div>

              <div className="absolute top-2 right-2 bg-pink-500/90 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase text-white shadow-lg">
                {stream.category}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
