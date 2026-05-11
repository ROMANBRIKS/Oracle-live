import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Clock, CheckCircle, ExternalLink, Shield as ShieldIcon, Coins as CoinsIcon } from "lucide-react";

interface Transaction {
  id: number;
  currency: string;
  amount: number;
  status: string;
  network: string;
  tx_hash: string;
  type: string;
  created_at: string;
}

const TransactionHistory: React.FC = () => {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      axios.get(`/api/blockchain/history/${userId}`)
        .then((res) => setTxs(res.data))
        .catch((err) => console.error("Failed to fetch tx history", err))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="p-6 pt-12 flex items-center gap-4">
        <button 
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
           <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Tx Registry</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Immutable Ledger Feed</p>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
             <div className="w-12 h-12 border-4 border-t-white border-white/10 rounded-full animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-widest">Querying Blockchain nodes...</p>
          </div>
        ) : txs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20 text-center">
             <ShieldIcon size={48} />
             <p className="text-[10px] font-black uppercase tracking-widest">Nothing found in the matrix.<br/>Initiate a transfer to see data.</p>
          </div>
        ) : (
          txs.map((tx) => (
            <div 
              key={tx.id} 
              className="liquid-glass p-5 rounded-[2rem] border-white/5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {tx.type === 'withdrawal' ? <ArrowLeft className="rotate-135" /> : <CoinsIcon />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">
                      {tx.type === 'withdrawal' ? 'Withdrawal' : 'Deposit'}
                    </h4>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                      {tx.network} • {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black italic text-white leading-none">
                    {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount}
                  </p>
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-1">
                    {tx.currency}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {tx.status === 'confirmed' || tx.status === 'completed' || tx.status === 'success' || tx.status === 'broadcasted' ? (
                    <CheckCircle size={12} className="text-emerald-500" />
                  ) : (
                    <Clock size={12} className="text-yellow-500 animate-pulse" />
                  )}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    tx.status === 'confirmed' || tx.status === 'success' || tx.status === 'broadcasted' ? 'text-emerald-500' : 'text-yellow-500'
                  }`}>
                    {tx.status}
                  </span>
                </div>
                
                {tx.tx_hash && (
                  <a 
                    href={`#`} 
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-1.5 text-[9px] font-black text-white/20 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                  >
                    <span>{tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-4)}</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
