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
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
           <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Feed</span>
           </button>
           <h2 className="text-xl font-black italic uppercase tracking-tighter">Oracle Live Room</h2>
        </div>

        <div 
          ref={remoteContainer}
          id="remote-video"
          className="w-full aspect-video bg-zinc-900 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center"
        >
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-cyan-500" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Establishing RTC Link...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center max-w-md mx-auto">
               <ShieldAlert size={40} className="text-red-500 mx-auto mb-4" />
               <p className="text-sm font-bold text-red-400 mb-2">{error}</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Ensure Agora credentials are configured.</p>
            </div>
          )}

          {!loading && !error && !joined && (
             <p className="text-white/20 text-xs font-black uppercase tracking-widest italic">Waiting for host to broadcast...</p>
          )}

          {joined && (
             <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveRoom;
