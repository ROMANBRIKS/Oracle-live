import React, { useState, useEffect } from "react";
import { Search, Flame, TrendingUp, Sparkles, Plus, Globe } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
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
    <div className="min-h-screen bg-crystal-void pb-32">
      <AlgorithmBait />
      
      {/* AI Recommendations */}
      <SuggestedStreams onStreamClick={(id) => onStreamClick?.(id)} />

      {/* Search & Tabs Header */}
      <div className="px-6 pt-10 pb-4 space-y-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative flex items-center group">
            <div className="absolute inset-0 crystal-glass rounded-[2rem] opacity-50 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-6 text-cyan-400/50 group-focus-within:text-cyan-400 transition-colors z-10" size={20} />
            <input 
              type="text" 
              placeholder="Search the Oracle..."
              className="w-full bg-transparent relative z-10 py-5 pl-14 pr-6 text-sm font-black tracking-tight focus:outline-none transition-all uppercase italic placeholder:text-white/20 text-white"
            />
          </div>
          <button className="w-16 h-16 crystal-button flex items-center justify-center rounded-[1.8rem] text-white shadow-cyan-400/10">
            <Plus size={24} />
          </button>
        </div>

        {/* Tab Scroller */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all whitespace-nowrap relative overflow-hidden
                ${activeTab === tab 
                  ? 'bg-cyan-400 text-black shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-105' 
                  : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {tab}
              {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/20 mix-blend-overlay"
                  />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Headline */}
      <section className="px-6 mb-12 mt-8 relative z-10">
        <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] italic drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                    <Sparkles size={14} /> Global Priority
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Crystal <span className="text-cyan-400">Stream</span></h2>
            </div>
            <div className="flex items-center gap-3 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
               <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 italic">Live Pulse</span>
            </div>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[9/16] crystal-glass rounded-[3rem] animate-pulse" />
            ))
          ) : (
            videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
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
      <section className="px-6 py-16 border-t border-white/5 liquid-glass rounded-t-[4rem] relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
                <TrendingUp className="text-cyan-400" size={24} />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Rising Stars</h3>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-cyan-400/60 hover:text-cyan-400 transition-colors">See Leaderboard</button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {videos.slice(0, 6).map((video, i) => (
                <motion.div 
                    key={`rising-${i}`}
                    className="crystal-glass aspect-square rounded-[2rem] overflow-hidden relative group"
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                >
                    <img 
                      src={`https://i.pravatar.cc/300?u=${video.user}`} 
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-opacity" 
                      alt="" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 flex flex-col">
                        <span className="text-sm font-black italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors truncate">@{video.user}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/70">Hot Prospect</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </section>

      {/* Global SEO Hubs (Pyramid Entry Points) */}
      <section className="px-6 py-24 bg-black/40 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-cyan-400/50 mb-4" />
            <Globe className="text-cyan-400 animate-spin-slow" size={32} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] italic text-white/30">Global Sovereignty</h3>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Elite <span className="text-cyan-400">Hubs</span></h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {["USA", "Europe", "Middle East", "Asia", "Africa", "Latin America"].map(regSlug => (
                <Link 
                  key={regSlug}
                  to={`/live/${regSlug.toLowerCase().replace(" ", "-")}`}
                  className="px-8 py-4 crystal-glass border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-cyan-400 hover:text-black transition-all hover:scale-110 active:scale-95"
                >
                    {regSlug}
                </Link>
            ))}
        </div>
        
        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-5xl mx-auto opacity-30">
            {["New York", "London", "Dubai", "Lagos", "Tokyo", "Berlin", "Paris", "Sydney", "Toronto", "Riyadh", "Mumbai"].map(city => (
                <Link 
                  key={city}
                  to={`/live/${["New York"].includes(city) ? "usa" : city === "Lagos" ? "africa" : city === "Tokyo" ? "asia" : city === "Toronto" ? "canada" : city === "Sydney" ? "oceania" : city === "Dubai" ? "middle-east" : "europe"}/${city.toLowerCase().replace(" ", "-")}`}
                  className="text-[9px] font-black uppercase tracking-[0.3em] hover:text-cyan-400 transition-colors whitespace-nowrap"
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
