import { useState } from "react";
import { Play, Users, PlusCircle, Radio, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LiveRoom from "@/components/LiveRoom";

const DUMMY_LIVES = [
  {
    id: "live1",
    host: "Alice",
    title: "Gaming Marathon! 🎮",
    viewers: "1.2k",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&h=250&fit=crop",
  },
  {
    id: "live2",
    host: "Bob",
    title: "Cooking Live: Best Pasta 🍝",
    viewers: "850",
    thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&h=250&fit=crop",
  },
  {
    id: "live3",
    host: "Charlie",
    title: "Late Night Chatting 🌙",
    viewers: "3.4k",
    thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&h=250&fit=crop",
  },
];

export default function LiveScreen() {
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"host" | "audience">("audience");

  const startLive = () => {
    setActiveChannel("Oracle_Host");
    setUserRole("host");
  };

  const joinLive = (host: string) => {
    setActiveChannel(host);
    setUserRole("audience");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24 relative">
      <AnimatePresence>
        {activeChannel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100]"
          >
            <LiveRoom 
              channelId={activeChannel} 
              role={userRole} 
              onLeave={() => setActiveChannel(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-900/20">O</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Oracle <span className="text-orange-500">Live</span></h1>
        </div>
        <Button 
          onClick={startLive}
          className="bg-orange-600 hover:bg-orange-700 font-black rounded-xl px-6 py-5 uppercase tracking-widest text-xs shadow-lg shadow-orange-900/20"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          GO LIVE
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_LIVES.map((live) => (
          <motion.div
            key={live.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={() => joinLive(live.host)}
          >
            <Card className="bg-slate-900 border border-white/5 overflow-hidden relative group rounded-3xl shadow-2xl">
              <div className="absolute top-3 left-3 z-10 bg-orange-600 text-white text-[8px] font-black px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                <Radio className="w-2 h-2" />
                LIVE
              </div>
              <div className="absolute top-3 right-3 z-10 bg-black/40 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-md border border-white/10">
                <Users className="w-3 h-3 text-orange-400" />
                {live.viewers}
              </div>
              
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={live.thumbnail} 
                  alt={live.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300" />
                </div>
              </div>

              <CardContent className="p-5 bg-gradient-to-b from-slate-900 to-black">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full border border-orange-500 p-0.5 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${live.host}`} alt={live.host} className="w-full h-full rounded-full" />
                  </div>
                  <span className="text-xs font-bold tracking-tight">@{live.host.toLowerCase()}_live</span>
                </div>
                <h3 className="font-bold text-base leading-tight line-clamp-1 text-slate-100">{live.title}</h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
