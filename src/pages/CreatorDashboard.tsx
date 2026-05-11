import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, TrendingUp, Users, DollarSign, Gift, Calendar, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsData {
  id: number;
  viewers: number;
  likes: number;
  gifts: number;
  earnings: number;
  followers_gained: number;
  created_at: string;
}

function CreatorDashboard() {
  const [stats, setStats] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const streamerId = user?.id || "";

  useEffect(() => {
    if (!streamerId) return;

    axios.get(`/api/analytics/${streamerId}`)
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
      views: acc.views + curr.viewers,
      earnings: acc.earnings + curr.earnings,
      followers: acc.followers + curr.followers_gained,
      gifts: acc.gifts + curr.gifts
    }),
    { views: 0, earnings: 0, followers: 0, gifts: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 font-sans ring-1 ring-zinc-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-pink-500/10 rounded-2xl">
            <BarChart3 className="text-pink-500 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Creator Dashboard</h1>
            <p className="text-zinc-500 text-sm">Monitor your channel's growth and performance</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Views", value: totals.views, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Earnings", value: `$${totals.earnings}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Followers", value: `+${totals.followers}`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Gifts Recv", value: totals.gifts, icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl"
            >
              <div className={`p-2 w-fit rounded-xl ${card.bg} mb-3`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <h3 className="text-2xl font-bold">{card.value}</h3>
              <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider font-semibold">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Stream History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-zinc-400" />
              Stream History
            </h2>
            <button className="text-pink-500 text-xs font-bold hover:underline">View All</button>
          </div>

          {stats.length === 0 ? (
            <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-12 text-center">
              <p className="text-zinc-500 italic">No stream records found yet.</p>
            </div>
          ) : (
            stats.map((stream, idx) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all p-5 rounded-3xl flex items-center justify-between"
              >
                <div className="flex gap-6">
                  <div className="space-y-1">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Views</p>
                    <p className="font-bold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-zinc-400" /> {stream.viewers}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Earnings</p>
                    <p className="font-bold text-green-500 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" /> {stream.earnings}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Growth</p>
                    <p className="font-bold text-purple-500 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> +{stream.followers_gained}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 text-xs mb-1">
                    {new Date(stream.created_at).toLocaleDateString()}
                  </p>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-pink-500 transition-colors ml-auto" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default CreatorDashboard;
