import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import PkBattleOverlay from "../components/PkBattleOverlay";
import { io } from "socket.io-client";
import { 
  ArrowLeft, Sword, ShieldAlert, Users, 
  MessageCircle, Gift, Share2, MoreVertical,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LuxuryGiftPanel from "../components/LuxuryGiftPanel";
import GiftAnimation from "../components/GiftAnimation";

const socket = io();

const PkBattleRoom: React.FC = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGiftPanelOpen, setIsGiftPanelOpen] = useState(false);
  const [activeGiftEvent, setActiveGiftEvent] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchBattle = async () => {
    try {
      const res = await axios.get(`/api/pk/status/${battleId}`);
      setBattle(res.data);
      if (res.data.started_at) {
        const start = new Date(res.data.started_at).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        setTimeLeft(Math.max(0, res.data.duration - elapsed));
      }
    } catch (err) {
      console.error("Failed to fetch battle:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBattle();

    socket.on("pk_update", (updatedBattle) => {
      if (updatedBattle.id === battleId) {
        setBattle(updatedBattle);
      }
    });

    socket.on("receive_gift", (event) => {
        setActiveGiftEvent({ ...event, id: Date.now().toString() });
    });

    socket.on("pk_end", (finalBattle) => {
        if (finalBattle.id === battleId) {
            setBattle(finalBattle);
            setTimeLeft(0);
        }
    });

    return () => {
      socket.off("pk_update");
      socket.off("receive_gift");
      socket.off("pk_end");
    };
  }, [battleId]);

  useEffect(() => {
    if (timeLeft > 0 && battle?.status === 'live') {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, battle?.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
       <div className="w-24 h-24 border-4 border-t-pink-500 border-zinc-800 rounded-full animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Engaging PK Sockets...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
       {/* Background PK Effects */}
       <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-pink-500/20 to-transparent" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/20 to-transparent" />
       </div>

       {/* Top Controls */}
       <div className="p-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate("/")} className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <ArrowLeft size={24} />
             </button>
             <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <Timer size={16} className="text-pink-500" />
                   <span className="text-xl font-black italic tracking-tighter tabular-nums">{formatTime(timeLeft)}</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-2">
                   <Users size={16} className="text-white/40" />
                   <span className="text-sm font-bold italic tracking-tighter">1.4K</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="w-12 h-12 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <Share2 size={20} />
             </button>
             <button className="w-12 h-12 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <MoreVertical size={20} />
             </button>
          </div>
       </div>

       {/* Main Battle Arena */}
       <div className="flex-1 px-4 pb-8 flex flex-col relative z-0">
          <div className="mb-4">
             <PkBattleOverlay 
                battle={battle} 
                hostAName="Legendary_A"
                hostBName="Champion_B"
             />
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 relative">
             {/* Host A Container */}
             <div className="relative rounded-[3rem] overflow-hidden border-4 border-pink-500/30 group">
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                   <Sword className="text-white/5 animate-pulse" size={150} />
                </div>
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                   <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-pink-500/20 ring-2 ring-pink-500/50" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-black" />
                   </div>
                   <span className="text-sm font-black italic uppercase tracking-tighter drop-shadow-lg">Legendary_A</span>
                </div>
                {battle.status === 'ended' && battle.winner === battle.host_a && (
                    <div className="absolute inset-0 bg-pink-500/20 backdrop-blur-sm flex items-center justify-center z-10">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl font-black italic uppercase tracking-tighter text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] bg-black/80 px-8 py-4 rounded-3xl border-2 border-pink-500">
                             WINNER
                        </motion.div>
                    </div>
                )}
             </div>

             {/* Host B Container */}
             <div className="relative rounded-[3rem] overflow-hidden border-4 border-cyan-500/30 group">
                <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center">
                   <Sword className="text-white/5 animate-pulse rotate-180" size={150} />
                </div>
                <div className="absolute bottom-6 right-6 flex flex-row-reverse items-center gap-3">
                   <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 ring-2 ring-cyan-500/50" />
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-cyan-500 rounded-full border-2 border-black" />
                   </div>
                   <span className="text-sm font-black italic uppercase tracking-tighter drop-shadow-lg">Champion_B</span>
                </div>
                {battle.status === 'ended' && battle.winner === battle.host_b && (
                    <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center z-10">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl font-black italic uppercase tracking-tighter text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-black/80 px-8 py-4 rounded-3xl border-2 border-cyan-400">
                             WINNER
                        </motion.div>
                    </div>
                )}
             </div>

             {/* Center VS Visual */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="w-24 h-24 rounded-full bg-black border-4 border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                   <span className="text-4xl font-black italic tracking-tighter animate-bounce">VS</span>
                </div>
             </div>
          </div>
       </div>

       {/* Bottom Interaction Area */}
       <div className="p-8 pb-12 flex items-center gap-6 relative z-10 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="flex-1 h-16 rounded-3xl bg-white/5 border border-white/10 px-6 flex items-center gap-4 group hover:bg-white/10 transition-all cursor-text">
             <MessageCircle size={20} className="text-white/30 group-hover:text-cyan-500 transition-colors" />
             <input 
                type="text" 
                placeholder="SEND SOME ENERGY..." 
                className="bg-transparent border-none outline-none text-xs font-bold w-full uppercase tracking-widest placeholder:text-white/10"
             />
          </div>
          
          <button 
             onClick={() => setIsGiftPanelOpen(true)}
             className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-500/20 hover:scale-110 active:scale-95 transition-all"
          >
             <Gift size={28} />
          </button>
       </div>

       {/* Floating Components */}
       <LuxuryGiftPanel 
          isOpen={isGiftPanelOpen} 
          onClose={() => setIsGiftPanelOpen(false)} 
          receiverId={battle?.host_a} // For now support host a
          roomId={battle?.room_id}
          battleId={battle?.id}
       />
       
       <GiftAnimation event={activeGiftEvent} />

       {battle?.status === 'ended' && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center px-12 text-center">
             <Trophy rank={1} />
             <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Battle Concluded</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic mb-12">Oracle Justice Has Been Served</p>
             
             <div className="flex gap-4 w-full max-w-sm">
                <button 
                   onClick={() => navigate("/")}
                   className="flex-1 py-5 rounded-3xl bg-white text-black text-[10px] font-black uppercase tracking-widest"
                >
                   Exit Arena
                </button>
                <button 
                   className="flex-1 py-5 rounded-3xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20"
                >
                   View Stats
                </button>
             </div>
          </div>
       )}
    </div>
  );
};

const Trophy = ({ rank }: { rank: number }) => (
    <div className="relative mb-8">
        <div className="w-32 h-32 bg-amber-400 rounded-full flex items-center justify-center text-black">
            <Sword size={60} />
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-black border-2 border-amber-400 rounded-xl flex items-center justify-center text-amber-400 font-black italic text-xl">
            #{rank}
        </div>
    </div>
);

export default PkBattleRoom;
