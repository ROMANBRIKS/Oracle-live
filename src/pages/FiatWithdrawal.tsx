
import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Wallet, Building2, Landmark, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

const FiatWithdrawal: React.FC = () => {
  const [form, setForm] = useState({
    amount: "",
    accountNumber: "",
    bankCode: "",
    currency: "GHS",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const submit = async () => {
    if (!form.amount || !form.accountNumber) {
      setStatus({ type: 'error', message: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await axios.post("/api/fiat/withdraw", {
        userId: user.id,
        ...form,
      });

      if (res.data.success) {
        setStatus({ type: 'success', message: "Withdrawal request submitted successfully! Your funds are being processed." });
      } else {
        setStatus({ type: 'error', message: res.data.message || "Failed to process withdrawal." });
      }
    } catch (err: any) {
      console.error("Withdrawal error:", err);
      setStatus({ type: 'error', message: err.response?.data?.message || "Server error occurred. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 px-6 pt-12 bg-black">
      <div className="max-w-xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter italic">Fiat Payout</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Powered by Paystack</p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Status Message */}
          {status && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl flex items-start gap-3 border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
            >
              {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              <p className="text-sm font-bold leading-tight">{status.message}</p>
            </motion.div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Withdrawal Amount</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">
                <Wallet size={20} />
              </div>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-2.5xl py-5 pl-14 pr-24 text-lg font-bold focus:outline-none focus:border-cyan-500/50 transition-all"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <select 
                  className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs font-black focus:outline-none"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  <option value="GHS">GHS</option>
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Account Number</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">
                <Landmark size={20} />
              </div>
              <input 
                type="text"
                placeholder="Enter account or MoMo number"
                className="w-full bg-white/5 border border-white/10 rounded-2.5xl py-5 pl-14 pr-6 font-bold focus:outline-none focus:border-cyan-500/50 transition-all"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Bank / Provider Code</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">
                <Building2 size={20} />
              </div>
              <input 
                type="text"
                placeholder="e.g. 058 for GTBank or MTL for MoMo"
                className="w-full bg-white/5 border border-white/10 rounded-2.5xl py-5 pl-14 pr-6 font-bold focus:outline-none focus:border-cyan-500/50 transition-all"
                value={form.bankCode}
                onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={submit}
              disabled={loading}
              className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase italic tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                "Withdraw Funds"
              )}
            </button>
          </div>

          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-3">
             <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Important Note</span>
             </div>
             <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                Please double-check your account details. Payouts are typically processed within 24-48 hours. Mobile Money transfers are often instant once approved. Minimum withdrawal is 10 GHS or equivalent.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiatWithdrawal;
