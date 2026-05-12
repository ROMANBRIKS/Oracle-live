import React, { useEffect, useState } from "react";
import { Coins as CoinsIcon, Plus, CreditCard, X } from "lucide-react";
import axios from "axios";

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
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 shadow-inner">
        <div className="flex items-center gap-1.5">
          <div className="bg-yellow-500/20 p-1 rounded-full">
            <CoinsIcon size={14} className="text-yellow-500" />
          </div>
          <span className="font-bold text-sm tracking-tight">{coins.toLocaleString()}</span>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
          style={{ padding: 0 }}
        >
          <Plus size={14} className="text-black" />
        </button>
      </div>

      {/* PURCHASE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/10 animate-slide-up">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CreditCard size={20} className="text-pink-500" />
                Refill Wallet
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white"
                style={{ background: 'none' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Select Plan</p>
                <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">System Ready</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { coins: 100, price: "$0.99", icon: "💎" },
                  { coins: 500, price: "$4.99", icon: "🔥" },
                  { coins: 2000, price: "$18.99", icon: "👑" },
                ].map((plan) => (
                  <button
                    key={plan.coins}
                    onClick={() => buyCoins(plan.coins)}
                    className="flex justify-between items-center bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all active:scale-95 text-left"
                    style={{ background: '#1c1c1e' }}
                  >
                    <div className="flex items-center gap-3 font-sans">
                      <span className="text-2xl">{plan.icon}</span>
                      <div>
                        <div className="font-bold text-white tracking-tight">{plan.coins} Coins</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-medium">One-time refill</div>
                      </div>
                    </div>
                    <div className="bg-pink-500/10 text-pink-500 font-bold px-3 py-1 rounded-full text-xs">
                      {plan.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-black/20 text-[10px] text-zinc-600 text-center font-medium">
              Payments are in test mode. No real money will be charged.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Coins;
