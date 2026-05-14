import React, { useEffect, useState, useRef } from "react";
import { socket } from "../lib/socket";
import { Send, User as UserIcon, ShieldAlert, Ban, VolumeX, MessageCircle } from "lucide-react";
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
    let userData = null;
    try {
      const userRes = localStorage.getItem("user");
      userData = userRes ? JSON.parse(userRes) : null;
    } catch (e) {
      console.warn("Failed to parse user from localStorage");
    }

    if (!roomId) return;

    socket.emit("join-room", {
      roomId,
      userId: userData?.id || "guest",
    });

    const handleReceiveMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleUserKicked = (data: any) => {
        if (data.userId === user?.id || data.username === username) {
            window.location.href = "/";
        }
        setMessages(prev => [...prev, { username: "SYSTEM", message: `${data.username || 'A user'} has been kicked.`, roomId, timestamp: Date.now() } as any]);
    };

    const handleModerationAction = (data: any) => {
        if (data.action === 'mute' && (data.targetUserId === user?.id || data.username === username)) {
            setMessages(prev => [...prev, { username: "SYSTEM", message: "You have been muted by a moderator.", roomId, timestamp: Date.now() } as any]);
        }
        if (data.action === 'ban' && (data.targetUserId === user?.id || data.username === username)) {
            window.location.href = "/";
        }
    };

    const handleModerationWarning = (data: any) => {
        setMessages(prev => [...prev, { username: "SYSTEM", message: data.message, roomId, timestamp: Date.now() } as any]);
    };

    const handleSpamAlert = (data: any) => {
        setMessages(prev => [...prev, { username: "SYSTEM", message: `Auto-Mod: Spam detected from user ${data.userId || ''}`, roomId, timestamp: Date.now() } as any]);
    };

    const handleRaidAlert = (data: any) => {
        setMessages(prev => [...prev, { username: "SYSTEM", message: `🚨 ${data.message}`, roomId, timestamp: Date.now() } as any]);
    };

    socket.on("new-message", handleReceiveMessage);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("user_kicked", handleUserKicked);
    socket.on("live-moderation-action", handleModerationAction);
    socket.on("moderation-warning", handleModerationWarning);
    socket.on("spam-alert", handleSpamAlert);
    socket.on("raid-alert", handleRaidAlert);

    return () => {
      socket.off("new-message", handleReceiveMessage);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("user_kicked", handleUserKicked);
      socket.off("live-moderation-action", handleModerationAction);
      socket.off("moderation-warning", handleModerationWarning);
      socket.off("spam-alert", handleSpamAlert);
      socket.off("raid-alert", handleRaidAlert);
    };
  }, [roomId, username, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;

    // We now rely on the server-side moderation in socketServer.ts
    // which checks toxicity and spam and emits "moderation-warning" if flagged.
    socket.emit("send-message", {
      roomId,
      userId: user?.id,
      username,
      message: message.trim(),
      timestamp: Date.now(),
    });

    setMessage("");
  };

  const kickUser = async (targetUsername: string) => {
      try {
          await axios.post("/api/live-moderation/kick", { 
            roomId, 
            targetUserId: "mock-id", // In a real app we'd have the ID
            moderatorId: user?.id,
            reason: "Kicked by host" 
          });
          socket.emit("moderator-action", { roomId, action: 'kick', username: targetUsername });
          setSelectedUser(null);
      } catch (err) {
          console.error("Kick failed", err);
      }
  };

  const muteUser = async (targetUserId: string, targetUsername: string) => {
      try {
          await axios.post("/api/live-moderation/mute", { 
            roomId, 
            targetUserId, 
            moderatorId: user?.id,
            durationMinutes: 10
          });
          socket.emit("moderator-action", { roomId, action: 'mute', targetUserId, username: targetUsername });
          setSelectedUser(null);
      } catch (err) {
          console.error("Mute failed", err);
      }
  };

  const banUser = async (targetUserId: string, targetUsername: string) => {
    try {
        await axios.post("/api/live-moderation/ban", { 
          roomId, 
          targetUserId, 
          moderatorId: user?.id
        });
        socket.emit("moderator-action", { roomId, action: 'ban', targetUserId, username: targetUsername });
        setSelectedUser(null);
    } catch (err) {
        console.error("Ban failed", err);
    }
};

  return (
    <div className="flex flex-col h-full liquid-glass rounded-[2.5rem] overflow-hidden border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase italic tracking-[0.4em] text-cyan-400">Thought_Stream</h3>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">Secure_Protocol_V9</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Syncing</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-5 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
            <MessageCircle size={40} className="mb-4 text-cyan-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Neural link established.<br/>Waiting for synchronization...</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-500 relative group">
            <div className="flex items-center gap-2 mb-1.5">
              <button 
                onClick={() => isHost && setSelectedUser(msg.username)}
                className={`text-[10px] font-black uppercase italic tracking-widest transition-all ${
                  msg.username === username ? 'text-cyan-400' : 'text-white/40 hover:text-white'
                } ${msg.username === 'SYSTEM' ? 'text-rose-500' : ''}`}
              >
                {msg.username === username ? 'YOU' : msg.username}
              </button>
              <div className="w-1 h-1 bg-white/10 rounded-full" />
              <span className="text-[8px] font-black text-white/10 uppercase italic">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className={`p-4 rounded-[1.5rem] rounded-tl-none border shadow-2xl transition-all relative overflow-hidden backdrop-blur-md ${
                msg.username === 'SYSTEM' 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 italic font-black text-[10px] uppercase tracking-tighter' 
                    : 'bg-white/[0.03] text-white/90 border-white/5 group-hover:border-cyan-400/20'
            }`}>
                <p className="text-xs leading-relaxed font-medium relative z-10">
                    {msg.message}
                </p>
                {/* Subtle Glow for own messages */}
                {msg.username === username && (
                    <div className="absolute inset-0 bg-cyan-400/5 pointer-events-none" />
                )}
            </div>

            {/* Admin Controls Overlay */}
            {selectedUser === msg.username && isHost && msg.username !== username && (
                <div className="absolute top-0 right-0 crystal-glass border-white/20 rounded-2xl p-2 z-50 flex gap-2 shadow-2xl animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => muteUser("mock-id", msg.username)}
                        className="w-10 h-10 crystal-button text-yellow-500 border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-all"
                        title="Mute User"
                    >
                        <VolumeX size={16} />
                    </button>
                    <button 
                        onClick={() => kickUser(msg.username)}
                        className="w-10 h-10 crystal-button text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                        title="Kick User"
                    >
                        <ShieldAlert size={16} />
                    </button>
                    <button 
                        onClick={() => banUser("mock-id", msg.username)}
                        className="w-10 h-10 crystal-button text-rose-600 border-rose-600/20 hover:bg-rose-600 hover:text-white transition-all"
                        title="Ban User"
                    >
                        <Ban size={16} />
                    </button>
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="w-10 h-10 crystal-button border-white/10 text-white hover:bg-white/10"
                    >
                        <span className="text-[10px] font-black">X</span>
                    </button>
                </div>
            )}
          </div>
        ))}
      </div>

      <form 
        onSubmit={sendMessage}
        className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3"
      >
        <div className="flex-1 relative group">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="INJECT_COMMUNICATION..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:border-cyan-400/50 outline-none transition-all placeholder:text-white/10 uppercase font-black italic tracking-widest"
          />
          <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
        </div>
        <button
          type="submit"
          className="w-14 h-14 crystal-button bg-cyan-400 text-black border-none hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center"
        >
          <Send size={22} className="fill-current" />
        </button>
      </form>
    </div>
  );
};

export default LiveChat;
