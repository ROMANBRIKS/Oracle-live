import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  ShieldCheck, 
  UserPlus, 
  Activity, 
  History, 
  ChevronLeft, 
  Search, 
  Lock, 
  Eye, 
  UserCircle2, 
  Globe, 
  Cpu, 
  Terminal,
  MoreVertical,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface AuditLog {
  id: number;
  admin_id: string;
  admin_name: string;
  action: string;
  target_id: string;
  target_type: string;
  metadata: string;
  ip_address: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'audit' | 'roles'>('audit');
  const navigate = useNavigate();

  const loadLogs = async () => {
    try {
      const res = await axios.get("/api/admins/audit-logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                <ShieldCheck className="text-indigo-500" /> Admin <span className="text-white/20">Control</span>
              </h1>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mt-1 ml-1">Enterprise Permissions & Universal Audit Ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 rounded-2xl p-1.5 border border-white/5">
             <button 
                onClick={() => setTab('audit')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'audit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white'}`}
             >
                Audit Trails
             </button>
             <button 
                onClick={() => setTab('roles')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'roles' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white'}`}
             >
                Permission Matrix
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {tab === 'audit' ? (
            <motion.div 
              key="audit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Total Events</p>
                   <h3 className="text-3xl font-black italic tracking-tighter">{logs.length.toLocaleString()}</h3>
                </div>
                <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/40 mb-2">System Uptime</p>
                   <h3 className="text-3xl font-black italic tracking-tighter text-emerald-500">99.9%</h3>
                </div>
                <div className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Security Level</p>
                   <div className="flex items-center gap-2 mt-1">
                      <Lock size={16} className="text-indigo-500" />
                      <h3 className="text-xl font-black italic tracking-tighter uppercase">High</h3>
                   </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center group cursor-pointer hover:bg-white/5 transition-colors">
                   <Activity size={32} className="text-white/10 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>

              {/* Log Ledger */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-[3rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
                   <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-3">
                      <Terminal size={16} /> Decrypted Audit Stream
                   </h2>
                   <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-xl border border-white/5">
                      <Search size={14} className="text-white/20" />
                      <input 
                        type="text" 
                        placeholder="SEARCH LOGS..." 
                        className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-32 placeholder:text-white/10"
                      />
                   </div>
                </div>

                <div className="divide-y divide-white/5">
                  {logs.length === 0 ? (
                    <div className="p-24 text-center">
                       <Cpu className="mx-auto text-white/5 mb-6 animate-pulse" size={48} />
                       <p className="text-xs font-bold text-white/20 uppercase tracking-[0.2em]">Synchronizing data blocks...</p>
                    </div>
                  ) : (
                    logs.map((log, idx) => (
                      <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="p-6 md:p-8 hover:bg-white/[0.02] transition-colors group flex flex-col md:flex-row md:items-center gap-6"
                      >
                         <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                            {log.action.includes('create') ? <UserPlus size={20} /> : <Activity size={20} />}
                         </div>

                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-full border border-white/10 group-hover:border-indigo-500/30 transition-colors">
                                  {log.action}
                               </span>
                               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                  on {log.target_type} <span className="text-white/40">#{log.target_id?.substring(0, 8)}</span>
                               </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                               <div className="flex items-center gap-2">
                                  <UserCircle2 size={12} className="text-white/20" />
                                  <span className="text-xs font-black italic text-indigo-400">@{log.admin_name || 'System'}</span>
                               </div>
                               <div className="w-1 h-1 bg-white/10 rounded-full" />
                               <div className="flex items-center gap-2">
                                  <Globe size={12} className="text-white/10" />
                                  <span className="text-[10px] font-mono text-white/20">{log.ip_address || '0.0.0.0'}</span>
                               </div>
                            </div>
                         </div>

                         <div className="text-right flex flex-col items-end gap-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                               {new Date(log.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-[9px] font-mono text-white/10">
                               {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                         </div>

                         <div className="flex-shrink-0 pl-4 border-l border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10">
                               <Eye size={18} className="text-white/40" />
                            </button>
                         </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="p-8 bg-zinc-900/40 text-center border-t border-white/5">
                   <button className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors">
                      Load Extended Archive
                   </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="roles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto py-20"
            >
               <div className="text-center p-12 bg-zinc-900 rounded-[3rem] border border-white/5">
                  <Lock className="mx-auto text-indigo-500 mb-8" size={64} />
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-4">Permission Architecture</h2>
                  <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed mb-10">
                     Modify granular admin roles and universal access tokens. Only Super Admins can override the core permission matrix.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                     {[
                        { title: 'Super Admin', desc: 'Unlimited universal access', icon: <ShieldCheck className="text-indigo-400" /> },
                        { title: 'Finance Admin', desc: 'Locked to treasury & crypto', icon: <Globe className="text-emerald-400" /> },
                        { title: 'Mod Admin', desc: 'Safety & User enforcement', icon: <Activity className="text-orange-400" /> },
                        { title: 'Agency Admin', desc: 'Dedicated agency oversight', icon: <UserCircle2 className="text-blue-400" /> },
                     ].map((role) => (
                        <div key={role.title} className="p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                           <div className="flex items-center gap-4 mb-2">
                              {role.icon}
                              <h4 className="text-sm font-black uppercase tracking-widest">{role.title}</h4>
                           </div>
                           <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{role.desc}</p>
                        </div>
                     ))}
                  </div>

                  <button className="mt-12 px-10 py-5 bg-indigo-600 rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center mx-auto gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20">
                     <UserPlus size={18} /> Provision New Admin
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Security Overlay Label */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 z-50">
         <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-500 shadow-sm" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Security Layer Active</span>
         </div>
         <div className="w-px h-3 bg-white/10" />
         <div className="flex items-center gap-2">
            <Globe size={12} className="text-white/20" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Sync: Real-time</span>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
