import React, { useEffect, useState, useRef } from "react";
import { socket } from "../lib/socket";
import { Send, User as UserIcon, ShieldAlert, Ban, VolumeX } from "lucide-react";
import axios from "axios";

interface Message {
  username: string;
  message: string;
  roomId: string;
  timestamp: number;
}

interface LiveChatProps {
  roomId: string;
  isHost?: boolean;
}

const LiveChat: React.FC<LiveChatProps> = ({ roomId, isHost }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userRes = localStorage.getItem("user");
  const user = userRes ? JSON.parse(userRes) : null;
  const username = user?.username || "Agent";

  useEffect(() => {
    socket.emit("join-room", roomId);

    const handleReceiveMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleUserKicked = (data: any) => {
        if (data.username === username) {
            window.location.href = "/";
        }
        setMessages(prev => [...prev, { username: "SYSTEM", message: `${data.username} has been kicked.`, roomId, timestamp: Date.now() }]);
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("user_kicked", handleUserKicked);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("user_kicked", handleUserKicked);
    };
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;

    socket.emit("send-message", {
      roomId,
      username,
      message,
      timestamp: Date.now(),
    });

    setMessage("");
  };

  const kickUser = async (targetUsername: string) => {
      try {
          await axios.post("/api/moderation/kick", { roomId, username: targetUsername });
          setSelectedUser(null);
      } catch (err) {
          console.error("Kick failed", err);
      }
  };

  const muteUser = async (targetUserId: string, targetUsername: string) => {
      try {
          await axios.post("/api/moderation/mute", { userId: targetUserId, username: targetUsername, roomId });
          setSelectedUser(null);
      } catch (err) {
          console.error("Mute failed", err);
      }
  };

  return (
    <div className="flex flex-col h-full liquid-glass rounded-[2rem] overflow-hidden border-white/5">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase italic tracking-widest text-white/40">Encryption Feed</h3>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <UserIcon size={32} className="mb-2" />
            <p className="text-[9px] font-black uppercase tracking-widest">Secure line established.<br/>Waiting for traffic...</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 relative group">
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={() => isHost && setSelectedUser(msg.username)}
                className={`text-[10px] font-black uppercase italic tracking-tighter transition-colors ${
                  msg.username === username ? 'text-blue-400' : 'text-white/60 hover:text-white'
                } ${msg.username === 'SYSTEM' ? 'text-red-500' : ''}`}
              >
                {msg.username}
              </button>
              <span className="text-[8px] font-mono text-white/20">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className={`text-xs leading-relaxed p-3 rounded-2xl rounded-tl-none border w-fit max-w-[90%] transition-all ${
                msg.username === 'SYSTEM' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500 italic font-bold' 
                    : 'bg-white/5 text-white/80 border-white/5'
            }`}>
              {msg.message}
            </p>

            {/* Admin Controls Overlay */}
            {selectedUser === msg.username && isHost && msg.username !== username && (
                <div className="absolute top-0 right-0 bg-zinc-900 border border-white/10 rounded-xl p-2 z-50 flex gap-2 shadow-2xl animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => muteUser("mock-id", msg.username)}
                        className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30"
                        title="Mute User"
                    >
                        <VolumeX size={14} />
                    </button>
                    <button 
                        onClick={() => kickUser(msg.username)}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                        title="Kick User"
                    >
                        <ShieldAlert size={14} />
                    </button>
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="p-2 bg-white/5 text-white/40 rounded-lg hover:bg-white/10 text-[8px] font-bold uppercase"
                    >
                        X
                    </button>
                </div>
            )}
          </div>
        ))}
      </div>

      <form 
        onSubmit={sendMessage}
        className="p-4 bg-black/40 border-t border-white/5 flex gap-2"
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Inject message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:border-blue-500/50 outline-none transition-all placeholder:text-white/20 uppercase font-black"
        />
        <button
          type="submit"
          className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default LiveChat;
