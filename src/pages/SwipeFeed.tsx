import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "motion/react";
import Live from "./Live";
import axios from "axios";

interface LiveRoom {
  id: string | number;
  user: string;
}

interface SwipeFeedProps {
  initialStreamId?: string | null;
}

const SwipeFeed: React.FC<SwipeFeedProps> = ({ initialStreamId }) => {
  const [current, setCurrent] = useState(0);
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      // Fetch live rooms from backend
      axios.get("/api/rec/feed")
        .then(res => {
          if (typeof res.data === "string" && res.data.includes("<!doctype html>")) {
            console.warn("Feed server warming up... retrying");
            setTimeout(fetchData, 3000);
            return;
          }

          const data = Array.isArray(res.data) ? res.data : [];
          setRooms(data);
          
          if (initialStreamId && data.length > 0) {
              const index = data.findIndex((r: any) => String(r.id) === String(initialStreamId));
              if (index !== -1) setCurrent(index);
          }
          
          if (data.length === 0) {
              // Fallback if empty array returned
               setRooms([
                { id: "1", user: "MusicKing" },
                { id: "2", user: "GamingQueen" },
                { id: "3", user: "DanceStar" }
              ]);
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error("Feed fetch failed, using fallback:", err);
          // Fallback to static if API fails during dev
          setRooms([
            { id: "1", user: "MusicKing" },
            { id: "2", user: "GamingQueen" },
            { id: "3", user: "DanceStar" }
          ]);
          setLoading(false);
        });
    };

    fetchData();
  }, [initialStreamId]);

  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (current < rooms.length - 1) {
        setCurrent(current + 1);
      }
    },
    onSwipedDown: () => {
      if (current > 0) {
        setCurrent(current - 1);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  if (loading || rooms.length === 0) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      {...handlers}
      className="w-full h-full overflow-hidden bg-black relative touch-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={rooms[current].id}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="absolute inset-0 w-full h-full"
        >
          <Live userId={rooms[current].user} />
        </motion.div>
      </AnimatePresence>

      {/* Swipe Indicators */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
        {rooms.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-1 transition-all rounded-full ${idx === current ? 'h-6 bg-cyan-400' : 'h-2 bg-white/20'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeFeed;
