import React, { useEffect, useState } from "react";
import axios from "axios";
import GuestSeat from "../components/GuestSeat";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Video, Mic, Shield, ChevronLeft } from "lucide-react";

interface Seat {
  seat_number: number;
  user_id: string | null;
  mic_muted: boolean;
  camera_off: boolean;
  locked: boolean;
}

interface Room {
  room_id: string;
  host_id: string;
  title: string;
  type: string;
  max_guests: number;
  seats: Seat[];
}

const MultiGuestRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRoom = async () => {
    try {
      const targetRoomId = roomId || "sample-room";
      const res = await axios.get(`/api/multi-guest/${targetRoomId}`);
      setRoom(res.data);
    } catch (err) {
      console.error("Failed to load room", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const joinSeat = async (seatNumber: number) => {
    const userStr = localStorage.getItem("user");
    if (!userStr || !room) return;
    
    const user = JSON.parse(userStr);
    
    try {
      const res = await axios.post("/api/multi-guest/join-seat", {
        roomId: room.room_id,
        seatNumber,
        userId: user.id,
      });

      if (res.data.success) {
        setRoom(res.data.room);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to join seat");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-400 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Synchronizing Engine...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Room Not Found</h2>
        <button onClick={() => navigate("/")} className="bg-white text-black px-6 py-2 rounded-full">Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">{room.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <Shield size={10} className="text-emerald-500" /> Host: {room.host_id.substring(0, 8)}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <Users size={10} className="text-indigo-500" /> {room.seats.filter(s => s.user_id).length}/{room.max_guests} Guests
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-red-500 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Live Room</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 place-items-center">
          {room.seats.map((seat) => (
            <GuestSeat
              key={seat.seat_number}
              seat={seat}
              onJoin={joinSeat}
            />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Video className="text-indigo-400" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-indigo-300">Phase 5.4 Active</h3>
            <p className="text-sm text-indigo-200/60 mt-1">
              Multi-Guest architecture enabled. This room supports up to {room.max_guests} participants with synchronized seat management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiGuestRoom;
