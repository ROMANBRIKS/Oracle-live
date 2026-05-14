import React, { useEffect, useState, useRef } from "react";
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack, ICameraVideoTrack } from "agora-rtc-sdk-ng";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, ArrowLeft, Camera, Mic, MicOff, CameraOff, Power, ShieldAlert, Shield, MessageSquare } from "lucide-react";
import LiveChat from "../components/LiveChat";
import LiveModerationPanel from "../components/LiveModerationPanel";

let client: IAgoraRTCClient | null = null;

const HostLiveRoom: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  const [audioTrack, setAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // Mock users for moderation demo
  const [users] = useState([
    { id: "user_1", username: "LavaFlow_99" },
    { id: "user_2", username: "CyberGhost_X" },
    { id: "user_3", username: "NeonRebel" }
  ]);

  const localVideoRef = useRef<HTMLDivElement>(null);

  const startStream = async () => {
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

      // 1. Get Token
      const res = await axios.post("/api/agora/token", {
        channelName,
        uid,
        role: "host"
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to get Agora token");
      }

      await client.setClientRole("host");

      // 2. Join
      await client.join(appId, channelName, res.data.token, uid);

      // 3. Create Tracks
      const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setAudioTrack(audio);
      setVideoTrack(video);

      // 4. Publish
      await client.publish([audio, video]);

      // 5. Play Local
      if (localVideoRef.current) {
        video.play(localVideoRef.current);
      }

      setStreaming(true);
    } catch (err: any) {
      console.error("Start Stream Error:", err);
      setError(err.message || "Failed to start live stream. Check camera/mic permissions.");
    } finally {
      setLoading(false);
    }
  };

  const endStream = async () => {
    if (audioTrack) {
        audioTrack.stop();
        audioTrack.close();
    }
    if (videoTrack) {
        videoTrack.stop();
        videoTrack.close();
    }
    if (client) {
        await client.leave();
    }
    setStreaming(false);
    navigate("/dashboard");
  };

  const handleModeration = (type: string, user: any) => {
    console.log(`MODERATION: ${type} user ${user.username}`);
    // These actions are handled in LiveChat via socket/axios, 
    // but the panel can also trigger them.
  };

  const toggleMic = async () => {
    if (audioTrack) {
        await audioTrack.setEnabled(!micOn);
        setMicOn(!micOn);
    }
  };

  const toggleCam = async () => {
    if (videoTrack) {
        await videoTrack.setEnabled(!camOn);
        setCamOn(!camOn);
    }
  };

  useEffect(() => {
    startStream();

    return () => {
        if (client) {
            client.leave();
        }
        if (audioTrack) {
            audioTrack.close();
        }
        if (videoTrack) {
            videoTrack.close();
        }
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
       {/* Top Bar */}
       <header className="p-6 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/5 z-20">
          <div className="flex items-center gap-4">
             <button onClick={endStream} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="text-xl font-black italic uppercase tracking-tighter">Live Studio</h1>
                <p className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Broadcasting to Room: {roomId}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-3 py-1.5 bg-red-600 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
             </div>
             <button onClick={endStream} className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic tracking-widest">
                End Stream
             </button>
          </div>
       </header>

       {/* Main Stage */}
       <main className="flex-1 relative bg-zinc-950 flex p-6 gap-6">
          <div className="flex-1 relative">
            <div 
               ref={localVideoRef}
               className="w-full h-full bg-black rounded-[4rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden"
            >
               {(!streaming || loading) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 space-y-4">
                     <Loader2 size={48} className="text-cyan-500 animate-spin" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Initializing Broadcast Hardware...</p>
                  </div>
               )}

               {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-10 text-center">
                     <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                        <ShieldAlert size={32} className="text-red-500" />
                     </div>
                     <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-red-500">Hardware Error</h2>
                     <p className="text-white/40 text-sm max-w-xs mx-auto mb-8 font-bold italic">{error}</p>
                     <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Try Again
                     </button>
                  </div>
               )}
            </div>

            {/* Floating Controls */}
            {streaming && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl z-30">
                 <ControlButton 
                    active={micOn} 
                    onClick={toggleMic} 
                    icon={micOn ? <Mic size={22} /> : <MicOff size={22} />} 
                 />
                 <ControlButton 
                    active={camOn} 
                    onClick={toggleCam} 
                    icon={camOn ? <Camera size={22} /> : <CameraOff size={22} />} 
                 />
                 <div className="w-px h-10 bg-white/10 mx-2" />
                 <ControlButton 
                    active={isModerationOpen}
                    onClick={() => setIsModerationOpen(!isModerationOpen)}
                    icon={<Shield size={22} />}
                 />
                 <ControlButton 
                    active={isChatOpen}
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    icon={<MessageSquare size={22} />}
                 />
                 <div className="w-px h-10 bg-white/10 mx-2" />
                 <button 
                    onClick={endStream}
                    className="w-14 h-14 rounded-3xl bg-red-600 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
                 >
                    <Power size={22} />
                 </button>
              </div>
            )}
          </div>

          {/* Side Panels */}
          <div className="w-80 flex flex-col gap-6">
            {isChatOpen && roomId && (
              <div className="flex-1">
                <LiveChat roomId={roomId} isHost={true} />
              </div>
            )}
            {isModerationOpen && (
              <LiveModerationPanel 
                users={users} 
                onMute={(u) => handleModeration('mute', u)} 
                onKick={(u) => handleModeration('kick', u)} 
                onBan={(u) => handleModeration('ban', u)} 
                onShadowBan={(u) => handleModeration('shadow_ban', u)} 
              />
            )}
          </div>
       </main>

       {/* Floating Stats */}
       <div className="fixed left-10 top-1/2 -translate-y-1/2 space-y-4">
          <div className="w-14 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center animate-in slide-in-from-left duration-500">
             <span className="text-[10px] font-black italic">142</span>
             <span className="text-[7px] font-black uppercase text-white/30 tracking-widest">Fans</span>
          </div>
          <div className="w-14 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center animate-in slide-in-from-left duration-500 delay-100">
             <span className="text-[10px] font-black italic">8.4K</span>
             <span className="text-[7px] font-black uppercase text-white/30 tracking-widest">Coins</span>
          </div>
       </div>
    </div>
  );
};

const ControlButton = ({ active, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${
        active 
        ? "bg-white/10 text-white hover:bg-white/20" 
        : "bg-red-500/20 text-red-500 border border-red-500/20"
    }`}
  >
    {icon}
  </button>
);

export default HostLiveRoom;
