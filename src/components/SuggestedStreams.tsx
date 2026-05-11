import React, { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAIRecommendations, StreamItem } from "../services/aiService";
import axios from "axios";

const SuggestedStreams: React.FC<{ onStreamClick: (id: string) => void }> = ({ onStreamClick }) => {
  const [suggested, setSuggested] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const userRes = localStorage.getItem("user");
        const user = userRes ? JSON.parse(userRes) : null;
        
        // 1. Get raw feed
        const { data: streams } = await axios.get("/api/rec/feed");
        
        // 2. Get AI ranking
        // Currently we don't have stored interests but we can mock or use category activity
        const interests = ["music", "gaming", "whale-watching"];
        const ranked = await getAIRecommendations(interests, streams);
        
        setSuggested(ranked);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAI();
  }, []);

  if (loading) return null;

  return (
    <div className="px-6 py-8">
      <div className="flex items-center gap-2 mb-6 text-cyan-400">
        <Sparkles size={16} className="animate-pulse" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">AI Oracle Picks</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        <AnimatePresence>
          {suggested.map((stream, i) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onStreamClick(stream.id)}
              className="min-w-[280px] p-4 liquid-glass rounded-[2rem] border-white/10 group cursor-pointer hover:border-cyan-400/50 transition-all flex flex-col gap-3"
            >
              <div className="aspect-video rounded-[1.5rem] overflow-hidden relative">
                <img 
                  src={`https://picsum.photos/seed/${stream.id}/400/225`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 bg-cyan-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  {stream.category}
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white italic uppercase tracking-tighter truncate">
                  {stream.title}
                </h4>
                <p className="text-[10px] text-cyan-400/80 font-medium italic line-clamp-2 leading-relaxed">
                  "{stream.ai_reason}"
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">@{stream.user}</span>
                <ArrowRight size={14} className="text-white/20 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuggestedStreams;
