import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { 
  Shield, Wallet, Banknote, RefreshCw, 
  TrendingUp, Activity, Lock
} from "lucide-react";

interface TreasuryData {
  hotWallets: {
    crypto: { [key: string]: number };
  };
  coldWallets: { [key: string]: number };
  lastAudit: string;
  treasuryStatus: string;
  backingRatio: string;
}

const Treasury: React.FC = () => {
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTreasury = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/treasury/overview");
      setData(res.data);
    } catch (err) {
      console.error("Treasury load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreasury();
  }, []);

  if (loading) return (
    <div className="py-20 flex justify-center">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="liquid-glass p-8 rounded-[2.5rem] border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <Shield size={24} />
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{data.treasuryStatus}</span>
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Treasury Backing</p>
          <p className="text-4xl font-black italic tracking-tighter">{data.backingRatio}</p>
        </div>

        <div className="liquid-glass p-8 rounded-[2.5rem] border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <Activity size={24} />
            </div>
            <button onClick={loadTreasury}><RefreshCw size={14} className="text-white/20 hover:text-white transition-colors" /></button>
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Active Hot Flow</p>
          <p className="text-4xl font-black italic tracking-tighter">LIVE</p>
        </div>

        <div className="liquid-glass p-8 rounded-[2.5rem] border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Minter Audit</p>
          <p className="text-[11px] font-mono text-white/60">LATEST: {new Date(data.lastAudit).toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hot Wallets */}
        <div className="liquid-glass p-8 rounded-[3rem]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tight">Active Liquidity (Hot)</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(data.hotWallets.crypto).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center font-black text-[10px]">{key}</div>
                  <span className="font-bold text-sm tracking-widest uppercase">{key} Reserve</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-black">{value.toLocaleString()}</p>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Available</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Wallets */}
        <div className="liquid-glass p-8 rounded-[3rem]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400">
              <Lock size={20} />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tight">Vault Reserves (Cold)</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(data.coldWallets).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-5 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center font-black text-[10px] text-blue-400 border border-blue-500/20">{key}</div>
                  <span className="font-bold text-sm tracking-widest uppercase">{key} Vault</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-black text-white/50">{value.toLocaleString()}</p>
                  <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest">Locked</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Treasury;
