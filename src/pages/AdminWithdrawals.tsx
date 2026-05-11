
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, CheckCircle, XCircle, Clock, 
  Search, Filter, ArrowDownToLine, Wallet
} from "lucide-react";

interface Withdrawal {
  id: number;
  username: string;
  amount: number;
  currency: string;
  method: string;
  wallet_address: string;
  status: string;
  created_at: string;
}

const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get("/api/admin/withdrawals/all");
      setWithdrawals(res.data);
    } catch (err) {
      console.error("Failed to fetch withdrawals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const updateStatus = async (id: number, action: string) => {
    try {
      await axios.post(`/api/admin/withdrawals/${action}/${id}`);
      fetchWithdrawals();
    } catch (err) {
      console.error(`Status update failed: ${action}`, err);
    }
  };

  const filtered = withdrawals.filter(w => filter === "all" || w.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tight">
            <History className="text-white/40" size={20} /> Withdrawal Ledger
          </h2>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Full Transactional History & Audit Log</p>
        </div>
        <div className="flex gap-2 p-1 liquid-glass rounded-xl">
          {["all", "pending", "completed", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === s ? "bg-white text-black" : "text-white/40 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center liquid-glass rounded-[3rem] border-dashed">
            <p className="text-white/20 text-[10px] font-black uppercase italic tracking-widest">No matching records found.</p>
          </div>
        ) : (
          filtered.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="liquid-glass p-6 rounded-[2rem] group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    w.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    w.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  }`}>
                    {w.status === 'completed' ? <CheckCircle size={24} /> : w.status === 'rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight uppercase italic">{w.username}</h3>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{new Date(w.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white tracking-tighter">{w.amount} <span className="text-amber-400 text-sm">{w.currency}</span></p>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{w.method} Payout</p>
                </div>
              </div>

              <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Wallet size={16} className="text-white/30" />
                  <span className="text-[11px] font-mono text-white/60">{w.wallet_address}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  w.status === 'completed' ? 'text-emerald-500' : 
                  w.status === 'rejected' ? 'text-red-500' : 'text-amber-400'
                }`}>
                  {w.status}
                </div>
              </div>

              {w.status !== 'completed' && w.status !== 'rejected' && (
                <div className="flex gap-3">
                  {w.status === 'pending' || w.status === 'queued' ? (
                    <button 
                      onClick={() => updateStatus(w.id, 'approve')}
                      className="flex-1 py-4 bg-emerald-500 text-black rounded-[1.5rem] font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Approve Request
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateStatus(w.id, 'complete')}
                      className="flex-1 py-4 bg-blue-500 text-white rounded-[1.5rem] font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Mark as Completed
                    </button>
                  )}
                  <button 
                    onClick={() => updateStatus(w.id, 'reject')}
                    className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[1.5rem] font-black uppercase italic tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
