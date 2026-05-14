import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, TrendingUp, Users, DollarSign, Gift, Calendar, ChevronRight, PieChart, Landmark, Film } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

interface AnalyticsData {
  id: string;
  total_viewers: number;
  likes: number;
  total_gifts: number;
  total_coins: number;
  new_followers: number;
  created_at: string;
}

function CreatorDashboard() {
  const [stats, setStats] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const streamerId = user?.id || "";

  useEffect(() => {
    if (!streamerId) return;

    axios.get(`/api/analytics/streamer/${streamerId}`)
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics fetch error:", err);
        setLoading(false);
      });
  }, [streamerId]);

  const totals = stats.reduce(
    (acc, curr) => ({
      views: acc.views + (curr.total_viewers || 0),
      earnings: acc.earnings + (curr.total_coins || 0),
      followers: acc.followers + (curr.new_followers || 0),
      gifts: acc.gifts + (curr.total_gifts || 0)
    }),
    { views: 0, earnings: 0, followers: 0, gifts: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-crystal-void">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crystal-void text-white p-6 pb-32 font-sans relative overflow-x-hidden">
      {/* Background Decorative Blur */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto relative z-10"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="w-20 h-20 crystal-button shadow-cyan-400/20 shrink-0">
            <BarChart3 className="text-cyan-400 w-10 h-10" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-[0.9]">Creator <br /> <span className="text-cyan-400">Command</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-2 italic">Neural Analytics & Growth Engine</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/creator/analytics")}
              className="w-14 h-14 crystal-button group"
              title="Full Analytics"
            >
              <PieChart size={20} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
            </button>
            <button 
              onClick={() => navigate("/creator/revenue")}
              className="w-14 h-14 crystal-button group"
              title="Revenue Center"
            >
              <Landmark size={20} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
            </button>
            <button 
              onClick={() => navigate("/creator/clips")}
              className="w-14 h-14 crystal-button group"
              title="Clips Archive"
            >
              <Film size={20} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Summary bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Total Reach", value: totals.views.toLocaleString(), icon: Users, color: "text-white" },
            { label: "Reserve Pool", value: `$${totals.earnings}`, icon: DollarSign, color: "text-cyan-400" },
            { label: "Neural Growth", value: `+${totals.followers}`, icon: TrendingUp, color: "text-white" },
            { label: "Tributes", value: totals.gifts, icon: Gift, color: "text-cyan-400" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="crystal-glass p-8 rounded-[3rem] relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">{card.label}</p>
                    <card.icon className={`w-4 h-4 text-white/10 group-hover:${card.color} transition-colors`} />
                </div>
                <h3 className={`text-3xl font-black italic tracking-tighter ${card.color}`}>{card.value}</h3>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <card.icon size={80} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transmission log history */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4 px-4">
            <div className="flex flex-col">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 italic flex items-center gap-3">
                <Calendar size={14} className="text-cyan-400" />
                Transmission History
                </h2>
                <div className="h-0.5 w-8 bg-cyan-400/30 mt-2" />
            </div>
            <button className="text-[9px] font-black uppercase tracking-widest text-cyan-400/50 hover:text-cyan-400 transition-all italic">Protocol Archive</button>
          </div>

          <div className="space-y-4">
            {stats.length === 0 ? (
              <div className="crystal-glass rounded-[3rem] p-16 text-center border border-dashed border-white/10">
                <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px] italic">No active data transmissions recorded.</p>
              </div>
            ) : (
              stats.map((stream, idx) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="crystal-glass p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/5 transition-all duration-300"
                >
                  <div className="flex flex-wrap gap-12">
                    <div className="space-y-2">
                      <p className="text-white/20 text-[9px] uppercase font-black tracking-[0.2em] italic">Reach</p>
                      <p className="text-xl font-black italic tracking-tighter flex items-center gap-3 text-white">
                        <Users className="w-5 h-5 text-cyan-400" /> {stream.total_viewers}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/20 text-[9px] uppercase font-black tracking-[0.2em] italic">Net Value</p>
                      <p className="text-xl font-black italic tracking-tighter flex items-center gap-3 text-cyan-400">
                        <DollarSign className="w-5 h-5" /> {stream.total_coins}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/20 text-[9px] uppercase font-black tracking-[0.2em] italic">Ascension</p>
                      <p className="text-xl font-black italic tracking-tighter flex items-center gap-3 text-white">
                        <TrendingUp className="w-5 h-5 text-cyan-400" /> +{stream.new_followers}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic mb-1">timestamp</p>
                        <p className="text-sm font-black italic tracking-tighter text-white/60">
                            {new Date(stream.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="w-12 h-12 crystal-button group-hover:bg-cyan-400 group-hover:text-black transition-all">
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CreatorDashboard;
