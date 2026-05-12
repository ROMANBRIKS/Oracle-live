import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, Mail, Lock, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StaffAdminLogin: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const navigate = useNavigate();

  const login = async () => {
    if (!form.email || !form.password) {
      setStatus({ type: 'error', message: "Please enter both email and password." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await axios.post("/api/staff-admin/login", form);

      if (res.data.success) {
        localStorage.setItem("staffToken", res.data.token);
        localStorage.setItem("staffAdmin", JSON.stringify(res.data.admin));
        setStatus({ type: 'success', message: "Staff login successful! Redirecting..." });
        
        setTimeout(() => {
          navigate("/admin"); // Redirecting to the main admin hub
        }, 1500);
      }
    } catch (err: any) {
      console.error("Staff Login Error:", err);
      setStatus({ type: 'error', message: err.response?.data?.message || "Invalid staff credentials." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,_rgba(6,182,212,0.1)_0%,_transparent_50%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,_rgba(6,182,212,0.1)_0%,_transparent_50%)]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="liquid-glass border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-[0_0_100px_rgba(0,0,0,1)]">
          <div className="text-center space-y-3">
             <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Shield size={32} className="text-cyan-400" />
             </div>
             <h1 className="text-4xl font-black italic uppercase tracking-tighter">Staff Portal</h1>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Oracle Enterprise Administration</p>
          </div>

          <div className="space-y-6">
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl flex items-start gap-3 border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
              >
                {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                <p className="text-xs font-bold leading-tight">{status.message}</p>
              </motion.div>
            )}

            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Staff Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="email"
                      placeholder="admin@oracle.live"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Access Key</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
               </div>
            </div>

            <button 
              onClick={login}
              disabled={loading}
              className="w-full bg-white text-black py-5 rounded-2.5xl font-black uppercase italic tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                <>
                  Internal Login
                  <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
             <p className="text-[9px] font-black uppercase tracking-widest text-white/20 text-center leading-relaxed">
                Terminal Auth Required • Unauthorized Access is Logged <br />
                © 2026 Oracle Live Network Staffing
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffAdminLogin;
