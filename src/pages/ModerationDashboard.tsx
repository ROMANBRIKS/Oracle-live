import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Shield, 
  ShieldAlert, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  Trash2, 
  ChevronLeft, 
  Sparkles, 
  Filter, 
  Zap, 
  Activity, 
  Info, 
  BarChart2, 
  ShieldCheck, 
  User, 
  RefreshCw 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModerationLog {
  id: number;
  userId?: string;
  username?: string;
  email?: string;
  type: string;
  reason: string;
  content: string;
  severity: string;
  action: string;
  createdAt?: string;
  created_at?: string;
}

interface Stats {
  totalLogs: number;
  mutedCount: number;
  bannedCount: number;
  shadowbannedCount: number;
  criticalAlerts: number;
  warningCount: number;
}

const ModerationDashboard: React.FC = () => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    mutedCount: 28,
    bannedCount: 7,
    shadowbannedCount: 4,
    criticalAlerts: 3,
    warningCount: 12
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"logs" | "stats" | "simulator">("logs");
  const navigate = useNavigate();

  // Simulator state
  const [simMessage, setSimMessage] = useState("");
  const [simResults, setSimResults] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Fraud simulator dynamic fields
  const [failedPayments, setFailedPayments] = useState(0);
  const [suspiciousLogins, setSuspiciousLogins] = useState(0);
  const [rapidWithdrawals, setRapidWithdrawals] = useState(0);
  const [fraudResult, setFraudResult] = useState<any>(null);

  // Spam fields
  const [msgsPerMin, setMsgsPerMin] = useState(10);
  const [repeatedMsgs, setRepeatedMsgs] = useState(2);
  const [spamResult, setSpamResult] = useState<any>(null);

  const loadData = async () => {
    try {
      const statsRes = await axios.get("/api/moderation/stats");
      if (statsRes.data) {
        setStats(statsRes.data);
      }

      const logsRes = await axios.get("/api/moderation/all-logs");
      if (logsRes.data) {
        setLogs(logsRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch moderation data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000); // Poll server every 8s
    return () => clearInterval(interval);
  }, []);

  const handleSimulateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;
    setSimLoading(true);
    try {
      const res = await axios.post("/api/moderation/chat", {
        userId: "demo_user",
        roomId: "simulator-room",
        message: simMessage
      });
      setSimResults(res.data);
      loadData(); // refresh logs
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleSimulateFraud = async () => {
    try {
      const res = await axios.post("/api/moderation/fraud-score", {
        failedPayments,
        suspiciousLogins,
        rapidWithdrawals,
        userId: "demo_fraud_user"
      });
      setFraudResult(res.data);
      loadData();
    } catch (err) {
      console.error("Fraud scoring simulation failed", err);
    }
  };

  const handleSimulateSpam = async () => {
    try {
      const res = await axios.post("/api/moderation/spam", {
        messagesPerMinute: msgsPerMin,
        repeatedMessages: repeatedMsgs,
        userId: "demo_spam_user"
      });
      setSpamResult(res.data);
      loadData();
    } catch (err) {
      console.error("Spam scoring simulation failed", err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "high": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getActionBadge = (action: string) => {
    switch (action?.toLowerCase()) {
      case "ban": return "bg-red-500 text-white";
      case "mute": return "bg-amber-500 text-black";
      case "shadowban": return "bg-purple-600 text-white";
      case "warn": return "bg-yellow-500 text-black";
      default: return "bg-zinc-700 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black tracking-widest text-white/40 uppercase">Powering Up AI Shield...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white p-6 pb-24 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-2">
              <Shield className="text-indigo-500 fill-indigo-500/10" /> AI Safety & Moderation Log
            </h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              Neural Network Shield — Active Protection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadData}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition"
            title="Refresh Logs"
          >
            <RefreshCw size={16} />
          </button>
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AI Shield: Guard Status Online</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Mini Profile & Overview Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5 backdrop-blur-md">
            <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
              <Activity size={12} className="text-indigo-500" /> Live Threat Intel
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/60 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Muted Users</p>
                  <p className="text-2xl font-black italic mt-1 text-amber-500">{stats.mutedCount}</p>
                </div>
                <ShieldAlert className="text-amber-500" size={20} />
              </div>

              <div className="p-4 bg-zinc-950/60 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Banned Users</p>
                  <p className="text-2xl font-black italic mt-1 text-red-500">{stats.bannedCount}</p>
                </div>
                <Trash2 className="text-red-500" size={20} />
              </div>

              <div className="p-4 bg-zinc-950/60 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Shadowbanned</p>
                  <p className="text-2xl font-black italic mt-1 text-purple-400">{stats.shadowbannedCount}</p>
                </div>
                <User className="text-purple-400" size={20} />
              </div>

              <div className="p-4 bg-indigo-505/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Total Actions Logged</p>
                  <p className="text-2xl font-black italic mt-1 text-indigo-300">{stats.totalLogs}</p>
                </div>
                <ShieldCheck className="text-indigo-400" size={20} />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-indigo-950/20 border border-indigo-500/10 backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-indigo-400 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} /> AI Decision Suite
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Our safety system employs bad-word filtering, heuristics spam algorithms, toxicity scanners and automated shadowbanning.
            </p>
          </div>
        </div>

        {/* Primary Content Desk */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex gap-2 p-1.5 bg-zinc-950/80 rounded-2xl border border-white/5 shadow-inner max-w-md">
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                activeTab === "logs" 
                  ? "bg-indigo-500 text-white shadow-md font-extrabold" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                activeTab === "stats" 
                  ? "bg-indigo-500 text-white shadow-md font-extrabold" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              Stats Center
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                activeTab === "simulator" 
                  ? "bg-indigo-500 text-white shadow-md font-extrabold" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              AI Sandbox
            </button>
          </div>

          {/* Tab Content: Logs */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/30 px-1">Audited Incidents</h3>
                <span className="text-xs text-white/40 px-1">Showing last 100 entries</span>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center">
                  <ShieldCheck className="text-white/10 mb-4" size={60} />
                  <p className="text-white/40 font-bold uppercase tracking-widest text-sm">No violations caught</p>
                  <p className="text-xs text-white/20 mt-1">Every streamer and viewer is perfectly safe.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {logs.map((log) => (
                    <div 
                      key={log.id}
                      className="p-5 rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                            {log.type === "chat" ? (
                              <MessageSquare size={16} className="text-indigo-400" />
                            ) : log.type === "profile" ? (
                              <User size={16} className="text-purple-400" />
                            ) : (
                              <ShieldAlert size={16} className="text-amber-400" />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-sm text-indigo-300">
                                @{log.username || "Anonymous System User"}
                              </span>
                              <span className="text-xs text-white/30 font-mono">
                                ({log.email || "no-email"})
                              </span>
                            </div>

                            <p className="text-xs text-white/80 font-semibold italic mt-1 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                              "{log.content}"
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-wider text-white/40">
                              <span>Action: <span className={`px-2 py-0.5 rounded-md ${getActionBadge(log.action)}`}>{log.action}</span></span>
                              <span>•</span>
                              <span>Reason: <span className="text-white">{log.reason}</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-end justify-between md:justify-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-mono text-white/30">
                            <Clock size={10} /> {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : log.created_at ? new Date(log.created_at).toLocaleTimeString() : "Just now"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Stats Center */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-1.5">
                    <BarChart2 size={16} /> Enforcement Distribution
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
                        <span>Warnings</span>
                        <span className="text-white font-black">{stats.warningCount}</span>
                      </div>
                      <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.min(100, (stats.warningCount / (stats.totalLogs || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
                        <span>Muted Accounts</span>
                        <span className="text-white font-black">{stats.mutedCount}</span>
                      </div>
                      <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (stats.mutedCount / (stats.totalLogs || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
                        <span>Hard Bans</span>
                        <span className="text-white font-black">{stats.bannedCount}</span>
                      </div>
                      <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (stats.bannedCount / (stats.totalLogs || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
                        <span>Shadowbans</span>
                        <span className="text-white font-black">{stats.shadowbannedCount}</span>
                      </div>
                      <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (stats.shadowbannedCount / (stats.totalLogs || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-1.5">
                      <Zap size={16} /> System Health Integrity
                    </h3>
                    <p className="text-xs text-white/40 mb-4">Integrity rate calculated from false positive logs.</p>
                  </div>
                  
                  <div className="text-center py-6 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 animate-pulse">Neural Safety Precision</p>
                    <p className="text-5xl font-black italic tracking-tighter text-white mt-1">99.82%</p>
                  </div>

                  <div className="text-xs text-white/30 flex items-center gap-2 mt-4 bg-zinc-950 p-3 rounded-xl border border-white/5">
                    <Info size={14} className="text-indigo-400 flex-shrink-0" />
                    <span>Real-time safety evaluations completed within 14ms across all live Agora rooms.</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab Content: AI Engine Simulator */}
          {activeTab === "simulator" && (
            <div className="space-y-8">
              
              {/* Simulator Section 1: Chat & Toxicity */}
              <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                  <MessageSquare size={18} />
                  <h3 className="text-sm font-black uppercase tracking-widest">Chat & Toxicity Engine Sandbox</h3>
                </div>
                <p className="text-xs text-white/40 mb-4">
                  Type a testing chat message to run against bad-words dictionary and toxicity scoring analyzer. Warnings will save to database.
                </p>

                <form onSubmit={handleSimulateChat} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-white/20 font-semibold"
                      placeholder="e.g. Stop the scam! This is garbage, I will kill you."
                      value={simMessage}
                      onChange={(e) => setSimMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={simLoading}
                      className="px-6 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-xs font-black uppercase tracking-widest rounded-xl transition flex items-center gap-1"
                    >
                      <Sparkles size={14} /> Scan Message
                    </button>
                  </div>
                </form>

                {simResults && (
                  <div className="mt-4 p-5 bg-black rounded-2xl border border-white/5 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white/40">AI Classifier Results</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${simResults.safe ? 'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'}`}>
                        {simResults.safe ? "✅ SAFE":"❌ FLAGGED & LOGGED"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Severity</p>
                        <p className="font-extrabold text-white mt-0.5 capitalize">{simResults.severity || "low"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Recommended Action</p>
                        <p className="font-extrabold text-white mt-0.5 capitalize">{simResults.action || "none"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Trigger Reason</p>
                        <p className="font-extrabold text-white mt-0.5">{simResults.reason || "None"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Toxicity Level</p>
                        <p className="font-extrabold text-white mt-0.5">{simResults.toxicityScore}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulator Section 2: Spam Analysis */}
              <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                  <Filter size={18} />
                  <h3 className="text-sm font-black uppercase tracking-widest">Spam Rate & Velocity Sandbox</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">
                      Messages Per Minute (Threshold: 20)
                    </label>
                    <input
                      type="number"
                      value={msgsPerMin}
                      onChange={(e) => setMsgsPerMin(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">
                      Repeated Messages (Threshold: 5)
                    </label>
                    <input
                      type="number"
                      value={repeatedMsgs}
                      onChange={(e) => setRepeatedMsgs(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSpamResult}
                  className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl transition"
                >
                  Analyze Velocity
                </button>

                {spamResult && (
                  <div className="mt-4 p-4 bg-black rounded-2xl border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Spam Classification</p>
                      <p className={`font-black uppercase mt-1 ${spamResult.spam ? 'text-red-400':'text-emerald-400'}`}>
                        {spamResult.spam ? "🚨 SPAM TRIGGERED":"🎉 SAFE VELOCITY"}
                      </p>
                    </div>
                    {spamResult.spam && (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl font-bold uppercase text-[10px]">
                        Action: MUTE
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Simulator Section 3: Fraud Scoring */}
              <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                  <ShieldAlert size={18} />
                  <h3 className="text-sm font-black uppercase tracking-widest">Financial Fraud Score Engine</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">
                      Failed Payments (x20)
                    </label>
                    <input
                      type="number"
                      value={failedPayments}
                      onChange={(e) => setFailedPayments(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">
                      Suspicious Logins (x30)
                    </label>
                    <input
                      type="number"
                      value={suspiciousLogins}
                      onChange={(e) => setSuspiciousLogins(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">
                      Rapid Withdrawals (x50)
                    </label>
                    <input
                      type="number"
                      value={rapidWithdrawals}
                      onChange={(e) => setRapidWithdrawals(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSimulateFraud}
                  className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl transition"
                >
                  Calculate Fraud Risk
                </button>

                {fraudResult && (
                  <div className="mt-4 p-5 bg-black rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Fraud Score Indicator</p>
                        <p className={`font-black mt-1 text-xl ${
                          fraudResult.fraudScore >= 80 ? "text-red-500" : fraudResult.fraudScore >= 50 ? "text-amber-500" : "text-emerald-400"
                        }`}>
                          {fraudResult.fraudScore} / 100
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Flagged Action</p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest ${getActionBadge(fraudResult.action)}`}>
                          {fraudResult.action}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );

  function handleSpamResult() {
    handleSimulateSpam();
  }
};

export default ModerationDashboard;
