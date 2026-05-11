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
        setPkBattle(data);
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
      
      const { data } = await axios.post("/api/agora/generate-token", {
        channelName,
        uid,
        role: role === "host" ? "publisher" : "subscriber"
      });

      if (data.token === "DEVELOPMENT_TOKEN") {
         console.warn("Using DEVELOPMENT_TOKEN for Agora. Video will only work if keys are set.");
      }

      await client.join(APP_ID || "MOCK_APP_ID", channelName, data.token, uid);

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
    try {
        await axios.post("/api/send-gift", {
            userId: currentUser.id,
            giftType,
            side: 1 // Default to host side for now
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
    <div className="relative w-full h-full bg-black overflow-hidden select-none font-sans">
      {/* 🎥 VIDEO GRID / PLAYER */}
      <div className="absolute inset-0 bg-transparent z-0 grid grid-cols-2 grid-rows-2 gap-1 p-0.5">
        {/* PRIMARY PLAYER (RTC for Host, HLS for Audience) */}
        <div className="relative bg-zinc-950 rounded-2xl overflow-hidden border border-white/5 shadow-2xl col-span-2 row-span-2">
          {((currentUser?.username === hostId) || isHost) ? (
            <div ref={localVideoRef} className="w-full h-full object-cover"></div>
          ) : (
            <HLSPlayer streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
          )}
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-white italic uppercase tracking-widest">{hostId} (Primary)</span>
          </div>
        </div>

        {/* GUESTS / REMOTE USERS (Only visible if we are in RTC mode/Host side for now) */}
        {((currentUser?.username === hostId) || isHost) && remoteUsers.length > 0 && (
            <div className="absolute top-24 right-6 w-32 flex flex-col gap-2 z-20">
                {remoteUsers.map((user, i) => (
                    <div key={i} className="aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        <RemotePlayer user={user} />
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* VIGNETTE OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-10" />

      {/* 👑 OVERLAYS (Extracted from previous polished UI) */}
      <div className="absolute top-8 left-6 right-6 flex justify-between items-start z-50 pointer-events-none">
           <div className="flex flex-col gap-3">
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 bg-black/20 backdrop-blur-3xl border border-white/10 p-1.5 pr-5 rounded-full pointer-events-auto cursor-pointer group"
                >
                    <div className="relative">
                        <img 
                          src={`https://i.pravatar.cc/100?u=${hostId}`} 
                          className="w-11 h-11 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                          alt="host"
                          loading="lazy"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white italic tracking-tight uppercase group-hover:text-cyan-400 transition-colors">@{hostId}</span>
                        <div className="mt-1">
                            <ViewerCounter roomId={roomId} />
                        </div>
                    </div>
                    <button className="ml-4 bg-cyan-400 text-black text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest transition-all hover:scale-105 active:scale-95 italic shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        FOLLOW
                    </button>
                </motion.div>
           </div>
           
           <div className="flex flex-col items-end gap-2">
                <div className="bg-rose-600 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center gap-2 border border-white/20 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span className="text-[10px] font-black text-white italic tracking-[0.2em] uppercase">LIVE</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-xl border border-white/5 text-[9px] font-black text-white/50 tracking-widest italic">
                    ID: {Math.floor(Math.random() * 900000) + 100000}
                </div>
           </div>
      </div>

      {/* REAL-TIME OVERLAYS */}
      <GiftOverlay roomId={roomId} />

      {/* PK BATTLE BAR */}
      <AnimatePresence>
          {pkBattle?.active && (
              <div className="absolute top-32 left-6 right-6 z-40 pointer-events-none">
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
                  <div className="bg-yellow-500 text-black p-10 rounded-[4rem] border-8 border-white shadow-[0_0_100px_rgba(234,179,8,0.8)] flex flex-col items-center gap-4">
                      <h2 className="text-4xl font-black italic uppercase tracking-tighter">VICTORY</h2>
                      <p className="text-2xl font-black uppercase tracking-widest">@{pkWinner}</p>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* CHAT FEED */}
      <div className="absolute bottom-32 left-6 right-6 h-[40vh] z-30 pointer-events-none">
          <div className="w-full max-w-[320px] h-full pointer-events-auto">
              <LiveChat roomId={roomId} isHost={isHost} />
          </div>
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-8 left-6 right-6 z-50 flex items-center gap-4 pointer-events-none">
          {isHost && !joined ? (
            <button 
              onClick={() => joinStream("host")}
              className="flex-1 bg-cyan-400 hover:bg-cyan-300 py-4 rounded-2xl text-black font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.5)] pointer-events-auto transition-all animate-pulse"
            >
              🎥 Launch Stream
            </button>
          ) : isHost && !pkBattle?.active ? (
            <button 
                onClick={startPK}
                className="w-16 h-16 bg-red-600 crystal-button transition-all pointer-events-auto rounded-[1.5rem] flex items-center justify-center text-white hover:bg-red-500 shadow-2xl"
            >
                <Swords size={28} />
            </button>
          ) : null}

          {(!isHost || joined) && (
            <div className="flex-1 relative group pointer-events-auto">
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 group-focus-within:border-cyan-400/50 transition-all shadow-2xl" />
                  <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Speak to the world..."
                      className="w-full bg-transparent relative z-10 py-5 px-6 text-sm text-white font-black placeholder-white/20 focus:outline-none italic uppercase tracking-tight"
                  />
                  <button 
                      onClick={sendMessage}
                      className="absolute right-3 top-2 bottom-2 bg-cyan-400 hover:bg-cyan-300 px-6 rounded-2xl text-black shadow-lg transition-all active:scale-95 flex items-center justify-center z-20 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                  >
                      <Send size={20} />
                  </button>
            </div>
          )}

          <button 
                onClick={() => setShowGifts(!showGifts)}
                className={`w-16 h-16 crystal-button transition-all pointer-events-auto rounded-[1.5rem] flex items-center justify-center ${showGifts ? 'bg-cyan-400 text-black shadow-[0_0_30px_rgba(34,211,238,0.5)] scale-110' : 'border-white/20 text-white hover:bg-white/10 shadow-2xl'}`}
          >
                <Gift size={28} />
          </button>

          <button 
                onClick={handleShare}
                className="w-16 h-16 liquid-glass transition-all pointer-events-auto rounded-[1.5rem] flex items-center justify-center text-white hover:bg-white/10 shadow-2xl"
          >
                <Share2 size={28} />
          </button>

          <button 
                onClick={leaveChannel}
                className="w-16 h-16 crystal-button border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all pointer-events-auto rounded-[1.5rem] flex items-center justify-center shadow-2xl"
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
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-zinc-950 border-t border-white/10 p-8 rounded-t-[3.5rem] shadow-[0_-30px_80px_rgba(0,0,0,0.9)] max-h-[70vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-cyan-400 italic tracking-[0.3em] uppercase">Wallet Status</span>
                    <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">Support the Host</h4>
                </div>
                <div className="flex items-center gap-3 bg-yellow-500/10 px-5 py-2.5 rounded-2xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                   <CoinsIcon size={18} className="text-yellow-500" />
                   <span className="text-lg font-black text-yellow-500 italic tracking-tighter">{currentUser?.coins || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { type: 'rose', icon: '🌹', cost: 10, label: 'Crystal Rose' },
                  { type: 'lion', icon: '🦁', cost: 500, label: 'Neon Lion' },
                  { type: 'car', icon: '🚗', cost: 1000, label: 'Hypercar' }
                ].map(gift => (
                  <button 
                    key={gift.type}
                    onClick={() => sendGift(gift.type)}
                    className="flex flex-col items-center gap-4 p-5 py-8 bg-white/5 hover:bg-cyan-400/10 rounded-[2.5rem] border border-white/5 hover:border-cyan-400/50 transition-all active:scale-95 group"
                  >
                    <span className="text-5xl transform group-hover:scale-125 transition-transform duration-700 filter drop-shadow-2xl">{gift.icon}</span>
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-white/90 uppercase tracking-widest italic">{gift.label}</p>
                      <div className="flex items-center gap-1.5 justify-center">
                        <CoinsIcon size={12} className="text-yellow-500" />
                        <span className="text-[12px] font-black text-yellow-500 italic">{gift.cost}</span>
                      </div>
                    </div>
                  </button>
                ))}
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
