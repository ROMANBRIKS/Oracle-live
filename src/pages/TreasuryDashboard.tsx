import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  Wallet,
  Coins,
  AlertTriangle,
  ArrowUpRight,
  ChevronLeft,
  RefreshCcw,
  BarChart,
  Activity,
  History,
  Lock,
  Flame,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

interface TreasuryRecord {
  currency: string;
  hot_wallet_balance: number;
  cold_wallet_balance: number;
  pending_withdrawals: number;
  low_liquidity: number;
  updated_at: string;
  ai_recommendation?: string;
}

const TreasuryDashboard: React.FC = () => {
  const [treasury, setTreasury] = useState<TreasuryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refilling, setRefilling] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [reconciledCount, setReconciledCount] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadTreasury = async () => {
    try {
      const res = await axios.get("/api/admin/treasury");
      setTreasury(res.data);
    } catch (err) {
      console.error("Failed to load treasury archive", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreasury();
    const interval = setInterval(loadTreasury, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRefill = async (currency: string, type: "hot" | "cold") => {
    setRefilling(true);
    try {
      // Mock refill for demo purposes - adds 1000 to the balance
      await axios.post("/api/admin/treasury/refill", {
        currency,
        amount: 1000,
        type,
      });
      await loadTreasury();
    } catch (err) {
      console.error("Refill failed", err);
    } finally {
      setRefilling(false);
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);
    setReconciledCount(null);
    try {
      const res = await axios.post("/api/admin/treasury/reconcile");
      if (res.data.success) {
        setReconciledCount(res.data.reconciledTransactions);
        await loadTreasury();
      }
    } catch (err) {
      console.error("Reconciliation execution failed", err);
    } finally {
      setReconciling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalHotAssets = treasury.reduce(
    (acc, curr) => acc + curr.hot_wallet_balance,
    0,
  );
  const totalColdAssets = treasury.reduce(
    (acc, curr) => acc + curr.cold_wallet_balance,
    0,
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <ShieldCheck className="text-indigo-500" /> Treasury{" "}
              <span className="text-white/20">Control</span>
            </h1>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1 ml-1">
              Universal Asset Liquidity & Risk Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
              Vault Secure
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[2.5rem] bg-indigo-600 relative overflow-hidden"
          >
            <BarChart className="absolute top-4 right-4 opacity-10" size={64} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">
              Aggregate Hot Balance
            </p>
            <h3 className="text-4xl font-black italic tracking-tighter">
              ${totalHotAssets.toLocaleString()}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">
              Offline Cold Storage
            </p>
            <h3 className="text-4xl font-black italic tracking-tighter">
              ${totalColdAssets.toLocaleString()}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">
              Pending Discharge
            </p>
            <h3 className="text-4xl font-black italic tracking-tighter text-amber-500">
              $
              {treasury
                .reduce((acc, curr) => acc + curr.pending_withdrawals, 0)
                .toLocaleString()}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">
                System Health
              </p>
              <h3 className="text-xl font-black italic tracking-tighter text-emerald-500 uppercase">
                Optimize
              </h3>
            </div>
            <Activity size={32} className="text-emerald-500" />
          </motion.div>
        </div>

        {/* Currency Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treasury.map((item, idx) => (
            <motion.div
              key={item.currency}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-[3rem] bg-zinc-900/50 border transition-all hover:scale-[1.02] active:scale-[0.98] ${item.low_liquidity ? "border-red-500/40 bg-red-500/5" : "border-white/5"}`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black italic text-xl text-indigo-400">
                    {item.currency.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-lg font-black italic tracking-tighter uppercase">
                      {item.currency}
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                      Network Asset
                    </span>
                  </div>
                </div>
                {item.low_liquidity ? (
                  <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full flex items-center gap-2">
                    <AlertTriangle size={12} className="text-red-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500">
                      Low Liquidity
                    </span>
                  </div>
                ) : (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Flame size={16} className="text-orange-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Hot Wallet
                    </span>
                  </div>
                  <span className="text-lg font-black italic tracking-tighter text-white">
                    ${item.hot_wallet_balance.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 opacity-60">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Cold Wallet
                    </span>
                  </div>
                  <span className="text-lg font-black italic tracking-tighter">
                    ${item.cold_wallet_balance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={refilling}
                  onClick={() => handleRefill(item.currency, "hot")}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCcw size={12} /> Refill Hot
                </button>
                <button
                  disabled={refilling}
                  onClick={() => handleRefill(item.currency, "cold")}
                  className="flex-1 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ArrowUpRight size={12} /> Sync Cold
                </button>
              </div>
            </motion.div>
          ))}

          {/* Add New Shell */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/10 transition-colors group"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <RefreshCcw size={32} className="text-white/20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
              Initialize New Currency
            </p>
            <ArrowRight className="mt-4 text-white/10 group-hover:translate-x-2 transition-transform" />
          </motion.div>
        </div>

        {/* Global Archive Link */}
        <div className="mt-16 bg-zinc-900/50 border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between border-b-4 border-b-indigo-500">
          <div className="flex items-center gap-6 mb-6 md:mb-0">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <History size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase">
                Audit & Settlement AI
              </h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                Run settlement checks and transaction auto-verification
              </p>
              {reconciledCount !== null && (
                <p className="text-xs text-emerald-400 font-bold mt-2">
                  ✨ SUCCESS: Checked and reconciled {reconciledCount} pending queue items.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
            <button
              onClick={handleReconcile}
              disabled={reconciling}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {reconciling ? "Settling..." : "Trigger Settlement AI"}
            </button>
            <button className="px-10 py-4 bg-zinc-800 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors">
              Export Transparency Report
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-20 flex flex-col items-center gap-4 opacity-10">
        <div className="text-[8px] font-black uppercase tracking-[1em]">
          Universal Oracle Treasury Layer
        </div>
        <div className="flex items-center gap-6">
          <Coins size={12} />
          <Wallet size={12} />
          <ShieldCheck size={12} />
        </div>
      </div>
    </div>
  );
};

export default TreasuryDashboard;
