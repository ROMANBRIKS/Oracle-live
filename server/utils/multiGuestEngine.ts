import db from "../config/db";

export async function createSeats(roomId: string, maxGuests: number) {
  const stmt = db.prepare("INSERT OR IGNORE INTO guest_seats (room_id, seat_number) VALUES (?, ?)");
  for (let i = 1; i <= maxGuests; i++) {
    stmt.run(roomId, i);
  }
}

export async function joinSeat({ roomId, seatNumber, userId }: { roomId: string, seatNumber: number, userId: string }) {
  // Check if seat is available
  const seat = db.prepare("SELECT * FROM guest_seats WHERE room_id = ? AND seat_number = ?").get(roomId, seatNumber) as any;

  if (!seat || seat.user_id || seat.locked) {
    return null;
  }

  // Update seat
  db.prepare("UPDATE guest_seats SET user_id = ? WHERE room_id = ? AND seat_number = ?").run(userId, roomId, seatNumber);

  // Return full room data
  const room = db.prepare("SELECT * FROM multi_guest_rooms WHERE room_id = ?").get(roomId) as any;
  if (room) {
    room.seats = db.prepare("SELECT * FROM guest_seats WHERE room_id = ? ORDER BY seat_number ASC").all(roomId);
  }

  return room;
}

export async function leaveSeat({ roomId, userId }: { roomId: string, userId: string }) {
  // Clear seat for this user
  db.prepare("UPDATE guest_seats SET user_id = NULL WHERE room_id = ? AND user_id = ?").run(roomId, userId);

  // Return full room data
  const room = await getRoom(roomId);
  return room;
}

export async function getRoom(roomId: string) {
  const room = db.prepare("SELECT * FROM multi_guest_rooms WHERE room_id = ?").get(roomId) as any;
  if (room) {
    room.seats = db.prepare("SELECT * FROM guest_seats WHERE room_id = ? ORDER BY seat_number ASC").all(roomId);
  }
  return room;
}
