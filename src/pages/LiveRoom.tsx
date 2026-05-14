import React, { useEffect, useState, useRef } from "react";
import AgoraRTC, { IAgoraRTCClient, IRemoteVideoTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, ArrowLeft, ShieldAlert } from "lucide-react";

// The client should be singleton or managed carefully
let client: IAgoraRTCClient | null = null;

const LiveRoom: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const remoteContainer = useRef<HTMLDivElement>(null);

  const joinRoom = async () => {
    if (!roomId) return;
    setLoading(true);
    setError(null);

    try {
      if (!client) {
        client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      }

      const uid = Math.floor(Math.random() * 1000000);
      const channelName = roomId;
      const appId = import.meta.env.VITE_AGORA_APP_ID || "MOCK_APP_ID";

      // 1. Get Token from backend
      const res = await axios.post("/api/agora/token", {
        channelName,
        uid,
        role: "audience"
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to get Agora token");
      }

      await client.setClientRole("audience");

      // 2. Join channel
      await client.join(appId, channelName, res.data.token, uid);

      // 3. Listen for events
      client.on("user-published", async (user, mediaType) => {
        await client!.subscribe(user, mediaType);
        
        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack;
          if (remoteContainer.current) {
             remoteVideoTrack.play(remoteContainer.current);
          }
        }

        if (mediaType === "audio") {
          const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack;
          remoteAudioTrack.play();
        }
      });

      client.on("user-unpublished", (user) => {
        // Handle user leaving
      });

      setJoined(true);
    } catch (err: any) {
      console.error("Join Room Error:", err);
      setError(err.message || "Failed to join live room");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    joinRoom();
    
    return () => {
      if (client) {
        client.leave();
        // Reset client or keep for next join? 
        // For simplicity in this demo, we'll leave.
      }
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-crystal-void text-white p-6 flex flex-col items-center justify-start pt-12 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none z-0" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="w-full max-w-5xl space-y-12 relative z-10">
        <div className="flex items-center justify-between">
           <button onClick={() => navigate("/")} className="w-14 h-14 crystal-button group">
              <ArrowLeft size={20} className="text-white/40 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all" />
           </button>
           <div className="text-right">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Oracle <span className="text-cyan-400">Stream</span></h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1 italic">Channel ID: {roomId?.slice(0, 8)}...</p>
           </div>
        </div>

        <div className="relative group">
            {/* The Outer Crystal Frame */}
            <div className="absolute -inset-1.5 bg-gradient-to-br from-cyan-400/20 via-white/5 to-blue-500/20 rounded-[3.5rem] blur opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div 
            ref={remoteContainer}
            id="remote-video"
            className="w-full aspect-video bg-black/80 rounded-[3.3rem] border border-white/10 shadow-[0_45px_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex items-center justify-center transition-all duration-700"
            >
            {loading && (
                <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <Loader2 className="animate-spin text-cyan-400" size={56} strokeWidth={1.5} />
                    <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-30 animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400/50 italic animate-pulse">Syncing Neural Link...</p>
                </div>
            )}

            {error && (
                <div className="crystal-glass p-12 rounded-[3.5rem] text-center max-w-lg mx-auto border-rose-500/20">
                <ShieldAlert size={56} className="text-rose-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                <p className="text-lg font-black italic uppercase tracking-tight text-white mb-3 leading-tight">{error}</p>
                <div className="h-px w-12 bg-rose-500/30 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/40 italic">Check Oracle Protocol Configuration</p>
                </div>
            )}

            {!loading && !error && !joined && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-1 bg-white/10 rounded-full animate-pulse" />
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em] italic">Awaiting Host Broadcast Presence...</p>
                </div>
            )}

            {joined && (
                <div className="absolute top-10 left-10 flex items-center gap-4 bg-rose-600 px-5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(225,29,72,0.5)] border border-white/20">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Live Feed</span>
                </div>
            )}

            {/* Technical Overlay */}
            <div className="absolute bottom-10 right-10 flex flex-col items-end gap-3 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Visual Stream</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">4K / 60 FPS</span>
                    </div>
                    <div className="w-1 h-8 bg-cyan-400/50 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Security Hash</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">0x{roomId?.slice(0, 12)}</span>
                    </div>
                    <div className="w-1 h-8 bg-white/20 rounded-full" />
                </div>
            </div>
            </div>
        </div>

        {/* Room Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
            <div className="crystal-glass p-8 rounded-[2.5rem] flex flex-col gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Room Authority</p>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 crystal-button bg-cyan-400/10 border-white/5 shadow-none p-1">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${roomId}`} 
                            className="w-full h-full rounded-2xl opacity-80" 
                            alt="" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black italic uppercase tracking-tighter">Elite Host</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Certified Oracle</span>
                    </div>
                </div>
            </div>
            
            <div className="crystal-glass p-8 rounded-[2.5rem] flex flex-col gap-4 relative overflow-hidden group">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Connection Link</p>
                <div className="flex flex-col">
                    <span className="text-xl font-black italic uppercase tracking-tighter truncate">RTC_{roomId?.slice(0, 8)}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Low Latency Active</span>
                </div>
                <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                    <Loader2 size={120} />
                </div>
            </div>

            <button className="crystal-glass p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-cyan-400 hover:text-black transition-all">
                <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-black/40 italic">Engagement</span>
                    <span className="text-2xl font-black italic uppercase tracking-tighter">Interact</span>
                </div>
                <div className="w-12 h-12 crystal-button bg-white/5 border-white/5 shadow-none group-hover:bg-black group-hover:text-cyan-400">
                    <ArrowLeft size={20} className="rotate-180" />
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default LiveRoom;
