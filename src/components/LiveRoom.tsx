import { useEffect, useRef, useState } from "react";
import { ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";
import { agoraService } from "@/services/agoraService";
import { Button } from "@/components/ui/button";
import { X, Mic, MicOff, Video, VideoOff } from "lucide-react";

interface LiveRoomProps {
  channelId: string;
  role: "host" | "audience";
  onLeave: () => void;
}

export default function LiveRoom({ channelId, role, onLeave }: LiveRoomProps) {
  const localPlayerRef = useRef<HTMLDivElement>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [localTracks, setLocalTracks] = useState<{ audio: any; video: any } | null>(null);

  useEffect(() => {
    const init = async () => {
      agoraService.onUserPublished(async (user, mediaType) => {
        const track = await agoraService.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prev) => [...prev, user]);
          // We'll need a way to play this track in a specific element
          // For simplicity, we'll handle rendering in the component
        }
      });

      agoraService.onUserUnpublished((user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      const tracks = await agoraService.join(channelId, null, role);
      if (tracks) {
        setLocalTracks(tracks);
        if (localPlayerRef.current) {
          tracks.video.play(localPlayerRef.current);
        }
      }
    };

    init();

    return () => {
      agoraService.leave();
    };
  }, [channelId, role]);

  const toggleAudio = () => {
    if (localTracks) {
      localTracks.audio.setEnabled(isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localTracks) {
      localTracks.video.setEnabled(isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-black/40 backdrop-blur-md absolute top-0 left-0 right-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-orange-500 overflow-hidden bg-slate-800">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${channelId}`} alt="host" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-black uppercase tracking-tighter">{channelId}'s Core</span>
            <div className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Stable Feed</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLeave} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 relative flex items-center justify-center p-2 pt-20 pb-20">
        {/* Local Stream (Host) */}
        {role === "host" && (
          <div ref={localPlayerRef} className="w-full h-full bg-slate-900 border-4 border-orange-600/30 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.1)]" />
        )}

        {/* Remote Streams (Audience viewing host) */}
        {role === "audience" && remoteUsers.length > 0 && (
          <div className="w-full h-full rounded-[32px] overflow-hidden border-4 border-white/5 shadow-2xl">
            <RemoteVideo user={remoteUsers[0]} />
          </div>
        )}

        {role === "audience" && remoteUsers.length === 0 && (
          <div className="text-slate-500 text-center space-y-4">
             <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-xl">
               <Radio className="w-10 h-10 animate-pulse text-orange-500" />
             </div>
             <div className="space-y-1">
               <p className="text-xs font-black uppercase tracking-[0.2em]">Synchronizing Feed</p>
               <p className="text-[10px] opacity-40">Awaiting Signal from Base...</p>
             </div>
          </div>
        )}

        {/* Co-Host Slot Mockup */}
        {role === "host" && (
          <div className="absolute top-24 right-6 w-32 h-44 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 flex flex-col items-center justify-center shadow-2xl scale-90 sm:scale-100">
             <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Guest Link</div>
             <div className="w-10 h-10 rounded-full border border-dashed border-white/30 flex items-center justify-center text-white/50 hover:bg-white/5 cursor-pointer transition-colors">
               <PlusCircle className="w-5 h-5" />
             </div>
             <div className="mt-3 text-[8px] uppercase font-black tracking-tighter opacity-40">Slot Open</div>
          </div>
        )}
      </div>

      {/* Controls */}
      {role === "host" && (
        <div className="p-8 flex items-center justify-center gap-6 absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={toggleAudio}
            className={cn("w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md text-white transition-all active:scale-90", isAudioMuted && "bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/40")}
          >
            {isAudioMuted ? <MicOff /> : <Mic />}
          </Button>
          
          <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center shadow-xl shadow-orange-900/40 border-4 border-white/10 cursor-pointer active:scale-95 transition-transform">
             <div className="w-6 h-6 bg-white rounded-sm" />
          </div>

          <Button 
            variant="secondary" 
            size="icon" 
            onClick={toggleVideo}
            className={cn("w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md text-white transition-all active:scale-90", isVideoMuted && "bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/40")}
          >
            {isVideoMuted ? <VideoOff /> : <Video />}
          </Button>
        </div>
      )}
    </div>
  );
}

function RemoteVideo({ user }: { user: any }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && user.videoTrack) {
      user.videoTrack.play(ref.current);
    }
  }, [user]);

  return <div ref={ref} className="w-full h-full bg-zinc-900" />;
}

import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";
