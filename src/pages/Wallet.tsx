import React, { useEffect, useState } from "react";
import axios from "axios";
import { CreditCard, History, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, ChevronRight, Plus, RefreshCw, Shield, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import CryptoWallet from "../components/CryptoWallet";

interface Transaction {
  id: number;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  provider: string;
  created_at: string;
}

interface WalletData {
  coins: number;
  earnings: number;
  fiat: { usd: number; ghs: number };
  crypto: { btc: number; eth: number; usdt: number; sol: number; bnb: number; trx: number };
}

interface WalletProps {
  onWithdraw?: () => void;
}

function Wallet({ onWithdraw }: WalletProps) {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'crypto' | 'fiat'>('overview');

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const userId = user?.id || "";

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!userId || !token) return;
    setLoading(true);
    try {
      const [walletRes, historyRes] = await Promise.all([
        axios.get("/api/wallets/me"),
        axios.get(`/api/payments/history/${userId}`)
      ]);
      setWallet(walletRes.data);
      setHistory(historyRes.data);
    } catch (err: any) {
      console.error("Wallet data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const buyCoins = async (amount: number) => {
    try {
      await axios.post("/api/payments/buy-coins", { userId, amount });
      fetchData();
    } catch (err) {
      console.error("Purchase failed", err);
    }
  };

  const convertEarnings = async (amount: number) => {
    try {
      await axios.post("/api/wallets/convert", { userId, from: "earnings", to: "coins", amount });
      fetchData();
    } catch (err: any) {
      console.error(err.response?.data?.error || "Conversion failed");
    }
  };

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-crystal-void">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crystal-void text-white p-6 pb-32 font-sans relative overflow-x-hidden">
      {/* Background Decorative Blur */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none z-0" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto relative z-10"
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 crystal-button shadow-cyan-400/20">
              <WalletIcon className="text-cyan-400 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">My <span className="text-cyan-400">Vault</span></h1>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-1 italic">Oracle Reserve Interface</p>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="w-12 h-12 crystal-button group"
          >
            <RefreshCw className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors group-active:rotate-180 duration-500" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="crystal-glass p-10 rounded-[3.5rem] mb-12 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <WalletIcon size={180} />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
            <div>
              <p className="text-cyan-400/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic">Coin Balance</p>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center gap-3">
                    <span className="text-3xl">🪙</span> {wallet?.coins || 0}
                </div>
              </div>
            </div>
            <div className="h-px w-20 bg-white/10 hidden md:block" />
            <div className="text-left md:text-right">
              <p className="text-rose-400/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic">Creator Earnings</p>
              <div className="text-4xl font-black tracking-tighter text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                ${wallet?.earnings || 0}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => navigate("/kyc")}
              className="crystal-pill py-5 flex flex-col items-center justify-center gap-2 group"
            >
              <Shield size={20} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Verify</span>
            </button>
            <button 
              onClick={onWithdraw}
              className="bg-cyan-400 text-black font-black py-5 rounded-[2.5rem] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95 transition-all text-xs uppercase tracking-widest italic"
            >
              <ArrowUpRight size={18} />
              Cash Out
            </button>
            <button 
              onClick={() => convertEarnings(wallet?.earnings || 0)}
              className="crystal-pill py-5 flex flex-col items-center justify-center gap-2 group"
            >
              <RefreshCw size={20} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Convert</span>
            </button>
          </div>
        </div>

        {/* Payout Channels */}
        <div className="mb-12">
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-6 ml-4">Advanced Payout</h3>
            <button 
              onClick={() => navigate("/fiat-withdraw")}
              className="w-full crystal-glass p-8 rounded-[3rem] flex items-center justify-between group hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 crystal-button bg-cyan-400/10 shadow-none border-white/5">
                  <Landmark size={28} className="text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/50 leading-none mb-2">Direct Rail</p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Bank & <span className="text-cyan-400">MoMo</span></h3>
                </div>
              </div>
              <div className="w-12 h-12 crystal-button opacity-40 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={20} />
              </div>
            </button>
        </div>

        {/* Assets Explorer */}
        <div className="mb-8">
            <div className="flex items-baseline gap-4 mb-8 ml-4">
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Inventory</h3>
                <div className="flex bg-white/5 p-1 rounded-full border border-white/5 flex-1 max-w-[280px]">
                {(['overview', 'crypto', 'fiat'] as const).map((tab) => (
                    <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-cyan-400 text-black' : 'text-white/30 hover:text-white'}`}
                    >
                    {tab}
                    </button>
                ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
            {activeTab === 'crypto' && (
                <motion.div 
                key="crypto_grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 gap-4 mb-8"
                >
                {[
                    { symbol: 'BTC', balance: wallet?.crypto.btc, color: 'text-orange-400' },
                    { symbol: 'ETH', balance: wallet?.crypto.eth, color: 'text-purple-400' },
                    { symbol: 'USDT', balance: wallet?.crypto.usdt, color: 'text-emerald-400' },
                    { symbol: 'SOL', balance: wallet?.crypto.sol, color: 'text-cyan-400' },
                    { symbol: 'BNB', balance: wallet?.crypto.bnb, color: 'text-yellow-400' },
                    { symbol: 'TRX', balance: wallet?.crypto.trx, color: 'text-rose-400' },
                ].map((c) => (
                    <div key={c.symbol} className="crystal-glass p-6 rounded-[2rem] flex items-center justify-between group">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{c.symbol}</span>
                        <p className={`text-xl font-black ${c.color}`}>{c.balance || 0}</p>
                    </div>
                ))}
                </motion.div>
            )}

            {activeTab === 'fiat' && (
                <motion.div 
                key="fiat_grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 gap-4 mb-8"
                >
                <div className="crystal-glass p-8 rounded-[2.5rem] flex flex-col gap-2">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">USD Liquid</p>
                    <p className="text-3xl font-black text-white tracking-tighter">${wallet?.fiat.usd || 0}</p>
                </div>
                <div className="crystal-glass p-8 rounded-[2.5rem] flex flex-col gap-2">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">GHS Liquid</p>
                    <p className="text-3xl font-black text-white tracking-tighter">₵{wallet?.fiat.ghs || 0}</p>
                </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* Recharge Center */}
        <div className="mb-12">
          <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-8 ml-4">Recharge Center</h3>
          <div className="grid grid-cols-3 gap-6">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => buyCoins(amount)}
                className="crystal-glass group hover:scale-105 transition-all p-8 rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-95"
              >
                <div className="w-12 h-12 crystal-button group-hover:bg-cyan-400/20 transition-colors shadow-none border-white/5">
                    <Plus size={24} className="text-cyan-400" />
                </div>
                <div className="text-center">
                    <p className="text-2xl font-black text-white tracking-tighter flex items-center gap-2 mb-1 justify-center">
                        <span className="text-xl">🪙</span> {amount}
                    </p>
                    <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400/60 group-hover:text-cyan-400 transition-colors">
                        ${(amount/100).toFixed(2)}
                    </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Crypto Integration Component - Pass success callback */}
        <div className="mb-12">
            <CryptoWallet onSuccess={fetchData} />
        </div>

        {/* Ledger */}
        <div className="mt-16 pb-20">
          <div className="flex items-center justify-between mb-10 px-4">
            <div className="flex flex-col">
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic flex items-center gap-3">
                <History size={14} className="text-cyan-400" />
                Discovery Ledger
                </h3>
                <div className="h-0.5 w-8 bg-cyan-400/30 mt-2" />
            </div>
            <button 
              onClick={() => navigate("/transactions")}
              className="text-[9px] font-black uppercase tracking-widest text-cyan-400/50 hover:text-cyan-400 transition-all italic"
            >
              View Full History
            </button>
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="crystal-glass rounded-[3rem] p-16 text-center border border-dashed border-white/10">
                <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px] italic">No transaction records found in the current cycle.</p>
              </div>
            ) : (
              history.map((tx, idx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="crystal-glass p-6 rounded-[2rem] flex items-center justify-between hover:bg-white/5 transition-opacity duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 crystal-button ${tx.type === 'coin_purchase' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'} shadow-none border-white/5`}>
                      {tx.type === 'coin_purchase' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-black italic uppercase tracking-tighter text-sm text-white">{tx.type.replace('_', ' ')}</p>
                      <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-black mt-1">
                        {tx.provider} • {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black italic tracking-tighter ${tx.type === 'coin_purchase' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'coin_purchase' ? '+' : '-'}{tx.amount}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                        <div className={`w-1 h-1 rounded-full ${tx.status === 'success' ? 'bg-cyan-400 animate-pulse' : 'bg-yellow-400'}`} />
                        <p className={`text-[9px] uppercase font-black tracking-widest ${tx.status === 'success' ? 'text-cyan-400/60' : 'text-yellow-500/60'}`}>
                        {tx.status}
                        </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Wallet;
