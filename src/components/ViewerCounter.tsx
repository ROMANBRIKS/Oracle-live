import React, { useEffect, useState } from "react";
import { socket } from "../lib/socket";
import { Eye } from "lucide-react";

interface ViewerCounterProps {
  roomId: string;
}

const ViewerCounter: React.FC<ViewerCounterProps> = ({ roomId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.emit("join-room", roomId);

    const handleViewerCount = (data: { count: number }) => {
      setCount(data.count);
    };

    socket.on("viewer-count", handleViewerCount);

    return () => {
      socket.off("viewer-count", handleViewerCount);
    };
  }, [roomId]);

  return (
    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
      <Eye size={14} className="text-white/60" />
      <span className="text-[11px] font-black font-mono text-white/80">{count}</span>
    </div>
  );
};

export default ViewerCounter;
