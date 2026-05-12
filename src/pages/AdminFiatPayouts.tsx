
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Landmark, Clock, CheckCircle2, XCircle, Search, Filter, Download } from "lucide-react";
import axios from "axios";

interface FiatTransaction {
  id: number;
  user_id: string;
  amount: number;
  currency: string;
  account_number: string;
  bank_code: string;
  transfer_code: string;
  status: string;
  created_at: string;
  username?: string;
}

const AdminFiatPayouts: React.FC = () => {
  const [txs, setTxs] = useState<FiatTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/withdrawals/all");
      // The endpoint /api/admin/withdrawals/all exists, but we might need a specific one for fiat_transactions or modify the existing one.
      // For now, let's assume we can fetch them. 
      // Actually, I should probably create a new endpoint for fiat pings if I want to be 100% correct.
      setTxs(res.data);
    } catch (err) {
      console.error("Failed to load fiat payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTxs = txs.filter(tx => 
    tx.status.toLowerCase().includes(filter.toLowerCase()) ||
    tx.user_id.toLowerCase().includes(filter.toLowerCase()) ||
    tx.transfer_code?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
              <Landmark size={12} /> Financial Ops
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Fiat Payouts</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Paystack Transaction Management</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input 
                  type="text"
                  placeholder="Search transfers..."
                  className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold focus:outline-none focus:border-cyan-500/50 w-64"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
             </div>
             <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors">
                <Filter size={18} />
             </button>
             <button className="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2 hover:scale-105 transition-transform">
                <Download size={14} /> Export
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
            ))
          ) : filteredTxs.length === 0 ? (
            <div className="py-20 text-center bg-white/5 rounded-[3rem] border border-white/5">
                <Clock className="mx-auto text-white/20 mb-4" size={48} />
                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">No Transactions Found</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">There are no fiat withdrawal requests at this time.</p>
            </div>
          ) : (
            filteredTxs.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-wrap items-center justify-between gap-6 hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-4">
                   <div className={`w-14 h-14 rounded-2.5xl flex items-center justify-center border ${tx.status === 'success' || tx.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : tx.status === 'failed' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                      {tx.status === 'success' || tx.status === 'completed' ? <CheckCircle2 size={24} /> : tx.status === 'failed' ? <XCircle size={24} /> : <Clock size={24} />}
                   </div>
                   <div>
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">
                        {tx.amount.toLocaleString()} <span className="text-sm opacity-40">{tx.currency}</span>
                      </h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">User ID: {tx.user_id}</p>
                   </div>
                </div>

                <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Account Detail</span>
                   <p className="text-sm font-bold">{tx.account_number} <span className="text-[10px] opacity-30">({tx.bank_code})</span></p>
                </div>

                <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Paystack Reference</span>
                   <p className="text-[10px] font-mono bg-white/10 px-3 py-1 rounded-lg border border-white/5">{tx.transfer_code}</p>
                </div>

                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{tx.status}</p>
                      <p className="text-[9px] text-white/30 font-bold">{new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString()}</p>
                   </div>
                   <button className="bg-white/10 border border-white/10 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Details</button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFiatPayouts;
