import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import GlassCard from "../components/ui/GlassCard";
import FloatingGift from "../components/FloatingGift";
import GiftCombo from "../components/GiftCombo";
import { Heart, Send, User, Users, Share2, Flame, Gift, MessageCircle, ArrowLeft, Eye } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  color: string;
  isGift?: boolean;
}

interface ActiveGift {
  id: string;
  icon: string;
  amount: number;
}

export default function TikTokLiveRoom() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", user: "GamerPro", text: "Yo, this setup looks unreal! 🚀", color: "text-amber-400" },
    { id: "2", user: "AuraHunter", text: "What song is this playing? 😍", color: "text-cyan-400" },
    { id: "3", user: "CryptoWhale", text: "sent a Rose!", color: "text-[#ff0050]", isGift: true },
  ]);
  const [inputText, setInputText] = useState("");
  const [isFollowed, setIsFollowed] = useState(false);
  const [viewerCount, setViewerCount] = useState(1240);
  const [likeCount, setLikeCount] = useState(8740);
  const [activeGifts, setActiveGifts] = useState<ActiveGift[]>([]);
  const [comboCount, setComboCount] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulated live chat feed addition
  useEffect(() => {
    const userNames = ["HyperVibes", "Sophia77", "NeonDreamer", "CyberGamer", "AliceInWonder", "TokyoDrift"];
    const textOptions = [
      "Amazing stream!! 🔥🔥🔥",
      "Let's goooo! Ready for the next track",
      "Best performance this evening 🎙️✨",
      "How long is this stream going?",
      "Sending positive energy!",
      "I absolutely love this, keep it up Queen!",
    ];
    const colors = ["text-pink-400", "text-emerald-400", "text-sky-400", "text-yellow-400", "text-purple-400"];

    const interval = setInterval(() => {
      const u = userNames[Math.floor(Math.random() * userNames.length)];
      const t = textOptions[Math.floor(Math.random() * textOptions.length)];
      const c = colors[Math.floor(Math.random() * colors.length)];
      const newMessage = {
        id: Date.now().toString(),
        user: u,
        text: t,
        color: c,
      };

      setMessages(prev => [...prev.slice(-15), newMessage]);
      setViewerCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // auto scroll list
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      text: inputText,
      color: "text-[#00f2ea]",
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText("");
  };

  const triggerGift = (icon: string) => {
    const newId = Date.now().toString();
    const newGift = { id: newId, icon, amount: 1 };
    
    setActiveGifts(prev => [...prev, newGift]);
    
    // Increment combo
    setComboCount(prev => prev + 1);

    // Filter gift out after animation concludes
    setTimeout(() => {
      setActiveGifts(prev => prev.filter(g => g.id !== newId));
    }, 3000);

    // Append gift notification to Chat
    setMessages(prev => [...prev, {
      id: Date.now().toString() + "-gift",
      user: "You",
      text: `sent a premium Gift ${icon}!`,
      color: "text-[#ff0050]",
      isGift: true
    }]);

    setLikeCount(prev => prev + 100);
  };

  const handleLike = () => {
    setLikeCount(prev => prev + 1);
    // Flash background element on screen briefly
    const newId = Date.now().toString() + "-like";
    // Also trigger tiny reaction
    setActiveGifts(prev => [...prev, { id: newId, icon: "❤️", amount: 1 }]);
    setTimeout(() => {
      setActiveGifts(prev => prev.filter(g => g.id !== newId));
    }, 1500);
  };

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative select-none">
      {/* BACKGROUND SIMULATED STREAM DISPLAY */}
      <img 
        src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80"
        alt="Simulated Livestream background"
        className="absolute inset-0 w-full h-full object-cover opacity-80 filter saturate-150"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-blackvia-black/20 to-black/30 pointer-events-none" />

      {/* TOP META BAR (TikTok Layout) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
        {/* Creator Identity Glass */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 p-2 pr-4">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase italic tracking-tight text-white line-clamp-1">Aura Queen</span>
            <span className="text-[8px] text-white/60 font-mono tracking-widest uppercase">Live in UK</span>
          </div>
          <button 
            onClick={() => setIsFollowed(!isFollowed)}
            className={`ml-2 text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all ${
              isFollowed 
                ? "bg-white/10 text-white/70" 
                : "bg-[#ff0050] text-white hover:bg-rose-600"
            }`}
          >
            {isFollowed ? "Following" : "Follow"}
          </button>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono">
            <Eye size={12} className="text-[#00f2ea]" />
            <span className="font-bold text-white">{viewerCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#ff0050] px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono font-black italic">
            <Flame size={12} className="fill-white" />
            <span>LV.55</span>
          </div>
        </div>
      </div>

      {/* FLOATING SPARKING GIFTS ANIME CONTAINER */}
      <AnimatePresence>
        {activeGifts.map(gift => (
          <FloatingGift key={gift.id} gift={gift} />
        ))}
      </AnimatePresence>

      {/* GIFT COMBO FLOATING ALIGNER */}
      <div className="absolute top-24 left-4 z-40">
        <AnimatePresence>
          {comboCount > 1 && (
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-2"
            >
              <GiftCombo combo={comboCount} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SIDE CONTROL PALETTE (Tango/Heart triggers) */}
      <div className="absolute right-4 bottom-28 flex flex-col gap-4 z-30">
        {/* Like Heart Ring counter */}
        <div className="flex flex-col items-center">
          <button 
            onClick={handleLike}
            className="w-12 h-12 bg-black/40 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-[#ff0050] active:scale-95 transition-all shadow-xl hover:bg-black/60 hover:border-[#ff0050]"
          >
            <Heart size={20} className="fill-[#ff0050]" />
          </button>
          <span className="text-[9px] font-mono font-black uppercase text-white/50 tracking-wider mt-1">{likeCount.toLocaleString()}</span>
        </div>

        {/* Fast Gifting Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => triggerGift("🌹")}
            className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform text-2xl"
            title="Send Rose"
          >
            🌹
          </button>
          
          <button 
            onClick={() => triggerGift("💎")}
            className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform text-2xl"
            title="Send Diamond"
          >
            💎
          </button>

          <button 
            onClick={() => triggerGift("🛸")}
            className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform text-2xl"
            title="Send UFO"
          >
            🛸
          </button>
        </div>
      </div>

      {/* LOWER LIVE CHAT LOGGER (Glassmorphism layout) */}
      <div className="absolute bottom-24 left-4 right-18 max-h-[30%] min-w-[280px] md:max-w-md overflow-hidden z-20">
        <GlassCard className="p-4 flex flex-col max-h-[180px] overflow-y-auto no-scrollbar bg-black/35 border-white/5">
          <div className="flex flex-col gap-1.5 text-xs">
            {messages.map(msg => (
              <div key={msg.id} className="flex items-start gap-1 pb-1 border-b border-white/[0.02] last:border-none">
                <span className={`font-black italic uppercase ${msg.isGift ? "text-[#ff0050]" : "text-white/40"} mr-1`}>
                  @{msg.user}:
                </span>
                <span className={msg.isGift ? "font-bold text-[#00f2ea]" : "text-white/80"}>
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </GlassCard>
      </div>

      {/* CHAT INPUT BAR + FLOATING ACTIONS */}
      <div className="absolute bottom-4 left-4 right-4 z-35 flex items-center gap-3">
        {/* Chat input glass */}
        <form onSubmit={handleSendText} className="flex-1">
          <GlassCard className="flex items-center gap-2 px-4 py-3 bg-black/40 border-white/15 rounded-full overflow-hidden">
            <input 
              type="text"
              placeholder="Say something nice..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs text-white placeholder-white/30 focus:outline-none placeholder:italic"
            />
            <button 
              type="submit"
              className="p-1 text-white hover:text-[#00f2ea] transition-colors"
            >
              <Send size={14} />
            </button>
          </GlassCard>
        </form>

        {/* Global overlay share */}
        <button className="w-11 h-11 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all text-white/70">
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
}
