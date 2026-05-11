import React, { useEffect, useState } from "react";
import { Shield, Ban, MessageSquareOff, AlertOctagon, User, Search, CheckCircle, Clock, Crown, Users, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import WhaleDiscovery from "../components/WhaleDiscovery";
import AdminMissionControl from "./AdminMissionControl";
import AdminWithdrawals from "./AdminWithdrawals";
import AdminKYC from "./AdminKYC";
import Treasury from "./Treasury";

interface Report {
  id: number;
  reporter_id: string;
  reporter_name: string;
  target_user_id: string;
  target_name: string;
  reason: string;
  status: string;
  created_at: string;
}

const Admin: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'whales' | 'mission' | 'withdrawals' | 'kyc' | 'treasury'>('mission');
  const [userStats, setUserStats] = useState({ total_users: 0, live_now: 0, elite_whales: 0 });

  const loadReports = async () => {
    try {
      const res = await axios.get("/api/admin/reports");
      setReports(res.data);
      // Mock stats for demo
      setUserStats({
        total_users: 12400,
        live_now: 156,
        elite_whales: 42
      });
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleBan = async () => {
    if (!targetUserId) return;
    try {
      await axios.post("/api/admin/ban", {
        targetUserId,
        reason: banReason,
        adminId: "admin_id" // In a real app, this would come from auth
      });
      setMessage({ type: "success", text: `User ${targetUserId} has been banned.` });
      setTargetUserId("");
      setBanReason("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to ban user" });
    }
  };

  const handleMute = async () => {
    if (!targetUserId) return;
    try {
      await axios.post("/api/admin/mute", { targetUserId });
      setMessage({ type: "success", text: `User ${targetUserId} has been muted.` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to mute user" });
    }
  };

  return (
    <div className="flex-1 p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Header */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            <Shield className="text-white" size={32} />
            Command Center
          </h1>
          <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none pt-0.5">Systems Nominal</span>
          </div>
        </div>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
           Platform Intelligence • Whale Analytics • Security
        </p>
      </section>

      {/* Global Intel Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: userStats.total_users, color: "text-blue-400" },
          { label: "Live Streams", value: userStats.live_now, color: "text-green-400" },
          { label: "Elite Whales", value: userStats.elite_whales, color: "text-yellow-500" },
          { label: "Reports", value: reports.length, color: "text-red-400" },
        ].map(stat => (
          <div key={stat.label} className="liquid-glass p-5 rounded-[2rem]">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className={`text-xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 p-1.5 liquid-glass rounded-[1.8rem]">
        {(['mission', 'withdrawals', 'kyc', 'treasury', 'reports', 'whales', 'users'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/60'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'mission' && (
          <motion.div
            key="mission-tab"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="-mx-6"
          >
            <AdminMissionControl />
          </motion.div>
        )}

        {activeTab === 'withdrawals' && (
          <motion.div
            key="withdrawals-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <AdminWithdrawals />
          </motion.div>
        )}

        {activeTab === 'kyc' && (
          <motion.div
            key="kyc-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <AdminKYC />
          </motion.div>
        )}

        {activeTab === 'treasury' && (
          <motion.div
            key="treasury-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <Treasury />
          </motion.div>
        )}

        {activeTab === 'whales' && (
          <motion.div
            key="whales-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <WhaleDiscovery />
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            key="reports-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Action Console */}
            <motion.div 
              className="liquid-glass p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Ban size={120} />
              </div>

              <div className="space-y-4 relative z-10">
                <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tight">
                  <Search className="text-white/40" size={20} /> Identity Enforcement
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Target User ID</label>
                    <input
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      placeholder="USER_ID_HEX..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold tracking-tight focus:outline-none focus:border-white/30 transition-colors uppercase italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Violation Reason</label>
                    <input
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="REASON FOR ACTION..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold tracking-tight focus:outline-none focus:border-white/30 transition-colors uppercase italic"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleBan}
                    className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-3xl font-black uppercase italic tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Ban size={18} /> BAN USER
                  </button>
                  <button 
                    onClick={handleMute}
                    className="flex-1 bg-white/10 text-white border border-white/10 py-4 rounded-3xl font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquareOff size={18} /> SILENCE
                  </button>
                </div>
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl text-xs font-black uppercase italic tracking-widest text-center ${
                    message.type === 'success' ? 'bg-white/10 text-white border border-white/20' : 'bg-red-400/10 text-red-400 border border-red-400/30'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </motion.div>

            {/* Reports List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-12 flex justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                ) : reports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="liquid-glass p-6 rounded-[2rem] group relative hover:border-red-500/30 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <User size={20} className="text-white/50" />
                                </div>
                                <div>
                                    <h4 className="font-black italic uppercase tracking-tight">@{report.target_name}</h4>
                                    <span className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">S_ID: {report.target_user_id}</span>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                                report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-white'
                            }`}>
                                {report.status}
                            </div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5 mb-4">
                            <p className="text-xs font-bold text-white/60 leading-relaxed italic">
                                "{report.reason}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-4 text-white/30 font-black uppercase tracking-widest">
                                <span className="flex items-center gap-1"><User size={12} /> Reporter: {report.reporter_name}</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(report.created_at).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:text-white transition-colors"><CheckCircle size={18} /></button>
                                <button className="p-2 hover:text-red-500 transition-colors"><Ban size={18} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {!loading && reports.length === 0 && (
                     <div className="py-20 text-center liquid-glass rounded-[3rem] border-dashed">
                        <p className="text-white/20 text-[10px] font-black uppercase italic tracking-widest">Atmosphere clear. No active reports.</p>
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
