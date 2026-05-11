import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "motion/react";

const socket = io({
  auth: {
    token: localStorage.getItem("token")
  }
});

function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    const handleNotification = (data: any) => {
      setNotifications((prev) => [...prev, data]);

      const timer = setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 4000);
      timers.push(timer);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n, i) => (
          <motion.div
            key={`${n.time}-${i}`}
            initial={{ x: 300, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 300, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="crystal-glass p-4 rounded-2xl w-[280px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-start gap-4 pointer-events-auto border-white/40"
          >
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0 crystal-glow-teal border border-white/50">
              <span className="text-xl">🔔</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Notification</span>
                <span className="text-[9px] text-white/40 font-bold uppercase">Just now</span>
              </div>
              <p className="text-xs text-white font-bold leading-relaxed pr-2">
                {n.message}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Notifications;
