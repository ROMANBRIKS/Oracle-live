import React, { useEffect, useRef, useState } from "react";
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { client, APP_ID } from "../services/agora";
// Use any or a custom type if IRemoteUser is not exported as named
type IRemoteUser = any; 
import { socket } from "../lib/socket";
import { Send, Gift, MessageCircle, Video, Coins as CoinsIcon, PhoneOff, Share2, Swords } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

import LiveCard from "../components/LiveCard";
import HLSPlayer from "../components/HLSPlayer";
import LiveChat from "../components/LiveChat";
import GiftOverlay from "../components/GiftOverlay";
import ViewerCounter from "../components/ViewerCounter";
import PKScoreBar from "../components/PKScoreBar";

interface LiveProps {
  userId: string; // The host of the room
}

interface GiftEvent {
  user: string;
  giftType: string;
}

const giftIcons: Record<string, string> = {
  rose: "🌹",
  lion: "🦁",
  car: "🚗",
};

const Live: React.FC<LiveProps> = ({ userId: hostId }) => {
  const roomId = `room_${hostId}`;
  const currentUser = React.useMemo(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  const isHost = currentUser?.username === hostId;

  const [joined, setJoined] = useState(false);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const [localTracks, setLocalTracks] = useState<{ video: ICameraVideoTrack | null, audio: IMicrophoneAudioTrack | null }>({ video: null, audio: null });
  const [remoteUsers, setRemoteUsers] = useState<IRemoteUser[]>([]);

  const [message, setMessage] = useState("");
  const [showGifts, setShowGifts] = useState(false);
  const [pkBattle, setPkBattle] = useState<any>(null);
  const [pkWinner, setPkWinner] = useState<string | null>(null);

  useEffect(() => {
    // ONLY join RTC if we are the host
    if (currentUser?.username === hostId) {
      initAgora();
    }

    socket.emit("join-room", roomId);

    const handlePKUpdate = (data: any) => {
        // Handle both raw DB object and socket payload
        const normalized = {
            active: true,
            score1: data.score_a ?? data.scoreA ?? 0,
            score2: data.score_b ?? data.scoreB ?? 0,
            host1: data.host_a ?? data.hostA ?? "Host A",
            host2: data.host_b ?? data.hostB ?? "Host B",
            timeLeft: data.time_left ?? data.timeLeft ?? 300
        };
        setPkBattle(normalized);
    };

    const handlePKEnd = (result: any) => {
        setPkWinner(result.winner);
        setPkBattle(null);
        setTimeout(() => setPkWinner(null), 5000);
    };

    socket.on("pk_update", handlePKUpdate);
    socket.on("pk_end", handlePKEnd);

    return () => {
      leaveChannel();
      socket.off("pk_update", handlePKUpdate);
      socket.off("pk_end", handlePKEnd);
    };
  }, [hostId]);

  const initAgora = async () => {
    // Remove previous listeners just in case
    client.removeAllListeners();

    // Host side Agora setup
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video") {
        setRemoteUsers((prev) => {
           if (prev.find(u => u.uid === user.uid)) return prev;
           return [...prev, user];
        });
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    });

    client.on("user-unpublished", (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });
  };

  const joinStream = async (role: "host" | "audience") => {
    try {
      if (joined) return;

      client.setClientRole(role);
      
      const channelName = `room_${hostId}`;
      const uid = Math.floor(Math.random() * 10000);
      
      const { data } = await axios.post("/api/agora/token", {
        channelName,
        uid,
        role: role === "host" ? "host" : "audience"
      });

      if (data.isDemo) {
         console.warn("Agora is in DEMO MODE. Ensure AGORA_APP_ID and AGORA_APP_CERT are set in .env");
      }

      const appIdToUse = APP_ID || "MOCK_APP_ID";
      await client.join(appIdToUse, channelName, data.token, uid);

      if (role === "host") {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalTracks({ video: videoTrack, audio: audioTrack });
        await client.publish([videoTrack, audioTrack]);
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
      }
      setJoined(true);
    } catch (e) {
      console.error("Agora Join Error", e);
    }
  };

  const leaveChannel = async () => {
    try {
      if (localTracks.video) localTracks.video.close();
      if (localTracks.audio) localTracks.audio.close();
      if (client) {
        await client.leave();
      }
    } catch (e) {
      console.error("Error leaving channel", e);
    } finally {
      if (joined) setJoined(false);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "" && currentUser) {
      socket.emit("send-message", {
        message: message,
        username: currentUser.username,
        roomId: roomId
      });
      setMessage("");
    }
  };

  const startPK = async () => {
      try {
          await axios.post("/api/pk/start", {
              host1: hostId,
              host2: "Rival_Master", // In real app, this would be the invited guest
              roomId
          });
      } catch (err) {
          console.error("Failed to start PK", err);
      }
  };

  const sendGift = async (giftType: string) => {
    if (!currentUser) return;
    
    // Map gift types to IDs from the backend seeder
    const giftIdMap: Record<string, string> = {
      'rose': 'g1',
      'lion': 'g2',
      'car': 'g4' // Hypercar in UI, mapped to Rocket/Car in logic
    };

    try {
        await axios.post("/api/gifts/send", {
            senderId: currentUser.id,
            receiverId: hostId,
            roomId: roomId,
            giftId: giftIdMap[giftType] || 'g1',
            quantity: 1,
            battleId: pkBattle?.id // If in a PK battle, the ID will allow score updates
        });
        socket.emit("gift-sent", {
            giftType,
            username: currentUser.username,
            receiver: hostId,
            roomId
        });
        setShowGifts(false);
    } catch (err) {
        console.error("Failed to send gift", err);
    }
  };

  const handleShare = async () => {
    if (!currentUser) return;
    const shareUrl = `${window.location.origin}?ref=${currentUser.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join @${hostId} on Oracle Live!`,
          text: `Watch high-stakes streaming on the elite network.`,
          url: shareUrl,
        });
        // Points awarded via backend later when someone joins
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert("Elite Share Link Copied! Send this to high-value contacts.");
    }
  };

  return (
    <div className="relative w-full h-full bg-crystal-void overflow-hidden select-none font-sans">
      {/* 🎥 VIDEO GRID / PLAYER */}
      <div className="absolute inset-0 bg-transparent z-0 grid grid-cols-2 grid-rows-2 gap-1 p-0.5">
        {/* PRIMARY PLAYER (RTC for Host, HLS for Audience) */}
        <div className="relative bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl col-span-2 row-span-2">
          {((currentUser?.username === hostId) || isHost) ? (
            <div ref={localVideoRef} className="w-full h-full object-cover"></div>
          ) : (
            <HLSPlayer streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
          )}
          <div className="absolute bottom-6 left-6 liquid-glass px-6 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
            <span className="text-[10px] font-black text-white italic uppercase tracking-[0.2em] drop-shadow-md">{hostId} (MASTER_FEED)</span>
          </div>
        </div>

        {/* GUESTS / REMOTE USERS */}
        {((currentUser?.username === hostId) || isHost) && remoteUsers.length > 0 && (
            <div className="absolute top-28 right-8 w-40 flex flex-col gap-4 z-20">
                {remoteUsers.map((user, i) => (
                    <div key={i} className="aspect-square bg-black/40 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                        <RemotePlayer user={user} />
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* VIGNETTE OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-10" />

      {/* 👑 OVERLAYS */}
      <div className="absolute top-10 left-8 right-8 flex justify-between items-start z-50 pointer-events-none">
           <div className="flex flex-col gap-4">
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-4 liquid-glass p-2 pr-6 rounded-[3rem] border border-white/10 pointer-events-auto cursor-pointer group shadow-2xl"
                >
                    <div className="relative">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${hostId}`} 
                          className="w-12 h-12 rounded-[1.5rem] border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] bg-black" 
                          alt="host"
                          loading="lazy"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-lg border-2 border-black flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-white italic tracking-tighter uppercase group-hover:text-cyan-400 transition-colors">@{hostId}</span>
                        <div className="mt-0.5">
                            <ViewerCounter roomId={roomId} />
                        </div>
                    </div>
                    <button className="ml-6 bg-cyan-400 text-black text-[10px] font-black px-6 py-2.5 rounded-2xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 italic shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                        FOLLOW
                    </button>
                </motion.div>
           </div>
           
           <div className="flex flex-col items-end gap-3">
                <div className="bg-rose-600 px-6 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.5)] flex items-center gap-3 border border-white/20">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                    <span className="text-[10px] font-black text-white italic tracking-[0.3em] uppercase">LINK_ACTIVE</span>
                </div>
                <div className="liquid-glass px-4 py-1.5 rounded-xl border border-white/5 text-[9px] font-black text-white/30 tracking-[0.4em] italic uppercase">
                    SYS_ID: {Math.floor(Math.random() * 900000) + 100000}
                </div>
           </div>
      </div>

      {/* REAL-TIME OVERLAYS */}
      <GiftOverlay roomId={roomId} />

      {/* PK BATTLE BAR */}
      <AnimatePresence>
          {pkBattle?.active && (
              <div className="absolute top-36 left-8 right-8 z-40 pointer-events-none">
                  <PKScoreBar 
                    score1={pkBattle.score1} 
                    score2={pkBattle.score2} 
                    host1={pkBattle.host1} 
                    host2={pkBattle.host2} 
                    timeLeft={pkBattle.timeLeft} 
                  />
              </div>
          )}
      </AnimatePresence>

      <AnimatePresence>
          {pkWinner && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-[70] pointer-events-none"
              >
                  <div className="crystal-glass p-16 rounded-[4rem] border-cyan-400 shadow-[0_0_150px_rgba(34,211,238,0.6)] flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-cyan-400 rounded-[2rem] flex items-center justify-center shadow-2xl">
                          <Swords size={40} className="text-black" />
                      </div>
                      <div className="text-center">
                        <h2 className="text-5xl font-black italic uppercase tracking-[0.1em] text-cyan-400">VICTORY</h2>
                        <p className="text-2xl font-black uppercase tracking-[0.3em] text-white mt-2">@{pkWinner}</p>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* CHAT FEED */}
      <div className="absolute bottom-36 left-8 right-8 h-[35vh] z-30 pointer-events-none">
          <div className="w-full max-w-[320px] h-full pointer-events-auto">
              <LiveChat roomId={roomId} isHost={isHost} />
          </div>
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-10 left-8 right-8 z-50 flex items-center gap-5 pointer-events-none">
          {isHost && !joined ? (
            <button 
              onClick={() => joinStream("host")}
              className="flex-1 bg-cyan-400 hover:bg-cyan-300 py-5 rounded-3xl text-black font-black uppercase italic tracking-[0.2em] shadow-[0_0_40px_rgba(34,211,238,0.6)] pointer-events-auto transition-all animate-pulse"
            >
              LAUNCH NEURAL BROADCAST
            </button>
          ) : isHost && !pkBattle?.active ? (
            <button 
                onClick={startPK}
                className="w-16 h-16 crystal-button bg-rose-600 border-none transition-all pointer-events-auto flex items-center justify-center text-white hover:bg-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)]"
            >
                <Swords size={28} />
            </button>
          ) : null}

          {(!isHost || joined) && (
            <div className="flex-1 relative group pointer-events-auto">
                  <div className="absolute inset-0 liquid-glass rounded-[2rem] border border-white/10 group-focus-within:border-cyan-400/50 transition-all shadow-2xl backdrop-blur-3xl" />
                  <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="SYNCHRONIZE THOUGHTS..."
                      className="w-full bg-transparent relative z-10 py-6 px-8 text-sm text-white font-black placeholder:text-white/20 focus:outline-none italic uppercase tracking-widest"
                  />
                  <button 
                      onClick={sendMessage}
                      className="absolute right-3 top-3 bottom-3 bg-cyan-400 hover:bg-cyan-300 px-8 rounded-2xl text-black shadow-lg transition-all active:scale-95 flex items-center justify-center z-20 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                  >
                      <Send size={20} className="fill-current" />
                  </button>
            </div>
          )}

          <button 
                onClick={() => setShowGifts(!showGifts)}
                className={`w-16 h-16 crystal-button transition-all pointer-events-auto flex items-center justify-center shadow-2xl ${showGifts ? 'bg-cyan-400 text-black shadow-[0_0_40px_rgba(34,211,238,0.6)] scale-110 border-none' : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
          >
                <Gift size={28} />
          </button>

          <button 
                onClick={handleShare}
                className="w-16 h-16 crystal-button border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all pointer-events-auto flex items-center justify-center shadow-2xl"
          >
                <Share2 size={28} />
          </button>

          <button 
                onClick={leaveChannel}
                className="w-16 h-16 crystal-button border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all pointer-events-auto flex items-center justify-center shadow-2xl"
          >
                <PhoneOff size={28} />
          </button>
      </div>

      {/* GIFT TRAY */}
      <AnimatePresence>
        {showGifts && (
          <div className="absolute inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowGifts(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative liquid-glass border-t border-white/10 p-10 rounded-t-[4rem] shadow-[0_-40px_100px_rgba(0,0,0,0.9)] max-h-[75vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-cyan-400 italic tracking-[0.5em] uppercase">SYSTEM_TRIBUTES</span>
                    <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter mt-1">Refuel the Oracle</h4>
                </div>
                <div className="flex items-center gap-4 crystal-pill px-8 py-3.5 border-white/10 shadow-[0_0_30px_rgba(234,179,8,0.15)] bg-yellow-500/5">
                   <CoinsIcon size={22} className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                   <span className="text-2xl font-black text-yellow-500 italic tracking-tighter">{currentUser?.coins || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                {[
                  { type: 'rose', icon: '🌹', cost: 10, label: 'Crystal Rose' },
                  { type: 'lion', icon: '🦁', cost: 500, label: 'Neon Lion' },
                  { type: 'car', icon: '🚗', cost: 1000, label: 'Hypercar' }
                ].map(gift => (
                  <button 
                    key={gift.type}
                    onClick={() => sendGift(gift.type)}
                    className="flex flex-col items-center gap-6 p-6 py-12 bg-white/5 hover:bg-cyan-400 text-white hover:text-black rounded-[3.5rem] border border-white/5 hover:border-none transition-all duration-500 active:scale-95 group relative overflow-hidden shadow-2xl"
                  >
                    <span className="text-7xl transform group-hover:scale-125 transition-transform duration-700 filter group-hover:brightness-150 drop-shadow-2xl z-10">{gift.icon}</span>
                    <div className="text-center space-y-2 relative z-10">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] italic opacity-60 group-hover:opacity-100">{gift.label}</p>
                      <div className="flex items-center gap-2 justify-center">
                        <CoinsIcon size={14} className="group-hover:text-black transition-colors" />
                        <span className="text-[16px] font-black italic tracking-tighter">{gift.cost}</span>
                      </div>
                    </div>
                    {/* Background Glow on Hover */}
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-cyan-400 transition-all duration-500 -z-0" />
                  </button>
                ))}
              </div>
              <div className="mt-12 p-6 bg-white/[0.03] rounded-3xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Transaction Protocol: SECURE_ENCRYPTION_V4</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RemotePlayer: React.FC<{ user: IRemoteUser }> = React.memo(({ user }) => {
  const vidRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (user.videoTrack && vidRef.current) {
      user.videoTrack.play(vidRef.current);
    }
  }, [user]);
  return <div ref={vidRef} className="w-full h-full object-cover"></div>;
});

export default Live;
