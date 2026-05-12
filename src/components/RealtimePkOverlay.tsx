import React, { useEffect, useState } from "react";
import socket from "../socket/socket";

interface RealtimePkOverlayProps {
  roomId: string;
}

const RealtimePkOverlay: React.FC<RealtimePkOverlayProps> = ({ roomId }) => {
  const [scores, setScores] = useState({
    a: 0,
    b: 0,
  });

  useEffect(() => {
    socket.on("pk-updated", (payload: any) => {
      if (payload.roomId === roomId) {
        setScores({
          a: payload.scoreA || 0,
          b: payload.scoreB || 0,
        });
      }
    });

    return () => {
      socket.off("pk-updated");
    };
  }, [roomId]);

  return (
    <div className="absolute top-5 left-0 w-full flex justify-center gap-5 pointer-events-none z-50">
      <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/20 px-6 py-2 rounded-2xl backdrop-blur-xl">
        <span className="text-red-500 font-black italic tracking-tighter text-xl">🔴 {scores.a}</span>
      </div>
      <div className="flex items-center gap-3 bg-indigo-500/20 border border-indigo-500/20 px-6 py-2 rounded-2xl backdrop-blur-xl">
        <span className="text-indigo-400 font-black italic tracking-tighter text-xl">🔵 {scores.b}</span>
      </div>
    </div>
  );
};

export default RealtimePkOverlay;
