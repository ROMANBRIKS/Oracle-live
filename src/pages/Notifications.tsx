import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, CheckCircle, XCircle, Clock, 
  ArrowLeft, Trash2, Mail
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const Notifications: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const userRes = localStorage.getItem("user");
  const user = userRes ? JSON.parse(userRes) : null;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/api/notifications/${user.id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await axios.post(`/api/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await axios.post(`/api/notifications/read-all/${user.id}`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'withdrawal': return <ArrowLeft className="text-amber-400" size={18} />;
      case 'gift': return <CheckCircle className="text-emerald-400" size={18} />;
      case 'security': return <XCircle className="text-red-400" size={18} />;
      default: return <Bell className="text-blue-400" size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="w-10 h-10 liquid-glass rounded-2xl flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <button 
            onClick={markAllAsRead}
            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
          >
            Mark all read
          </button>
        </div>

        <h1 className="text-3xl font-black italic tracking-tighter mb-2 uppercase">Intelligence Feed</h1>
        <p className="text-white/40 text-sm mb-8 font-mono">Real-time updates on your capital and activities.</p>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center liquid-glass rounded-[2.5rem] border-dashed">
              <Mail className="mx-auto text-white/10 mb-4" size={40} />
              <p className="text-white/20 text-[10px] font-black uppercase italic tracking-widest">Your inbox is clear, agent.</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`liquid-glass p-5 rounded-[1.8rem] flex gap-4 cursor-pointer transition-all ${
                    n.read ? "opacity-50 grayscale-[0.5]" : "border-white/20 shadow-xl shadow-blue-500/5"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    n.read ? 'bg-white/5' : 'bg-white/10'
                  }`}>
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold text-sm tracking-tight ${n.read ? 'text-white/60' : 'text-white'}`}>
                        {n.title}
                      </h3>
                      {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed mb-2">{n.message}</p>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
