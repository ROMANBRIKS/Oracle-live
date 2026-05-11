
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Wallet, TrendingUp, ShieldCheck, 
  ChevronRight, CreditCard, Landmark, Phone 
} from "lucide-react";

interface Withdrawal {
  id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

const Withdraw: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [method, setMethod] = useState<"crypto" | "bank" | "mobile">("crypto");
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const userRes = localStorage.getItem("user");
  const user = userRes ? JSON.parse(userRes) : null;

  useEffect(() => {
    if (user) {
      fetchWithdrawals();
    }
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get(`/api/withdrawals/user/${user.id}`);
      setWithdrawals(res.data);
    } catch (err) {
      console.error("Failed to fetch withdrawals", err);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) return setMessage({ type: "error", text: "Invalid amount" });
    if (method === "crypto" && !walletAddress) return setMessage({ type: "error", text: "Enter wallet address" });

    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("/api/withdrawals/request", {
        userId: user.id,
        amount: Number(amount),
        currency,
        method,
        walletAddress
      });

      setMessage({ type: "success", text: res.data.message });
      fetchWithdrawals();
      setAmount("");
      setWalletAddress("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Withdrawal failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="p-6">
        <button onClick={onBack} className="w-10 h-10 liquid-glass rounded-2xl flex items-center justify-center mb-8">
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-3xl font-black italic tracking-tighter mb-2">WITHDRAW</h1>
        <p className="text-white/40 text-sm mb-8 font-mono">Convert your earnings into real capital.</p>

        {/* Method Toggles */}
        <div className="flex gap-2 mb-8 liquid-glass p-1.5 rounded-3xl">
          {(["crypto", "bank", "mobile"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                method === m ? "bg-white text-black shadow-xl" : "text-white/40"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Amount to Withdraw</label>
            <div className="relative group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-2xl font-black focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent text-sm font-black border-none focus:ring-0 text-amber-400"
                >
                  <option className="bg-black">USDT</option>
                  <option className="bg-black">BTC</option>
                  <option className="bg-black">ETH</option>
                  <option className="bg-black">SOL</option>
                  <option className="bg-black">TRX</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address/Details Input */}
          <AnimatePresence mode="wait">
            {method === "crypto" ? (
              <motion.div 
                key="crypto"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Destination Wallet ({currency})</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={`Enter your ${currency} address`}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 text-sm font-mono focus:outline-none focus:border-white/30 transition-all"
                />
              </motion.div>
            ) : (
              <motion.div 
                key="other"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 liquid-glass rounded-[2rem] flex flex-col items-center justify-center text-center py-12"
              >
                <ShieldCheck className="text-amber-400 mb-4" size={32} />
                <h3 className="font-bold mb-2 uppercase tracking-tighter">Identity Check Required</h3>
                <p className="text-xs text-white/40 leading-relaxed"> fiat withdrawals require level 2 verification. <br/> Please use crypto for instant payouts.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl text-center text-xs font-bold ${
                message.type === "success" ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-red-500/20 text-red-500 border border-red-500/30"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <button 
            disabled={loading || method !== "crypto"}
            onClick={handleWithdraw}
            className={`w-full py-6 rounded-[2rem] font-black tracking-widest text-xs uppercase flex items-center justify-center gap-3 transition-all ${
              loading || method !== "crypto" ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? "PROCESSING..." : "REQUEST CAPITAL WITHDRAWAL"}
          </button>
        </div>

        {/* History */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Recent Activity</h2>
            <div className="w-8 h-[1px] bg-white/10"></div>
          </div>

          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <div className="text-center py-12 text-white/20 font-mono text-xs">NO WITHDRAWAL RECORDS FOUND</div>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="liquid-glass p-5 rounded-[1.8rem] flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      w.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 
                      w.status === 'queued' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{w.amount} {w.currency}</p>
                      <p className="text-[9px] text-white/30 font-mono uppercase">{new Date(w.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    w.status === 'completed' ? 'text-emerald-500' : 
                    w.status === 'queued' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {w.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
