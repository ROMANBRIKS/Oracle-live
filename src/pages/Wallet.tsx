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
      // Use "me" shortcut to ensure we get the data for the authenticated user
      // if the stored userId happens to be stale or incorrect.
      const [walletRes, historyRes] = await Promise.all([
        axios.get("/api/wallets/me"),
        axios.get(`/api/payments/history/${userId}`)
      ]);
      setWallet(walletRes.data);
      setHistory(historyRes.data);
    } catch (err: any) {
      console.error("Wallet data fetch error:", err);
      // If we get a 404, it might mean the user session is invalid/stale
      if (err.response?.status === 404) {
        console.warn("Wallet not found. Possible session desync.");
      }
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
      alert("Payment simulation failed");
    }
  };

  const convertEarnings = async (amount: number) => {
    try {
      await axios.post("/api/wallets/convert", { userId, from: "earnings", to: "coins", amount });
      alert(`Successfully converted ${amount} earnings to coins!`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Conversion failed");
    }
  };

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 font-sans max-w-2xl mx-auto ring-1 ring-zinc-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 rounded-2xl">
              <WalletIcon className="text-cyan-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
              <p className="text-zinc-500 text-sm">Manage coins and withdrawals</p>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="relative overflow-hidden liquid-glass p-8 rounded-[2.5rem] mb-8 group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <WalletIcon size={120} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Internal Assets</p>
              <div className="flex items-end gap-2">
                <h2 className="text-5xl font-black tracking-tighter text-white">🪙 {wallet?.coins || 0}</h2>
                <span className="text-white/40 font-bold mb-2 uppercase text-[10px]">Coins</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-pink-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Creator Earnings</p>
              <div className="flex items-end gap-2 justify-end">
                <h2 className="text-3xl font-black tracking-tighter text-pink-500">${wallet?.earnings || 0}</h2>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/kyc")}
              className="flex-1 liquid-button border-blue-500/30 py-4 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider"
            >
              <Shield size={20} className="text-blue-400" />
              KYC Verify
            </button>
            <button 
              onClick={onWithdraw}
              className="flex-2 bg-emerald-500 text-black font-black py-4 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <ArrowUpRight size={18} />
              Cash Out
            </button>
            <button 
              onClick={() => convertEarnings(wallet?.earnings || 0)}
              className="flex-1 liquid-button py-4 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              <RefreshCw size={16} />
              Convert
            </button>
          </div>
        </div>

        {/* Fiat Payout Option */}
        <div className="mb-8 px-2">
            <button 
              onClick={() => navigate("/fiat-withdraw")}
              className="w-full bg-white text-black p-6 rounded-[2.5rem] flex items-center justify-between group hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center">
                  <Landmark size={24} className="text-black" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 leading-none mb-1">Modern Payout</p>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Bank / MoMo Payout</h3>
                </div>
              </div>
              <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center group-hover:bg-black/10 transition-colors">
                <ChevronRight size={20} />
              </div>
            </button>
        </div>

        {/* Wallet Tabs */}
        <div className="flex bg-white/5 p-1.5 rounded-[1.8rem] mb-6 gap-1 border border-white/5">
          {(['overview', 'crypto', 'fiat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white/15 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Detailed Balances */}
        <AnimatePresence mode="wait">
          {activeTab === 'crypto' && (
            <motion.div 
              key="crypto_grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3 mb-8"
            >
              {[
                { symbol: 'BTC', balance: wallet?.crypto.btc, color: 'text-orange-500' },
                { symbol: 'ETH', balance: wallet?.crypto.eth, color: 'text-purple-500' },
                { symbol: 'USDT', balance: wallet?.crypto.usdt, color: 'text-green-500' },
                { symbol: 'SOL', balance: wallet?.crypto.sol, color: 'text-cyan-500' },
                { symbol: 'BNB', balance: wallet?.crypto.bnb, color: 'text-yellow-500' },
                { symbol: 'TRX', balance: wallet?.crypto.trx, color: 'text-red-500' },
              ].map((c) => (
                <div key={c.symbol} className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-3xl">
                  <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">{c.symbol}</p>
                  <p className={`text-xl font-black ${c.color}`}>{c.balance || 0}</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'fiat' && (
            <motion.div 
              key="fiat_grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3 mb-8"
            >
              <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-3xl">
                <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">USD Wallet</p>
                <p className="text-xl font-black text-white">${wallet?.fiat.usd || 0}</p>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-3xl">
                <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">GHS Wallet</p>
                <p className="text-xl font-black text-white">₵{wallet?.fiat.ghs || 0}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-up Options */}
        <div className="mb-8">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 ml-2">Recharge Center</h3>
          <div className="grid grid-cols-3 gap-3">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => buyCoins(amount)}
                className="liquid-glass hover:bg-white/10 p-6 rounded-[2rem] transition-all group active:scale-95"
              >
                <p className="text-white/40 text-[10px] font-black uppercase mb-1">Get</p>
                <p className="text-xl font-black mb-2 flex items-center justify-center gap-1">
                  <span className="text-sm">🪙</span> {amount}
                </p>
                <div className="bg-white/10 text-white/80 text-[10px] font-black py-1 rounded-full group-hover:bg-white group-hover:text-black transition-colors">
                  ${(amount/100).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Crypto Wallet Section */}
        <CryptoWallet onSuccess={fetchData} />

        {/* Transaction History */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <History size={14} />
              Recent Transactions
            </h3>
            <button 
              onClick={() => navigate("/transactions")}
              className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-white transition-colors"
            >
              View Blockchain Ledger
            </button>
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-12 text-center">
                <p className="text-zinc-500 italic text-sm">No transaction history found.</p>
              </div>
            ) : (
              history.map((tx, idx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl flex items-center justify-between hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${tx.type === 'coin_purchase' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {tx.type === 'coin_purchase' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm capitalize">{tx.type.replace('_', ' ')}</p>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">
                        {tx.provider} • {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${tx.type === 'coin_purchase' ? 'text-green-500' : 'text-zinc-200'}`}>
                      {tx.type === 'coin_purchase' ? '+' : '-'}{tx.amount}
                    </p>
                    <p className={`text-[9px] uppercase font-black tracking-widest ${tx.status === 'success' ? 'text-cyan-400' : 'text-yellow-500'}`}>
                      {tx.status}
                    </p>
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
