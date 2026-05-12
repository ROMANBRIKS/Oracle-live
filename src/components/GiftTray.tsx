import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { Coins, Sparkles } from "lucide-react";

interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number;
  rarity: string;
}

interface GiftTrayProps {
  receiverId: string;
  roomId: string;
  battleId?: string;
  onGiftSent?: (gift: Gift) => void;
}

const GiftTray: React.FC<GiftTrayProps> = ({ receiverId, roomId, battleId, onGiftSent }) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadGifts = async () => {
    try {
      const res = await axios.get("/api/gifts/all");
      setGifts(res.data);
    } catch (err) {
      console.error("Failed to load gifts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const sendGift = async (gift: Gift) => {
    try {
      const res = await axios.post("/api/gifts/send", {
        senderId: user.id,
        receiverId,
        roomId,
        giftId: gift.id,
        quantity: 1,
        battleId
      });

      if (res.data.success) {
        if (onGiftSent) onGiftSent(gift);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to send gift");
    }
  };

  if (loading) return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
       {[1,2,3,4].map(i => (
         <div key={i} className="min-w-[100px] h-32 bg-white/5 rounded-2xl animate-pulse" />
       ))}
    </div>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
      {gifts.map((gift) => (
        <motion.button
          key={gift.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sendGift(gift)}
          className="min-w-[110px] bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all snap-start group"
        >
          <div className="relative">
             <span className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform block">
                {gift.icon}
             </span>
             {gift.rarity === 'legendary' && (
                <Sparkles className="absolute -top-1 -right-1 text-amber-400 w-4 h-4 animate-pulse" />
             )}
          </div>
          <div className="text-center">
             <p className="text-[10px] font-black uppercase tracking-tighter truncate w-full">{gift.name}</p>
             <div className="flex items-center justify-center gap-1 text-amber-400">
                <Coins size={10} />
                <span className="text-xs font-black italic">{gift.price}</span>
             </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default GiftTray;
