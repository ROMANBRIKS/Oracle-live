import { useEffect, useState } from "react";
import socket from "../socket/socket";
import { motion, AnimatePresence } from "motion/react";
import { Users, Mic, MicOff, Lock, Unlock, LogOut, ChevronRight, MessageSquare, Heart, Shield, Video, ChevronLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import GuestRequestPanel from "../components/GuestRequestPanel";

export default function MultiGuestRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`/api/multi-guest/${roomId || "sample-room"}`);
        setRoom(res.data);
      } catch (err) {
        console.error("Failed to fetch room:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

    socket.on("seat-updated", (payload: any) => {
      if (payload.roomId === roomId || (!roomId && payload.roomId === "sample-room")) {
        // Fetch room again to be sure we have latest state
        fetchRoom();
      }
    });

    socket.on("new-guest-request", (request: any) => {
      setRequests(prev => [...prev, request]);
    });

    return () => {
      socket.off("seat-updated");
      socket.off("new-guest-request");
    };
  }, [roomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-400 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Synchronizing Engine...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-10 text-center bg-black min-h-screen text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-black uppercase italic mb-4">Room Not Found</h2>
        <button onClick={() => navigate("/")} className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase italic tracking-widest">Go Home</button>
      </div>
    );
  }

  const handleJoinSeat = async (seatNumber: number) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    try {
      const res = await axios.post("/api/multi-guest/join-seat", {
        roomId: room.room_id,
        seatNumber,
        userId: user.id
      });
      if (res.data.success) {
        setRoom(res.data.room);
        socket.emit("seat-update", { roomId: room.room_id });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Join seat failed");
    }
  };

  const handleLeaveSeat = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    try {
      const res = await axios.post("/api/multi-guest/leave-seat", {
        roomId: room.room_id,
        userId: user.id
      });
      if (res.data.success) {
        setRoom(res.data.room);
        socket.emit("seat-update", { roomId: room.room_id });
      }
    } catch (err: any) {
      console.error("Leave seat failed:", err);
    }
  };

  const isUserOnStage = room.seats.some((s: any) => s.user_id === JSON.parse(localStorage.getItem("user") || "{}").id);

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 md:p-10 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  MULTI-LIVE ARENA
                </span>
                <div className="flex items-center gap-1.5 text-white/40 text-xs font-bold uppercase tracking-tighter">
                  <Users size={12} />
                  <span>{Math.floor(Math.random() * 5000).toLocaleString()} watching</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                {room.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isUserOnStage && (
              <button 
                onClick={handleLeaveSeat}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl text-sm font-black italic tracking-widest text-red-400 transition-all"
              >
                LEAVE STAGE
              </button>
            )}
            <button 
              onClick={() => setShowRequests(!showRequests)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2"
            >
              <MessageSquare size={18} />
              Requests
              {requests.length > 0 && (
                <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center animate-pulse">
                  {requests.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate("/")}
              className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-2xl text-sm font-black italic tracking-widest flex items-center gap-2 transition-all"
            >
              <LogOut size={18} />
              EXIT
            </button>
          </div>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {room.seats.map((seat: any) => (
                <motion.div
                  key={seat.seat_number}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !seat.user_id && !seat.locked && handleJoinSeat(seat.seat_number)}
                  className={`aspect-square rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden group cursor-pointer ${
                    seat.user_id 
                      ? 'bg-zinc-900 border-indigo-500/50' 
                      : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                  } ${seat.locked ? 'opacity-50 grayscale' : ''}`}
                >
                  <div className="absolute top-4 right-4 text-white/20 group-hover:text-white/40 transition-colors">
                    {seat.locked ? <Lock size={16} /> : <Unlock size={16} />}
                  </div>

                  <div className="absolute bottom-4 left-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
                    #{seat.seat_number}
                  </div>

                  {seat.user_id ? (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seat.user_id}`} 
                          className="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-indigo-500 relative z-10"
                          alt="Guest"
                        />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-900 rounded-full border-2 border-indigo-500 flex items-center justify-center z-20">
                          {seat.mic_muted ? <MicOff size={14} className="text-red-500" /> : <Mic size={14} className="text-green-500" />}
                        </div>
                      </div>
                      <div className="text-center z-10">
                        <p className="text-sm font-black uppercase tracking-widest italic">{seat.user_id.substring(0, 8)}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Heart size={10} className="text-pink-500 fill-pink-500" />
                          <span className="text-[10px] font-bold text-white/50 underline">LVL {Math.floor(Math.random() * 50) + 1}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                        <Mic size={24} className="text-white/20 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors">
                        {seat.locked ? 'Locked' : 'Join Slot'}
                      </p>
                    </div>
                  )}

                  {!seat.mic_muted && seat.user_id && (
                     <div className="absolute inset-0 border-2 border-indigo-500 rounded-[2.5rem] animate-ping opacity-20 pointer-events-none" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <aside className="flex flex-col gap-6">
            <AnimatePresence>
              {showRequests && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <GuestRequestPanel 
                    requests={requests}
                    onAccept={(req) => {
                      setRequests(prev => prev.filter(r => r.userId !== req.userId));
                    }}
                    onReject={(req) => {
                      setRequests(prev => prev.filter(r => r.userId !== req.userId));
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-lg font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2">
                <ChevronRight size={20} className="text-indigo-500" />
                Stage Controls
              </h3>
              <div className="space-y-4">
                <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-left flex items-center justify-between group transition-all">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white">Mute All Guests</span>
                  <MicOff size={16} className="text-white/20" />
                </button>
                <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-left flex items-center justify-between group transition-all">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white">Lock Free Seats</span>
                  <Lock size={16} className="text-white/20" />
                </button>
                <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-left flex items-center justify-between group transition-all">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white">Switch to 6 Seats</span>
                  <Users size={16} className="text-white/20" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Video className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight mb-2">Architect Info</h3>
                  <p className="text-xs text-white/60 font-medium leading-relaxed">
                    Multiguest architecture v2.4 supports up to {room.max_guests} participants with synchronized seat management.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

