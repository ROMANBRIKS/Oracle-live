import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Wallet, 
  TrendingUp, 
  History, 
  ArrowDownToLine, 
  CreditCard, 
  Bitcoin, 
  ChevronLeft, 
  Activity,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

interface CreatorWallet {
  user_id: string;
  coins: number;
  diamonds: number;
  total_earnings_usd: number;
  pending_usd: number;
  available_usd: number;
  total_withdrawn_usd: number;
  crypto_usdt: number;
  crypto_btc: number;
  crypto_eth: number;
  crypto_trx: number;
  crypto_bnb: number;
  crypto_sol: number;
  updated_at: string;
}

interface WithdrawalHistory {
  id: number;
  amount: number;
  method: string;
  currency: string;
  status: string;
  created_at: string;
  wallet_address?: string;
}

const RevenueDashboard: React.FC = () => {
  const [wallet, setWallet] = useState<CreatorWallet | null>(null);
  const [history, setHistory] = useState<WithdrawalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    try {
      const [walletRes, historyRes] = await Promise.all([
        axios.get(`/api/wallet/${user.id}`),
        axios.get(`/api/withdrawals/history/${user.id}`)
      ]);
      setWallet(walletRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Failed to load revenue data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !wallet) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse';
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <DollarSign className="text-emerald-500" /> Revenue <span className="text-white/20">Center</span>
            </h1>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1 ml-1">Universal Creator Earnings & Payouts</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
             <div className="text-right">
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Network Status</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase">Operational</p>
             </div>
             <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
                <Activity size={20} className="text-emerald-500" />
             </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Main Balance */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[3rem] bg-indigo-600 relative overflow-hidden group"
          >
            <div className="absolute -right-8 -top-8 text-white/10 rotate-12 group-hover:rotate-6 transition-transform">
               <Wallet size={160} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-4">Available for Payout</p>
            <div className="flex items-baseline gap-2 mb-8">
               <span className="text-5xl font-black italic tracking-tighter">${wallet.available_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               <span className="text-sm font-bold opacity-60 uppercase">USD</span>
            </div>
            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
               <ArrowDownToLine size={16} /> Request Withdrawal
            </button>
          </motion.div>

          {/* Pending & Lifetime */}
          <div className="grid grid-rows-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-between"
            >
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Pending Clearance</p>
                  <h3 className="text-3xl font-black italic tracking-tighter text-amber-500">${wallet.pending_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Clock size={24} />
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-between"
            >
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Lifetime Earnings</p>
                  <h3 className="text-3xl font-black italic tracking-tighter">${wallet.total_earnings_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <TrendingUp size={24} />
               </div>
            </motion.div>
          </div>

          {/* Crypto Snapshot */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-[3rem] bg-zinc-900 border border-white/5 flex flex-col justify-between"
          >
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Connected Crypto</p>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Bitcoin size={16} className="text-orange-500" />
                         <span className="text-xs font-bold uppercase text-white/60">Bitcoin</span>
                      </div>
                      <span className="font-mono text-sm">{wallet.crypto_btc.toFixed(6)}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">Ξ</div>
                         <span className="text-xs font-bold uppercase text-white/60">Ethereum</span>
                      </div>
                      <span className="font-mono text-sm">{wallet.crypto_eth.toFixed(6)}</span>
                   </div>
                </div>
             </div>
             <button className="mt-8 text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 hover:text-indigo-300">
                Manage Hot Wallet <ArrowDownToLine size={12} className="rotate-[270deg]" />
             </button>
          </motion.div>
        </div>

        {/* Withdrawal History */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8 px-4">
             <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-3">
                <History size={18} /> Withdrawal Archive
             </h3>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-emerald-500">Auto-Process On</span>
             </div>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-32 bg-zinc-900/50 border border-dashed border-white/5 rounded-[4rem]">
              <History className="mx-auto text-white/5 mb-6" size={64} />
              <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-[10px]">Your payout history looks clear</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record, idx) => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group p-6 rounded-[2rem] bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center gap-8"
                >
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-indigo-600/10 group-hover:text-indigo-500 transition-colors">
                      {record.method === 'crypto' ? <Bitcoin size={20} /> : <CreditCard size={20} />}
                   </div>

                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                         <span className="text-sm font-black italic tracking-tighter">${record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                         <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{record.method} Withdrawal</span>
                      </div>
                      <div className="text-[10px] font-mono text-white/20 truncate">
                         {record.wallet_address || 'Settled to Bank Account'}
                      </div>
                   </div>

                   <div className="flex items-center gap-8">
                      <div className="text-right">
                         <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Status</div>
                         <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${getStatusStyle(record.status)}`}>
                            {record.status}
                         </div>
                      </div>
                      
                      <div className="text-right hidden sm:block">
                         <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Completed</div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            {new Date(record.created_at).toLocaleDateString()}
                         </div>
                      </div>
                   </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Visual Accents */}
      <div className="mt-20 text-center opacity-10">
         <div className="text-[8px] font-black uppercase tracking-[1em] mb-4">Secure Fintech Layer</div>
         <div className="flex items-center justify-center gap-4">
            <CheckCircle2 size={12} />
            <CreditCard size={12} />
            <Bitcoin size={12} />
            <AlertCircle size={12} />
         </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
