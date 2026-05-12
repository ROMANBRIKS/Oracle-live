import React from "react";

interface GuestSeatProps {
  seat: {
    seat_number: number;
    user_id: string | null;
    mic_muted: boolean;
    camera_off: boolean;
    locked: boolean;
  };
  onJoin: (seatNumber: number) => void;
}

const GuestSeat: React.FC<GuestSeatProps> = ({ seat, onJoin }) => {
  return (
    <div
      onClick={() => !seat.user_id && !seat.locked && onJoin(seat.seat_number)}
      id={`guest-seat-${seat.seat_number}`}
      className={`
        w-[120px] h-[160px] bg-[#1b1b1b] rounded-[20px] flex flex-col justify-center items-center cursor-pointer
        border border-white/8 transition-all hover:border-white/20
        ${seat.locked ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div
        className={`
          w-[60px] h-[60px] rounded-full mb-[10px]
          ${seat.user_id ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-[#333]'}
        `}
      />

      <p className="text-sm text-gray-300">
        {seat.user_id
          ? "Occupied"
          : seat.locked 
            ? "Locked"
            : "Join Seat"}
      </p>
    </div>
  );
};

export default GuestSeat;
