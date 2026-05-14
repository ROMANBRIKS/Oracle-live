import { useEffect, useState } from "react";
import socket from "../socket/socket";
import { motion, AnimatePresence } from "motion/react";
import { Timer, Swords, Trophy } from "lucide-react";
import PkPunishmentModal from "../components/PkPunishmentModal";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PkBattleRoom() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState<any>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [winner, setWinner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const res = await axios.get(`/api/pk/status/${battleId}`);
        const battleData = res.data;
        setBattle(battleData);
        setScoreA(battleData.score_a);
        setScoreB(battleData.score_b);
        
        if (battleData.started_at) {
          const start = new Date(battleData.started_at).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - start) / 1000);
          setTimeLeft(Math.max(0, battleData.duration - elapsed));
        }
        
        if (battleData.status === 'ended') {
          setWinner(battleData.winner);
        }
      } catch (err) {
        console.error("Failed to fetch battle:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();

    socket.on("pk-live-update", (payload: any) => {
      if (payload.battleId === battleId || payload.roomId) { // payload.roomId is fallback
        setScoreA(payload.scoreA);
        setScoreB(payload.scoreB);
      }
    });

    socket.on("pk_update", (payload: any) => {
      if (payload.id === battleId) {
        setScoreA(payload.score_a);
        setScoreB(payload.score_b);
      }
    });

    socket.on("pk_end", (payload: any) => {
      if (payload.id === battleId) {
        setWinner(payload.winner);
        setTimeLeft(0);
      }
    });

    return () => {
      socket.off("pk-live-update");
      socket.off("pk_update");
      socket.off("pk_end");
    };
  }, [battleId]);

  useEffect(() => {
    if (timeLeft > 0 && !winner) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, winner]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const total = scoreA + scoreB || 1;
  const percentA = (scoreA / total) * 100;
  const percentB = (scoreB / total) * 100;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[200px] rounded-full -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[200px] rounded-full translate-y-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-4 mb-20"
        >
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-xl">
            <Timer size={16} className="text-red-500" />
            <span className="text-xl font-black font-mono italic tracking-tight uppercase">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5em] italic">LIVE DUEL ENGINE</h2>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter flex items-center gap-4">
              <span className="text-blue-500">PK</span>
              <Swords className="text-white/20" size={48} />
              <span className="text-pink-500">BATTLE</span>
            </h1>
          </div>
        </motion.div>

        {/* Score Bar */}
        <div className="w-full h-12 bg-zinc-900 rounded-3xl border-2 border-white/5 overflow-hidden flex shadow-2xl relative mb-16">
          <motion.div 
            animate={{ width: `${percentA}%` }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          </motion.div>
          <motion.div 
            animate={{ width: `${percentB}%` }}
            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          </motion.div>
          
          {/* Divider */}
          <motion.div 
            animate={{ left: `${percentA}%` }}
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_white] z-10 -ml-0.5"
          />
        </div>

        {/* Combatants */}
        <div className="grid grid-cols-2 gap-12 w-full max-w-2xl">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/40 transition-all" />
              <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-zinc-900 border-2 border-blue-500/30 p-1">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=A" 
                  className="w-full h-full rounded-[2.8rem] object-cover"
                  alt="Host A"
                />
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl">
                  <span className="font-black italic text-xl">A</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">TEAM ORACLE</h3>
              <div className="text-5xl font-black italic tracking-tighter text-blue-500">
                {scoreA.toLocaleString()}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-pink-500/20 blur-2xl rounded-full group-hover:bg-pink-500/40 transition-all" />
              <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-zinc-900 border-2 border-pink-500/30 p-1">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=B" 
                  className="w-full h-full rounded-[2.8rem] object-cover"
                  alt="Host B"
                />
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl">
                  <span className="font-black italic text-xl">B</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">THE RIVALS</h3>
              <div className="text-5xl font-black italic tracking-tighter text-pink-500">
                {scoreB.toLocaleString()}
              </div>
            </div>
          </motion.div>
        </div>

        <button 
          onClick={() => navigate("/")}
          className="mt-12 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
        >
          Exit Battle Arena
        </button>
      </div>

      {/* Punishment Modal */}
      <PkPunishmentModal 
        loser={winner === "draw" || !winner || !battle ? null : (winner === battle.host_a ? battle.host_b : battle.host_a)} 
        onClose={() => setWinner(null)} 
      />

      {/* Results HUD */}
      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-yellow-500 text-black p-20 rounded-[6rem] border-[12px] border-white shadow-[0_0_200px_rgba(234,179,8,0.5)] flex flex-col items-center gap-6">
              <Trophy size={80} />
              <h2 className="text-7xl font-black italic uppercase tracking-tighter">VICTORY</h2>
              <p className="text-3xl font-black uppercase tracking-widest">
                {winner === "draw" ? "DRAW" : 
                 (scoreA > scoreB ? "TEAM A" : "TEAM B")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
