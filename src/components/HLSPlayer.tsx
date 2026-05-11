import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HLSPlayerProps {
  streamUrl: string;
  className?: string;
}

const HLSPlayer: React.FC<HLSPlayerProps> = ({ streamUrl, className = "" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: Hls | null = null;

    if (videoRef.current) {
      if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari/iOS)
        videoRef.current.src = streamUrl;
      } else if (Hls.isSupported()) {
        // Hls.js support
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().catch(e => console.error("HLS Auto-play blocked", e));
        });
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={`w-full h-full object-cover ${className}`}
    />
  );
};

export default HLSPlayer;
