import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { joinAsHost, leaveChannel } from "../utils/agoraEngine";
import axios from "axios";
import { 
  X, 
  Activity,
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Users, 
  MessageSquare, 
  Gift, 
  Share2, 
  Settings,
  MoreHorizontal,
  Flame,
  Star,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const StreamerLivePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [loading, setLoading] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [clipProgress, setClipProgress] = useState(0);
  const [showClipSuccess, setShowClipSuccess] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<{ micTrack: any, cameraTrack: any } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  const startStream = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const uid = user ? Number(user.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000000) : Math.floor(Math.random() * 1000000);
      const channelName = roomId || "main-stream";

      const tokenRes = await axios.post("/api/agora/token", {
        channelName,
        uid,
        role: "host"
      });

      const { token } = tokenRes.data;

      const tracks = await joinAsHost({
        channel: channelName,
        token,
        uid
      });

      tracksRef.current = tracks;

      if (videoRef.current) {
        tracks.cameraTrack.play(videoRef.current);
      }

      setLoading(false);
    } catch (err) {
      console.error("Stream initialization failed:", err);
      // Fallback for demo if Agora fails
      setLoading(false);
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      if (tracksRef.current) {
        tracksRef.current.micTrack.stop();
        tracksRef.current.micTrack.close();
        tracksRef.current.cameraTrack.stop();
        tracksRef.current.cameraTrack.close();
      }
      leaveChannel();
    };
  }, [roomId]);

  const toggleMic = () => {
    if (tracksRef.current) {
      tracksRef.current.micTrack.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (tracksRef.current) {
      tracksRef.current.cameraTrack.setEnabled(!videoOn);
      setVideoOn(!videoOn);
    }
  };

  const endStream = () => {
    if (window.confirm("Are you sure you want to end the stream?")) {
      navigate("/");
    }
  };

  const captureClip = async () => {
    if (isRecordingClip || !tracksRef.current) return;

    try {
      setIsRecordingClip(true);
      setClipProgress(0);
      chunksRef.current = [];

      // Get the media stream from Agora tracks
      const videoTrack = tracksRef.current.cameraTrack.getMediaStreamTrack();
      const audioTrack = tracksRef.current.micTrack.getMediaStreamTrack();
      const stream = new MediaStream([videoTrack, audioTrack]);

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('video', blob, 'clip.webm');
        formData.append('roomId', roomId || 'unknown');
        formData.append('title', `Highlight from ${roomId}`);
        formData.append('duration', '15');

        try {
          await axios.post('/api/clips/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setShowClipSuccess(true);
          setTimeout(() => setShowClipSuccess(false), 3000);
        } catch (err) {
          console.error("Clip upload failed:", err);
        }
        setIsRecordingClip(false);
      };

      recorder.start();

      // Tracking progress for 15 seconds
      const duration = 15000;
      const interval = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += interval;
        setClipProgress((elapsed / duration) * 100);
        if (elapsed >= duration) {
          clearInterval(timer);
          recorder.stop();
        }
      }, interval);

    } catch (err) {
      console.error("Clip capture failed:", err);
      setIsRecordingClip(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background Video Layer */}
      <div 
        ref={videoRef} 
        className="absolute inset-0 bg-zinc-900 flex items-center justify-center"
      >
        {loading && (
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Initializing Broadcast...</p>
          </div>
        )}
        {!videoOn && !loading && (
           <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center">
                 <VideoOff size={40} className="text-white/20" />
              </div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Camera Disabled</p>
           </div>
        )}
      </div>

      {/* UI Overlays */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
        {/* Top Bar */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 pointer-events-auto">
             <div className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 p-0.5 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${roomId}`} alt="streamer" className="w-full h-full rounded-[0.8rem] object-cover" />
             </div>
             <div>
                <h3 className="text-sm font-black italic tracking-tighter uppercase truncate w-32">@{roomId || 'Streamer'}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">LIVE: 14:02s</span>
                </div>
             </div>
             
             <div className="px-4 py-2 rounded-2xl bg-indigo-600/90 backdrop-blur-md border border-indigo-500/30 flex items-center gap-2">
                <Flame size={12} className="text-white animate-bounce" />
                <span className="text-[10px] font-black tracking-widest">2.4K</span>
             </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
             <button className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                <Settings size={18} />
             </button>
             <button 
               onClick={endStream}
               className="px-6 py-2.5 rounded-xl bg-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
             >
                End Stream
             </button>
          </div>
        </div>

        {/* Middle Placeholder for stream events/interactions */}
        <div className="flex-1 flex items-center justify-end">
           {/* Floating Stream Stats */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-black/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 space-y-6"
           >
              <div className="text-center">
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Total Gifts</p>
                 <div className="flex items-center gap-2 justify-center">
                    <Gift size={14} className="text-indigo-400" />
                    <span className="text-xl font-black italic tracking-tighter">1.2M</span>
                 </div>
              </div>
              <div className="w-full h-px bg-white/5" />
              <div className="text-center">
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">New Fans</p>
                 <div className="flex items-center gap-2 justify-center">
                    <Star size={14} className="text-amber-500" />
                    <span className="text-xl font-black italic tracking-tighter">+482</span>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Bottom Bar Tools */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 pointer-events-auto">
              <button 
                onClick={toggleMic}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${micOn ? 'bg-black/40 border-white/10' : 'bg-red-500 border-red-500 shadow-lg shadow-red-500/20'}`}
              >
                 {micOn ? <Mic size={24} /> : <MicOff size={24} />}
              </button>
              <button 
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${videoOn ? 'bg-black/40 border-white/10' : 'bg-red-500 border-red-500 shadow-lg shadow-red-500/20'}`}
              >
                 {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
              </button>
           </div>

           <div className="flex items-center gap-4 pointer-events-auto">
              <div className="flex -space-x-3">
                 {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-zinc-800">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=viewer${i}`} alt="viewer" />
                    </div>
                 ))}
                 <div className="w-10 h-10 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center text-[10px] font-black">
                    +42
                 </div>
              </div>
              <button className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-110 active:scale-95 transition-all">
                 <MessageSquare size={24} />
              </button>
              <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                 <Share2 size={24} />
              </button>
              <button 
                onClick={captureClip}
                disabled={isRecordingClip}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all relative overflow-hidden ${isRecordingClip ? 'bg-indigo-600 border-indigo-500' : 'bg-black/40 border-white/10 hover:bg-white/10'}`}
              >
                 {isRecordingClip ? (
                    <>
                       <div className="absolute inset-0 bg-indigo-400/20" style={{ height: `${100 - clipProgress}%`, top: 0 }} />
                       <div className="z-10 animate-pulse text-[10px] font-black italic">REC</div>
                    </>
                 ) : (
                    <Zap size={24} />
                 )}
              </button>

           </div>
        </div>
      </div>

      {/* Cinematic Borders */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

      {/* Clip Success Toast */}
      <AnimatePresence>
         {showClipSuccess && (
            <motion.div 
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 z-50 border border-indigo-400/30"
            >
               <Zap size={20} className="fill-white" />
               <span className="text-xs font-black uppercase tracking-widest italic">15s Highlight Saved to Archive</span>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default StreamerLivePage;
