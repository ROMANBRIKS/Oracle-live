import React, { useState } from "react";
import axios from "axios";
import { Coins, Globe, ArrowRight, Copy, Check, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CryptoWalletProps {
  onSuccess: () => void;
}

const CryptoWallet: React.FC<CryptoWalletProps> = ({ onSuccess }) => {
  const [currency, setCurrency] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [amount, setAmount] = useState(100);
  const [paymentInfo, setPaymentInfo] = useState<{ wallet: string; amount: number; currency: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const userId = user?.id || "";

  const handleBuyCrypto = async () => {
    try {
      const res = await axios.post("/api/crypto/buy-coins", {
        userId,
        amount,
        currency,
        network,
      });
      setPaymentInfo(res.data);
      onSuccess();
    } catch (err) {
      console.error("Crypto payment error:", err);
      alert("Failed to initiate crypto payment simulation");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="liquid-glass p-6 rounded-[2.5rem] mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-white/10 rounded-2xl">
          <Coins className="text-white w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">Crypto Deposit</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-black">Liquid Flow • Anonymous</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!paymentInfo ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3 font-sans">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Asset</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-sm font-bold focus:border-white/30 outline-none transition-colors appearance-none text-white"
                >
                  <option value="USDT">USDT</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="ETH">Ethereum</option>
                  <option value="SOL">Solana</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Network</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-sm font-bold focus:border-white/30 outline-none transition-colors appearance-none text-white"
                >
                  {currency === "USDT" && (
                    <>
                      <option value="TRC20">TRON (TRC20)</option>
                      <option value="ERC20">Ethereum (ERC20)</option>
                      <option value="BEP20">BSC (BEP20)</option>
                    </>
                  )}
                  {currency === "BTC" && <option value="Mainnet">BTC Network</option>}
                  {currency === "ETH" && <option value="ERC20">Ethereum Mainnet</option>}
                  {currency === "SOL" && <option value="Mainnet">Solana Network</option>}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Recharge Amount</label>
              <div className="flex gap-2">
                {[100, 500, 2000].map(val => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${amount === val ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'}`}
                  >
                    🪙 {val}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBuyCrypto}
              className="w-full bg-white text-black font-black py-4 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-wider mt-4"
            >
              <Globe size={18} />
              Get Deposit Address
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="payment-info"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-black/60 border border-white/10 rounded-[2rem] p-6 text-center">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Send Exactly</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <h4 className="text-4xl font-black text-white">{paymentInfo.amount / 100}</h4>
                <span className="text-white/60 font-black pt-1">{paymentInfo.currency}</span>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Address ({network})</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-mono break-all text-white/60">
                      {paymentInfo.wallet}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(paymentInfo.wallet)}
                      className="bg-white/10 border border-white/10 px-3 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-white/60" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-white/60">Awaiting Deposit...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPaymentInfo(null)}
              className="w-full liquid-button py-4 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              Cancel Payment
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CryptoWallet;
