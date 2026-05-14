import React, { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import { Heart, Award, ShieldCheck, Flame, Users, Calendar, Video, ArrowLeft, Star, MessageSquare } from "lucide-react";

interface TangoProfileProps {
  onBack?: () => void;
}

export default function TangoProfile({ onBack }: TangoProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "clips" | "stats">("about");

  const [creator] = useState({
    name: "Aura Queen",
    username: "aura_queen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    level: 55,
    likes: "2.5M",
    followers: "142.8K",
    following: "284",
    bio: "Live performance artist & cyber-harpist. Sending virtual vibes from London. Join my daily morning meditations & live acoustic sessions! 💫🌸",
    region: "United Kingdom",
    badge: "Official partner",
  });

  return (
    <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#ff0050]/15 via-transparent to-transparent pointer-events-none" />

      {/* Hero Cover */}
      <div className="h-44 md:h-60 w-full relative overflow-hidden">
        <img src={creator.cover} alt="Cover" className="w-full h-full object-cover opacity-40 filter blur-sm scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-black/80 transition-all z-20"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {/* Profile Details Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <GlassCard className="p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              {/* Avatar with Glow & Level Badge */}
              <div className="relative">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-[#ff0050] to-[#00f2ea] shadow-[0_0_20px_rgba(255,0,80,0.3)]">
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ff0050] to-[#ff4e00] px-3 py-0.5 rounded-full border border-white/25 text-[10px] font-black tracking-widest flex items-center gap-1 shadow-md">
                  <Flame size={10} className="fill-white" />
                  LV.{creator.level}
                </div>
              </div>

              {/* Name Details */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">{creator.name}</h1>
                  <ShieldCheck size={18} className="text-[#00f2ea]" />
                </div>
                <span className="text-xs font-mono text-[#00f2ea] uppercase tracking-wider">@{creator.username}</span>
                
                {/* Custom Badges */}
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-400">
                    {creator.badge}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">{creator.region}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full md:w-auto justify-center">
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex-1 md:flex-none px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${
                  isFollowing 
                    ? "bg-white/5 border border-white/10 hover:bg-white/10" 
                    : "bg-gradient-to-r from-[#ff0050] to-[#ff4e00] text-white hover:shadow-[0_0_20px_rgba(255,0,80,0.4)] hover:brightness-110"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
              
              <button className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center">
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/5 mt-8 pt-6 text-center">
            <div>
              <div className="text-lg md:text-xl font-black tracking-tight text-white/90">{creator.followers}</div>
              <div className="text-[9px] text-[#999] uppercase tracking-widest font-mono mt-0.5">Followers</div>
            </div>
            <div className="border-x border-white/5">
              <div className="text-lg md:text-xl font-black tracking-tight text-[#ff0050] flex items-center justify-center gap-1">
                <Heart size={14} className="fill-[#ff0050]" />
                {creator.likes}
              </div>
              <div className="text-[9px] text-[#999] uppercase tracking-widest font-mono mt-0.5">Likes</div>
            </div>
            <div>
              <div className="text-lg md:text-xl font-black tracking-tight text-white/90">{creator.following}</div>
              <div className="text-[9px] text-[#999] uppercase tracking-widest font-mono mt-0.5">Following</div>
            </div>
          </div>
        </GlassCard>

        {/* Dynamic Section Navigation Tabs */}
        <div className="flex border-b border-white/5 gap-6 mb-6">
          <button 
            onClick={() => setActiveTab("about")}
            className={`pb-3 font-black text-xs uppercase tracking-widest transition-all ${activeTab === "about" ? "border-b-2 border-[#ff0050] text-white" : "text-white/40 hover:text-white"}`}
          >
            Stream Bio
          </button>
          <button 
            onClick={() => setActiveTab("clips")}
            className={`pb-3 font-black text-xs uppercase tracking-widest transition-all ${activeTab === "clips" ? "border-b-2 border-[#ff0050] text-white" : "text-white/40 hover:text-white"}`}
          >
            Moments / Clips
          </button>
          <button 
            onClick={() => setActiveTab("stats")}
            className={`pb-3 font-black text-xs uppercase tracking-widest transition-all ${activeTab === "stats" ? "border-b-2 border-[#ff0050] text-white" : "text-white/40 hover:text-white"}`}
          >
            Ranking
          </button>
        </div>

        {/* Tab Content rendering */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#00f2ea] mb-3">About Streamer</h3>
              <p className="text-sm leading-relaxed text-white/70 font-sans">{creator.bio}</p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-4">Milestones</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Award size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase">Top Acoustic Streamer 2026</h4>
                    <p className="text-[10px] text-white/40">Ranked #3 on weekly global acoustics</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-[#00f2ea]">
                    <Star size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase">Diamond Guild Medal</h4>
                    <p className="text-[10px] text-white/40">Awarded for receiving over 1M Gift points</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === "clips" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((clip) => (
              <div key={clip} className="group aspect-[9/16] rounded-3xl overflow-hidden relative bg-zinc-900 border border-white/5 hover:border-[#ff0050]/40 transition-all cursor-pointer">
                <img 
                  src={`https://picsum.photos/seed/${clip + 10}/360/640`} 
                  alt="Clip thumbnail" 
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[9px] font-mono font-black italic uppercase text-white/50 block">Moment {clip}</span>
                  <p className="text-xs font-black uppercase tracking-tight line-clamp-1">Stream Jam Highlight</p>
                </div>
                <div className="absolute top-3 right-3 px-1.5 py-0.5 bg-black/60 rounded-md font-mono text-[8px] flex items-center gap-1">
                  <Heart size={8} className="fill-[#ff0050] text-[#ff0050]" />
                  12.5K
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "stats" && (
          <GlassCard className="p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#ff0050] mb-4">Gifting Leaderboard</h3>
            <div className="space-y-4">
              {[
                { rank: 1, name: "CryptoWhale", points: "450K coins", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" },
                { rank: 2, name: "Satoshi_Vibes", points: "280K coins", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80" },
                { rank: 3, name: "HypeLord", points: "150K coins", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
              ].map((fan) => (
                <div key={fan.rank} className="flex items-center justify-between py-2 border-b border-white/5 last:border-none">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black italic text-white/30 font-mono w-4">{fan.rank}</span>
                    <img src={fan.avatar} alt={fan.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <span className="text-xs font-black uppercase">{fan.name}</span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">{fan.points}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
