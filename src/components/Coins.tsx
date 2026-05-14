import React, { useEffect, useState } from "react";
import { Coins as CoinsIcon, Plus, CreditCard, X } from "lucide-react";
import axios from "axios";
import { motion } from "motion/react";

function Coins() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = { username: localStorage.getItem("user") };
  }
  const userId = user?.username || "guest"; 
  const [coins, setCoins] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (userId === "guest" || !token) return;
    
    axios.get(`/api/coins/${userId}`)
      .then((res) => {
        setCoins(res.data.coins);
      })
      .catch(err => console.error("Error fetching coins:", err));
  }, [userId]);

  const buyCoins = async (amount: number) => {
    try {
      const res = await axios.post("/api/coins/buy", { userId, amount });
      setCoins(res.data.coins);
      setShowModal(false);
    } catch (err) {
      console.error("Purchase failed", err);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 crystal-pill p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-white/5">
        <div className="flex items-center gap-2 pl-3">
          <div className="bg-cyan-400/20 p-1.5 rounded-xl border border-cyan-400/20">
            <CoinsIcon size={14} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          </div>
          <span className="font-black italic text-sm tracking-tighter text-white">{coins.toLocaleString()}</span>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-8 h-8 crystal-button bg-cyan-400 text-black border-none hover:scale-105 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          style={{ padding: 0 }}
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>

      {/* PURCHASE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="crystal-glass w-full max-w-sm rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-white/10"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex flex-col">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Refill <span className="text-cyan-400">Reserve</span></h3>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mt-1 italic">Oracle currency system</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 crystal-button group"
                style={{ background: 'none' }}
              >
                <X size={20} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] italic leading-none">select allocation</p>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,1)]" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Link active</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { coins: 100, price: "$0.99", icon: "💎", label: "Micro Clip" },
                  { coins: 500, price: "$4.99", icon: "🔥", label: "Surge Pack" },
                  { coins: 2000, price: "$18.99", icon: "👑", label: "Dominion Chest" },
                ].map((plan) => (
                  <button
                    key={plan.coins}
                    onClick={() => buyCoins(plan.coins)}
                    className="flex justify-between items-center liquid-glass hover:bg-white/5 border border-white/5 p-5 rounded-[2rem] transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4 relative z-10 font-sans">
                      <span className="text-3xl text-white/10 group-hover:text-white transition-colors grayscale group-hover:grayscale-0">{plan.icon}</span>
                      <div className="flex flex-col">
                        <div className="font-black italic text-xl text-white tracking-tighter group-hover:text-cyan-400 transition-colors">{plan.coins} <span className="text-xs opacity-40">COINS</span></div>
                        <div className="text-[9px] text-white/20 uppercase font-black tracking-widest italic">{plan.label}</div>
                      </div>
                    </div>
                    <div className="bg-cyan-400 group-hover:bg-white text-black font-black italic px-4 py-1.5 rounded-xl text-[10px] uppercase shadow-lg shadow-cyan-400/20 transition-all">
                      {plan.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-white/[0.03] text-[9px] text-white/20 text-center font-black uppercase tracking-[0.3em] italic border-t border-white/5">
              Secure Protocol Active • Neural Verification Enabled
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default Coins;
