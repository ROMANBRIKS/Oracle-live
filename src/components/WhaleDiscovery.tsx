import React, { useEffect, useState } from "react";
import axios from "axios";
import { Crown, Zap, MapPin, Smartphone, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";

const WhaleDiscovery = () => {
  const [whales, setWhales] = useState<any[]>([]);

  useEffect(() => {
    // Fetch top potential spenders/high-value accounts
    axios.get("/api/rec/feed").then(res => {
      // The feed now prioritizes whale scores
      setWhales(res.data.filter((s:any) => s.whale_score > 50));
    });
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-500/10 rounded-2xl">
          <Crown className="text-yellow-500 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Whale Watch</h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">High-Value Corridors Analysis</p>
        </div>
      </div>

      <div className="grid gap-4">
        {whales.map((whale, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={whale.id}
            className="liquid-glass p-5 rounded-[2rem] flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black text-white/20 text-xl border border-white/5">
                {whale.username[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-lg flex items-center gap-2">
                  {whale.username}
                  {whale.whale_score > 100 && <Zap size={14} className="text-yellow-500 fill-yellow-500" />}
                </h3>
                <div className="flex gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase text-white/40">
                    <MapPin size={10} /> {whale.location_iso || 'Global'}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase text-white/40">
                    <Smartphone size={10} /> {whale.device_info?.split(' ')[0] || 'Web'}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Whale Score</p>
              <p className="text-2xl font-black text-yellow-500 tracking-tighter">{whale.whale_score}</p>
            </div>
          </motion.div>
        ))}

        {whales.length === 0 && (
          <div className="text-center py-12 opacity-50 italic font-bold">
            Searching corridors for High-ARPU targets...
          </div>
        )}
      </div>

      <div className="mt-8 liquid-glass p-6 rounded-[2.5rem] bg-indigo-500/10 border-indigo-500/20">
        <h4 className="font-black italic flex items-center gap-2 mb-2">
          <TrendingUp className="text-indigo-400" size={18} />
          Organic SEO Growth
        </h4>
        <p className="text-[11px] text-white/60 leading-relaxed font-bold">
          Our algorithm is currently pushing meta-tags to Google Search targeting 
          <span className="text-white"> Saudi Arabia</span>, <span className="text-white">UAE</span>, and <span className="text-white">USA</span>. 
          WhenWhale streamers go live, they trigger instant SEO cache updates to pull organic "Whales" from social networks.
        </p>
      </div>
    </div>
  );
};

export default WhaleDiscovery;
