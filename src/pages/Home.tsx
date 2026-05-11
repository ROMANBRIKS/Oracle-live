import React, { useState, useEffect } from "react";
import { Search, Flame, TrendingUp, Sparkles, Plus } from "lucide-react";
import { motion } from "motion/react";
import LiveCard from "../components/LiveCard";
import axios from "axios";
import AlgorithmBait from "../components/AlgorithmBait";
import SuggestedStreams from "../components/SuggestedStreams";

interface Video {
  id: string;
  user: string;
  url: string;
  viewers?: number;
}

interface HomeProps {
  onStreamClick?: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ onStreamClick }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Discovery");

  useEffect(() => {
    const fetchData = () => {
      axios.get("/api/rec/feed")
        .then(res => {
          if (Array.isArray(res.data)) {
            setVideos(res.data);
            setLoading(false);
          } else {
            // Handle case where server returns warmup HTML instead of JSON
            if (typeof res.data === "string" && res.data.includes("<!doctype html>")) {
              console.warn("Server warming up... retrying in 3s");
              setTimeout(fetchData, 3000);
              return;
            }
            console.error("Feed API data is not an array:", res.data);
            setVideos([]);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Feed fetch error:", err);
          setLoading(false);
        });
    };

    fetchData();
  }, []);

  const tabs = ["Discovery", "Nearby", "Trending", "Global"];

  return (
    <div className="min-h-screen pb-32">
      <AlgorithmBait />
      
      {/* AI Recommendations */}
      <SuggestedStreams onStreamClick={(id) => onStreamClick?.(id)} />

      {/* Search & Tabs Header */}
      <div className="px-6 pt-6 pb-4 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative flex items-center group">
            <Search className="absolute left-5 text-white/40 group-focus-within:text-white transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search streams..."
              className="w-full bg-white/5 border border-white/5 rounded-[1.8rem] py-4 pl-12 pr-4 text-sm font-bold tracking-tight focus:outline-none focus:border-white/20 transition-all uppercase italic"
            />
          </div>
          <button className="w-14 h-14 liquid-glass flex items-center justify-center rounded-[1.8rem] hover:bg-white hover:text-black transition-all">
            <Plus size={20} />
          </button>
        </div>

        {/* Tab Scroller */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap
                ${activeTab === tab 
                  ? 'bg-white text-black shadow-2xl' 
                  : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Headline */}
      <section className="px-6 mb-8 mt-4">
        <div className="flex items-end justify-between mb-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
                    <Sparkles size={12} /> Featured Content
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Crystal Feed</h2>
            </div>
            <div className="flex items-center gap-2 text-white/30 font-bold uppercase text-[10px] tracking-widest">
               <Flame size={14} className="text-orange-500" /> Live Now
            </div>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-white/5 rounded-[2rem] animate-pulse border border-white/5" />
            ))
          ) : (
            videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onStreamClick?.(video.id)}
              >
                <LiveCard 
                  id={video.id}
                  user={video.user}
                  thumbnail={`https://picsum.photos/seed/${video.id}/400/711`}
                  viewerCount={video.viewers || Math.floor(Math.random() * 5000)}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Recommended Section with Visible Grid */}
      <section className="px-6 py-12 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="text-cyan-400" />
          <h3 className="text-xl font-black uppercase italic tracking-tighter">Rising Stars</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {videos.slice(0, 6).map((video, i) => (
                <motion.div 
                    key={`rising-${i}`}
                    className="crystal-glass aspect-square rounded-2xl overflow-hidden relative group"
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                >
                    <img 
                      src={`https://i.pravatar.cc/300?u=${video.user}`} 
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" 
                      alt="" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex flex-col">
                        <span className="text-[10px] font-black italic uppercase tracking-tight">@{video.user}</span>
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-cyan-400/80">Hot</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </section>

      {/* Global SEO Hubs (Pyramid Entry Points) */}
      <section className="px-6 py-16 border-t border-white/5">
        <div className="flex flex-col items-center text-center mb-10 space-y-2">
            <Globe className="text-cyan-400 animate-pulse" size={24} />
            <h3 className="text-xs font-black uppercase tracking-[0.4em] italic text-white/40">Global Elite Network</h3>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Major Streaming Hubs</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {["USA", "Europe", "Middle East", "Asia", "Africa"].map(regSlug => (
                <Link 
                  key={regSlug}
                  to={`/live/${regSlug.toLowerCase().replace(" ", "-")}`}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                    {regSlug}
                </Link>
            ))}
        </div>
        
        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-5xl mx-auto opacity-50">
            {["New York", "London", "Dubai", "Lagos", "Tokyo", "Berlin", "Paris", "Sydney", "Toronto"].map(city => (
                <Link 
                  key={city}
                  to={`/live/${["New York"].includes(city) ? "usa" : city === "Lagos" ? "africa" : city === "Tokyo" ? "asia" : city === "Toronto" ? "canada" : city === "Sydney" ? "oceania" : city === "Dubai" ? "middle-east" : "europe"}/${city.toLowerCase().replace(" ", "-")}`}
                  className="px-4 py-2 text-[8px] font-bold uppercase tracking-[0.2em] hover:text-cyan-400 transition-colors"
                >
                    {city}
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
