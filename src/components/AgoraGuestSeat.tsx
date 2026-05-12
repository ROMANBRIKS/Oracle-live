import React, { useEffect, useRef, useState } from "react";
import { client } from "../utils/agoraEngine";
import { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { Mic, MicOff, User, MoreVertical } from "lucide-react";
import { motion } from "motion/react";

interface AgoraGuestSeatProps {
  uid: string | number;
  username?: string;
  isMe?: boolean;
}

const AgoraGuestSeat: React.FC<AgoraGuestSeatProps> = ({ uid, username, isMe }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      if (user.uid === uid) {
        setRemoteUser(user);
        await client.subscribe(user, mediaType);
        
        if (mediaType === "video" && videoRef.current) {
          user.videoTrack?.play(videoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
          setIsMuted(false);
        }
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      if (user.uid === uid && mediaType === "audio") {
        setIsMuted(true);
      }
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    // Initial check for existing users
    const existingUser = client.remoteUsers.find(u => u.uid === uid);
    if (existingUser) {
      setRemoteUser(existingUser);
      if (existingUser.hasVideo && videoRef.current) {
        existingUser.videoTrack?.play(videoRef.current);
      }
    }

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
    };
  }, [uid]);

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group aspect-[3/4] w-full bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/5 active:scale-95 transition-transform"
    >
      {/* Video Container */}
      <div 
        ref={videoRef} 
        className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900"
      />

      {/* Placeholder / No Video UI */}
      {!remoteUser?.hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
           <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/10">
              <User size={32} className="text-white/20" />
           </div>
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
         <div className="flex items-center justify-between">
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isMuted ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
               <span className="text-[9px] font-black uppercase tracking-widest text-white/80 truncate w-16">
                  {username || `Guest ${uid.toString().slice(-4)}`}
               </span>
            </div>
            <button className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <MoreVertical size={14} className="text-white/40" />
            </button>
         </div>

         <div className="flex items-center justify-end">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${!isMuted ? 'bg-black/40 border-white/10' : 'bg-red-500 border-red-400/20'}`}>
               {!isMuted ? <Mic size={18} /> : <MicOff size={18} />}
            </div>
         </div>
      </div>

      {/* Me Tag */}
      {isMe && (
        <div className="absolute inset-0 border-2 border-indigo-500 rounded-[2rem] pointer-events-none" />
      )}
    </motion.div>
  );
};

export default AgoraGuestSeat;
