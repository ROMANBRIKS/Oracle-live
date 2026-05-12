import React, { useEffect, useState } from "react";
import axios from "axios";
import { Shield, ShieldAlert, AlertTriangle, MessageSquare, Clock, Trash2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModerationLog {
  id: number;
  user_id: string;
  username: string;
  room_id: string;
  type: string;
  reason: string;
  message: string;
  severity: string;
  created_at: string;
}

const ModerationDashboard: React.FC = () => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadLogs = async () => {
    try {
      // Fetching logs for sample-room as per requested demo behavior
      const res = await axios.get("/api/moderation/logs/sample-room");
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "ban": return <Trash2 size={16} className="text-red-600" />;
      case "mute": return <ShieldAlert size={16} className="text-amber-600" />;
      case "warning": return <AlertTriangle size={16} className="text-blue-600" />;
      default: return <MessageSquare size={16} className="text-white/40" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2">
              <Shield className="text-indigo-500" /> AI Moderation Center
            </h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Real-time threat monitoring & enforcement</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Engine Online</span>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Flags</p>
          <h3 className="text-3xl font-black italic tracking-tighter">{logs.length}</h3>
        </div>
        <div className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">High Severity</p>
          <h3 className="text-3xl font-black italic tracking-tighter text-red-500">
            {logs.filter(l => l.severity === 'high').length}
          </h3>
        </div>
        <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Active Room</p>
          <h3 className="text-xl font-black italic tracking-tighter uppercase">sample-room</h3>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4 max-w-5xl mx-auto">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/20 mb-4 px-2">Operation Logs</h3>
        {logs.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-white/10 rounded-[2rem]">
            <Shield className="mx-auto text-white/10 mb-4" size={48} />
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No violations detected in the archive</p>
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id}
              className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center gap-6"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                {getLogIcon(log.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getSeverityColor(log.severity)}`}>
                    {log.severity}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Type: <span className="text-white">{log.type}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-white/20 ml-auto">
                    <Clock size={10} /> {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                
                <h4 className="text-sm font-bold text-indigo-400">@{log.username}</h4>
                <p className="text-sm font-medium text-white/80 mt-1 italic">"{log.message}"</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">
                  Reason: <span className="text-white">{log.reason}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModerationDashboard;
